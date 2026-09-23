<?php
// Bridge between single domain root and backend public entrypoint
$backendPublic = __DIR__ . '/../backend/public/index.php';
if (file_exists($backendPublic)) {
    chdir(__DIR__ . '/../backend/public');
    require $backendPublic;
} else {
    header('HTTP/1.1 500 Internal Server Error');
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Backend entrypoint missing.']);
}
