<?php

namespace App\Services\Meta;

use Illuminate\Support\Facades\Log;

/**
 * Verification and signature checks for the Meta webhook. Event persistence and
 * queue dispatch arrive with the webhook phase; the signature contract is fixed
 * here now so the endpoint is never left unverified.
 */
class MetaWebhookService
{
    public function verifyChallenge(string $mode, string $token, string $challenge): ?string
    {
        if ($mode === 'subscribe' && hash_equals((string) config('meta.webhook_verify_token'), $token)) {
            return $challenge;
        }

        Log::channel('webhooks')->warning('meta.webhook.challenge_rejected', ['mode' => $mode]);

        return null;
    }

    public function verifySignature(string $rawBody, ?string $header): bool
    {
        if (! $header || ! str_starts_with($header, 'sha256=')) {
            return false;
        }

        $expected = 'sha256='.hash_hmac('sha256', $rawBody, (string) config('meta.app_secret'));

        return hash_equals($expected, $header);
    }

    /** Stable hash used by the unique index on meta_webhook_events. */
    public function eventHash(array $payload): string
    {
        return hash('sha256', json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    }
}
