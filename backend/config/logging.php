<?php

use Monolog\Handler\StreamHandler;

return [
    'default' => env('LOG_CHANNEL', 'stack'),

    'channels' => [
        'stack' => [
            'driver' => 'stack',
            'channels' => ['daily'],
            'ignore_exceptions' => false,
        ],

        'daily' => [
            'driver' => 'daily',
            'path' => storage_path('logs/laravel.log'),
            'level' => env('LOG_LEVEL', 'debug'),
            'days' => 14,
        ],

        // Dedicated channels so Meta, webhook, queue and audit activity can be
        // searched independently. Tokens are never written to any of them.
        'meta' => [
            'driver' => 'daily',
            'path' => storage_path('logs/meta.log'),
            'level' => 'debug',
            'days' => 30,
        ],

        'webhooks' => [
            'driver' => 'daily',
            'path' => storage_path('logs/webhooks.log'),
            'level' => 'debug',
            'days' => 30,
        ],

        'queue' => [
            'driver' => 'daily',
            'path' => storage_path('logs/queue.log'),
            'level' => 'debug',
            'days' => 14,
        ],

        'auth' => [
            'driver' => 'daily',
            'path' => storage_path('logs/auth.log'),
            'level' => 'info',
            'days' => 30,
        ],

        'stderr' => [
            'driver' => 'monolog',
            'handler' => StreamHandler::class,
            'with' => ['stream' => 'php://stderr'],
        ],
    ],
];
