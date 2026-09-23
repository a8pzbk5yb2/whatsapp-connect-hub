<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Shared hosting single-domain deployment: backend lives in ../../laravel/
if (file_exists($maintenance = __DIR__.'/../../laravel/storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../../laravel/vendor/autoload.php';

/** @var Illuminate\Foundation\Application $app */
$app = require_once __DIR__.'/../../laravel/bootstrap/app.php';

$app->handleRequest(Request::capture());
