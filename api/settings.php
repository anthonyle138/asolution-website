<?php
// ============================================
// RAFFLE SETTINGS API
// ============================================

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDBConnection();

// GET - Retrieve current raffle settings
if ($method === 'GET') {
    try {
        $stmt = $db->query("SELECT * FROM raffle_settings ORDER BY id DESC LIMIT 1");
        $settings = $stmt->fetch();

        if ($settings) {
            // Update status based on current time
            $now = new DateTime();
            $start = new DateTime($settings['start_time']);
            $end = new DateTime($settings['end_time']);

            $status = 'not_started';
            if ($now >= $start && $now < $end) {
                $status = 'active';
            } elseif ($now >= $end) {
                $status = 'ended';
            }

            // Update status in database if changed
            if ($status !== $settings['status']) {
                $updateStmt = $db->prepare("UPDATE raffle_settings SET status = ? WHERE id = ?");
                $updateStmt->execute([$status, $settings['id']]);
                $settings['status'] = $status;
            }

            sendJSON($settings);
        } else {
            sendJSON(null);
        }
    } catch (PDOException $e) {
        error_log("Settings GET error: " . $e->getMessage());
        sendError('Failed to retrieve settings', 500);
    }
}

// POST - Create or update raffle settings
elseif ($method === 'POST') {
    try {
        $data = getRequestBody();

        // Validation
        if (empty($data['title']) || empty($data['start_time']) || empty($data['end_time']) || empty($data['winner_count'])) {
            sendError('Missing required fields');
        }

        $title = sanitizeInput($data['title']);
        $start_time = sanitizeInput($data['start_time']);
        $end_time = sanitizeInput($data['end_time']);
        $winner_count = (int)$data['winner_count'];

        // Validate dates
        $start = new DateTime($start_time);
        $end = new DateTime($end_time);
        $now = new DateTime();

        if ($end <= $start) {
            sendError('End time must be after start time');
        }

        // Determine initial status
        $status = 'not_started';
        if ($now >= $start && $now < $end) {
            $status = 'active';
        } elseif ($now >= $end) {
            $status = 'ended';
        }

        // Check if settings exist
        $stmt = $db->query("SELECT id FROM raffle_settings ORDER BY id DESC LIMIT 1");
        $existing = $stmt->fetch();

        if ($existing) {
            // Update existing settings
            $stmt = $db->prepare("UPDATE raffle_settings SET title = ?, start_time = ?, end_time = ?, winner_count = ?, status = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$title, $start_time, $end_time, $winner_count, $status, $existing['id']]);
            $id = $existing['id'];
        } else {
            // Insert new settings
            $stmt = $db->prepare("INSERT INTO raffle_settings (title, start_time, end_time, winner_count, status) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$title, $start_time, $end_time, $winner_count, $status]);
            $id = $db->lastInsertId();
        }

        // Fetch and return updated settings
        $stmt = $db->prepare("SELECT * FROM raffle_settings WHERE id = ?");
        $stmt->execute([$id]);
        $settings = $stmt->fetch();

        sendJSON($settings);
    } catch (PDOException $e) {
        error_log("Settings POST error: " . $e->getMessage());
        sendError('Failed to save settings', 500);
    }
}

// Invalid method
else {
    sendError('Method not allowed', 405);
}
