<?php

namespace App\Services\Meta;

use Illuminate\Support\Facades\Log;

/**
 * Turns raw Meta errors into a safe, human answer. The raw message and trace
 * id stay in the server log; the client only sees the normalised text.
 */
class MetaErrorService
{
    private const MESSAGES = [
        190 => ['TOKEN_EXPIRED', 'The WhatsApp connection needs to be re-authorised.'],
        100 => ['INVALID_REQUEST', 'Meta rejected that request. Please check the details and try again.'],
        131047 => ['RE_ENGAGEMENT', 'This contact can only be messaged with an approved template right now.'],
        131026 => ['UNDELIVERABLE', 'That number cannot receive WhatsApp messages.'],
        132000 => ['TEMPLATE_MISMATCH', 'The template parameters do not match the approved template.'],
        368 => ['ACCOUNT_RESTRICTED', 'This WhatsApp account is temporarily restricted by Meta.'],
        4 => ['RATE_LIMITED', 'Meta is rate limiting this account. Please retry shortly.'],
        80007 => ['RATE_LIMITED', 'Meta is rate limiting this account. Please retry shortly.'],
    ];

    public function normalise(MetaApiException $exception): array
    {
        [$code, $message] = self::MESSAGES[$exception->metaCode]
            ?? ['META_ERROR', 'WhatsApp could not complete that action. Please try again.'];

        Log::channel('meta')->error('meta.api.error', [
            'status' => $exception->status,
            'meta_code' => $exception->metaCode,
            'meta_subcode' => $exception->metaSubcode,
            'meta_message' => $exception->metaMessage,
            'fbtrace_id' => $exception->fbTraceId,
            'request_id' => request()->attributes->get('request_id'),
        ]);

        return ['code' => $code, 'message' => $message];
    }
}
