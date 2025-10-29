<?php
// ============================================
// RAFFLE ENTRIES API
// ============================================

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDBConnection();

// GET - Retrieve all entries
if ($method === 'GET') {
    try {
        $stmt = $db->query("SELECT id, name, email, phone, submitted_from, created_at FROM raffle_entries ORDER BY created_at DESC");
        $entries = $stmt->fetchAll();

        sendJSON($entries);
    } catch (PDOException $e) {
        error_log("Entries GET error: " . $e->getMessage());
        sendError('Failed to retrieve entries', 500);
    }
}

// POST - Add new entry
elseif ($method === 'POST') {
    try {
        $data = getRequestBody();

        // Validation
        if (empty($data['name']) || empty($data['email'])) {
            sendError('Name and email are required');
        }

        $name = sanitizeInput($data['name']);
        $email = sanitizeInput($data['email']);
        $phone = isset($data['phone']) ? sanitizeInput($data['phone']) : null;
        $submittedFrom = isset($data['submitted_from']) ? sanitizeInput($data['submitted_from']) : 'public';

        // Validate email
        if (!validateEmail($email)) {
            sendError('Invalid email address');
        }

        // Check for duplicate email
        $stmt = $db->prepare("SELECT id FROM raffle_entries WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            sendError('This email has already been entered in the raffle');
        }

        // Check if raffle is active (for public submissions)
        if ($submittedFrom === 'public') {
            $stmt = $db->query("SELECT status FROM raffle_settings ORDER BY id DESC LIMIT 1");
            $settings = $stmt->fetch();

            if (!$settings || $settings['status'] !== 'active') {
                sendError('Raffle is not currently accepting entries');
            }
        }

        // Insert entry
        $ip = getClientIP();
        $userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : null;

        $stmt = $db->prepare("INSERT INTO raffle_entries (name, email, phone, submitted_from, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$name, $email, $phone, $submittedFrom, $ip, $userAgent]);

        $entryId = $db->lastInsertId();

        // Fetch and return the new entry
        $stmt = $db->prepare("SELECT id, name, email, phone, submitted_from, created_at FROM raffle_entries WHERE id = ?");
        $stmt->execute([$entryId]);
        $entry = $stmt->fetch();

        sendJSON($entry, 201);
    } catch (PDOException $e) {
        error_log("Entries POST error: " . $e->getMessage());
        sendError('Failed to add entry', 500);
    }
}

// DELETE - Remove entry
elseif ($method === 'DELETE') {
    try {
        // Get entry ID from query string or request body
        $entryId = isset($_GET['id']) ? (int)$_GET['id'] : null;

        if (!$entryId) {
            $data = getRequestBody();
            $entryId = isset($data['id']) ? (int)$data['id'] : null;
        }

        if (!$entryId) {
            sendError('Entry ID is required');
        }

        $stmt = $db->prepare("DELETE FROM raffle_entries WHERE id = ?");
        $stmt->execute([$entryId]);

        if ($stmt->rowCount() > 0) {
            sendJSON(['success' => true, 'message' => 'Entry deleted']);
        } else {
            sendError('Entry not found', 404);
        }
    } catch (PDOException $e) {
        error_log("Entries DELETE error: " . $e->getMessage());
        sendError('Failed to delete entry', 500);
    }
}

// Invalid method
else {
    sendError('Method not allowed', 405);
}
