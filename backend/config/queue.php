<?php

return [
    'default' => env('QUEUE_CONNECTION', 'redis'),

    'connections' => [
        'redis' => [
            'driver' => 'redis',
            'connection' => 'default',
            'queue' => env('REDIS_QUEUE', 'default'),
            'retry_after' => 180,
            'block_for' => 5,
            'after_commit' => true,
        ],
    ],

    /*
     * Named queues for the platform. Workers are started per queue in
     * docker/supervisord.conf so a slow campaign never blocks a webhook.
     */
    'queues' => [
        'meta-webhooks',
        'meta-api',
        'message-send',
        'campaigns',
        'template-sync',
        'waba-sync',
        'notifications',
        'analytics',
    ],

    'failed' => [
        'driver' => 'database-uuids',
        'database' => env('DB_CONNECTION', 'mysql'),
        'table' => 'failed_jobs',
    ],
];
