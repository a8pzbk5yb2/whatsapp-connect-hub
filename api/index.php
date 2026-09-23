<?php
// Bridge between single domain root and backend public entrypoint
$pathOutside = __DIR__ . '/../../backend/public/index.php';
$pathInside = __DIR__ . '/../backend/public/index.php';

if (file_exists($pathOutside)) {
    chdir(dirname($pathOutside));
    require $pathOutside;
} elseif (file_exists($pathInside)) {
    chdir(dirname($pathInside));
    require $pathInside;
} else {
    header('HTTP/1.1 500 Internal Server Error');
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Backend entrypoint missing.']);
}
