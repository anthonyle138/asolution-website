<?php
// ============================================
// BULK OPERATIONS API
// ============================================

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDBConnection();

// POST - Bulk operations
if ($method === 'POST') {
    try {
        $data = getRequestBody();
        $action = isset($data['action']) ? $data['action'] : null;

        // BULK IMPORT ENTRIES
        if ($action === 'import_entries') {
            if (empty($data['entries']) || !is_array($data['entries'])) {
                sendError('Entries array is required');
            }

            $imported = 0;
            $skipped = 0;
            $errors = [];

            $db->beginTransaction();

            foreach ($data['entries'] as $entry) {
                if (empty($entry['name']) || empty($entry['email'])) {
                    $errors[] = "Skipped entry: name and email required";
                    $skipped++;
                    continue;
                }

                $name = sanitizeInput($entry['name']);
                $email = sanitizeInput($entry['email']);
                $phone = isset($entry['phone']) ? sanitizeInput($entry['phone']) : null;

                if (!validateEmail($email)) {
                    $errors[] = "Skipped $email: invalid email format";
                    $skipped++;
                    continue;
                }

                // Check for duplicate
                $stmt = $db->prepare("SELECT id FROM raffle_entries WHERE email = ?");
                $stmt->execute([$email]);
                if ($stmt->fetch()) {
                    $errors[] = "Skipped $email: already exists";
                    $skipped++;
                    continue;
                }

                // Insert entry
                $stmt = $db->prepare("INSERT INTO raffle_entries (name, email, phone, submitted_from) VALUES (?, ?, ?, 'bulk')");
                $stmt->execute([$name, $email, $phone]);
                $imported++;
            }

            $db->commit();

            sendJSON([
                'action' => 'import_entries',
                'imported' => $imported,
                'skipped' => $skipped,
                'errors' => $errors,
                'message' => "Imported $imported entries, skipped $skipped"
            ]);
        }

        // CLEAR ALL ENTRIES
        elseif ($action === 'clear_entries') {
            $db->exec("DELETE FROM raffle_entries");
            sendJSON([
                'action' => 'clear_entries',
                'message' => 'All entries cleared'
            ]);
        }

        // RESET RAFFLE (clear everything)
        elseif ($action === 'reset_raffle') {
            $db->beginTransaction();
            $db->exec("DELETE FROM raffle_winners");
            $db->exec("DELETE FROM raffle_entries");
            $db->exec("DELETE FROM raffle_settings");
            $db->commit();

            sendJSON([
                'action' => 'reset_raffle',
                'message' => 'Raffle system reset completely'
            ]);
        }

        else {
            sendError('Invalid action');
        }

    } catch (PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        error_log("Bulk operation error: " . $e->getMessage());
        sendError('Bulk operation failed', 500);
    }
}

// Invalid method
else {
    sendError('Method not allowed', 405);
}
