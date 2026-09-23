<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Shared hosting sometimes serves the app from a subfolder; everything below
// resolves relative to this file, so no absolute paths are needed.
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../vendor/autoload.php';

/** @var Illuminate\Foundation\Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
