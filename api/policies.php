<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$policiesFile = __DIR__ . '/../policies.json';

switch ($method) {
    case 'GET':
        // Return all policies
        if (file_exists($policiesFile)) {
            $policies = json_decode(file_get_contents($policiesFile), true);
            if ($policies === null) {
                http_response_code(500);
                echo json_encode(['error' => 'Invalid JSON in policies file']);
                exit();
            }

            // Return policies array directly (not wrapped in an object)
            echo json_encode($policies);
        } else {
            // Return empty array if file doesn't exist
            echo json_encode([]);
        }
        break;

    case 'POST':
        // Save policies (for adding/updating)
        $input = json_decode(file_get_contents('php://input'), true);

        if (isset($input['policies']) && is_array($input['policies'])) {
            $policies = $input['policies'];

            // Add server timestamps
            foreach ($policies as &$policy) {
                if (!isset($policy['server_stored'])) {
                    $policy['server_stored'] = true;
                    $policy['server_stored_at'] = date('c');
                }
            }

            // Save to file
            if (file_put_contents($policiesFile, json_encode($policies, JSON_PRETTY_PRINT))) {
                echo json_encode(['success' => true, 'message' => 'Policies saved successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to save policies']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid request format']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>