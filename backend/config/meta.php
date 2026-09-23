<?php

return [
    // Public values. Only these two may ever be sent to the browser.
    'app_id' => env('META_APP_ID'),
    'config_id' => env('META_CONFIG_ID'),

    // Server-only values.
    'app_secret' => env('META_APP_SECRET'),
    'webhook_verify_token' => env('META_WEBHOOK_VERIFY_TOKEN'),
    'webhook_secret' => env('META_WEBHOOK_SECRET'),
    'redirect_uri' => env('META_REDIRECT_URI'),
    'scopes' => explode(',', (string) env('META_APP_SCOPES', '')),

    // Never hard-code the Graph version anywhere else in the application.
    'graph_version' => env('META_GRAPH_VERSION', 'v24.0'),
    'graph_base_url' => 'https://graph.facebook.com',

    'http' => [
        'timeout' => (int) env('META_HTTP_TIMEOUT', 20),
        'retries' => (int) env('META_HTTP_RETRIES', 3),
        'retry_delay_ms' => (int) env('META_HTTP_RETRY_DELAY', 500),
    ],
];
