<?php
// ============================================
// RAFFLE WINNERS API
// ============================================

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDBConnection();

// GET - Retrieve winners
if ($method === 'GET') {
    try {
        $publishedOnly = isset($_GET['published']) && $_GET['published'] === 'true';

        $sql = "SELECT w.*, e.name, e.email, e.phone
                FROM raffle_winners w
                INNER JOIN raffle_entries e ON w.entry_id = e.id";

        if ($publishedOnly) {
            $sql .= " WHERE w.published = 1";
        }

        $sql .= " ORDER BY w.rank ASC";

        $stmt = $db->query($sql);
        $winners = $stmt->fetchAll();

        // Get draw information
        $drawInfo = null;
        if (!empty($winners)) {
            $stmt = $db->query("SELECT COUNT(*) as total_entries FROM raffle_entries");
            $entryCount = $stmt->fetch();

            $drawInfo = [
                'total_entries' => $entryCount['total_entries'],
                'winner_count' => count($winners),
                'drawn_at' => $winners[0]['drawn_at']
            ];
        }

        sendJSON([
            'winners' => $winners,
            'draw_info' => $drawInfo
        ]);
    } catch (PDOException $e) {
        error_log("Winners GET error: " . $e->getMessage());
        sendError('Failed to retrieve winners', 500);
    }
}

// POST - Draw winners
elseif ($method === 'POST') {
    try {
        $data = getRequestBody();
        $action = isset($data['action']) ? $data['action'] : null;

        // DRAW WINNERS ACTION
        if ($action === 'draw') {
            // Get settings
            $stmt = $db->query("SELECT * FROM raffle_settings ORDER BY id DESC LIMIT 1");
            $settings = $stmt->fetch();

            if (!$settings) {
                sendError('Raffle settings not found');
            }

            // Check if raffle has ended
            $now = new DateTime();
            $endTime = new DateTime($settings['end_time']);

            if ($now < $endTime) {
                sendError('Raffle has not ended yet');
            }

            // Get all entries
            $stmt = $db->query("SELECT id FROM raffle_entries ORDER BY RAND() LIMIT " . $settings['winner_count']);
            $selectedEntries = $stmt->fetchAll();

            if (empty($selectedEntries)) {
                sendError('No entries found');
            }

            if (count($selectedEntries) < $settings['winner_count']) {
                sendError('Not enough entries to select ' . $settings['winner_count'] . ' winners');
            }

            // Clear any unpublished winners
            $db->exec("DELETE FROM raffle_winners WHERE published = 0");

            // Insert new winners (unpublished)
            $stmt = $db->prepare("INSERT INTO raffle_winners (entry_id, rank, published) VALUES (?, ?, 0)");

            foreach ($selectedEntries as $index => $entry) {
                $rank = $index + 1;
                $stmt->execute([$entry['id'], $rank]);
            }

            // Fetch the drawn winners with entry details
            $stmt = $db->query("SELECT w.*, e.name, e.email, e.phone
                               FROM raffle_winners w
                               INNER JOIN raffle_entries e ON w.entry_id = e.id
                               WHERE w.published = 0
                               ORDER BY w.rank ASC");
            $winners = $stmt->fetchAll();

            sendJSON([
                'action' => 'draw',
                'winners' => $winners,
                'message' => 'Winners drawn successfully (not yet published)'
            ]);
        }

        // PUBLISH WINNERS ACTION
        elseif ($action === 'publish') {
            // Mark all unpublished winners as published
            $stmt = $db->prepare("UPDATE raffle_winners SET published = 1, published_at = NOW() WHERE published = 0");
            $stmt->execute();

            $count = $stmt->rowCount();

            if ($count === 0) {
                sendError('No unpublished winners found');
            }

            // Fetch published winners
            $stmt = $db->query("SELECT w.*, e.name, e.email, e.phone
                               FROM raffle_winners w
                               INNER JOIN raffle_entries e ON w.entry_id = e.id
                               WHERE w.published = 1
                               ORDER BY w.rank ASC");
            $winners = $stmt->fetchAll();

            sendJSON([
                'action' => 'publish',
                'winners' => $winners,
                'message' => 'Winners published successfully'
            ]);
        }

        else {
            sendError('Invalid action');
        }

    } catch (PDOException $e) {
        error_log("Winners POST error: " . $e->getMessage());
        sendError('Failed to process winners', 500);
    }
}

// DELETE - Clear all winners
elseif ($method === 'DELETE') {
    try {
        $db->exec("DELETE FROM raffle_winners");
        sendJSON(['success' => true, 'message' => 'All winners cleared']);
    } catch (PDOException $e) {
        error_log("Winners DELETE error: " . $e->getMessage());
        sendError('Failed to clear winners', 500);
    }
}

// Invalid method
else {
    sendError('Method not allowed', 405);
}
