<?php

return [
    /*
     * Shared hosting rarely offers Redis, so the default is the database queue.
     * Set QUEUE_CONNECTION=redis on a VPS/Docker deployment to get the faster
     * driver back — no application code changes are required either way.
     */
    'default' => env('QUEUE_CONNECTION', 'database'),

    'connections' => [
        'sync' => [
            'driver' => 'sync',
        ],

        'database' => [
            'driver' => 'database',
            'connection' => env('DB_QUEUE_CONNECTION'),
            'table' => env('DB_QUEUE_TABLE', 'jobs'),
            'queue' => env('DB_QUEUE', 'default'),
            'retry_after' => 180,
            'after_commit' => true,
        ],

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
     * Named queues for the platform. On a VPS these get one Supervisor worker
     * each (docker/supervisord.conf); on shared hosting a single cron-driven
     * worker walks the same list in priority order (see README).
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
