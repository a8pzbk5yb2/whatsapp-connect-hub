<?php

use App\Services\Meta\MetaWebhookService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/**
 * Meta webhook endpoint. GET answers the subscription challenge; POST verifies
 * the signature, then returns 200 immediately. Real processing is queued in the
 * webhook phase — this endpoint must never do slow work inline.
 */
Route::get('/webhooks/meta/whatsapp', function (Request $request, MetaWebhookService $webhooks) {
    $challenge = $webhooks->verifyChallenge(
        (string) $request->query('hub_mode'),
        (string) $request->query('hub_verify_token'),
        (string) $request->query('hub_challenge'),
    );

    return $challenge === null
        ? response('Forbidden', 403)
        : response($challenge, 200)->header('Content-Type', 'text/plain');
});

Route::post('/webhooks/meta/whatsapp', function (Request $request, MetaWebhookService $webhooks) {
    if (! $webhooks->verifySignature($request->getContent(), $request->header('X-Hub-Signature-256'))) {
        return response('Invalid signature', 401);
    }

    // Phase: webhooks — persist to meta_webhook_events (unique on event_hash)
    // and dispatch to the meta-webhooks queue. Always answer 200 quickly.
    return response('', 200);
});
