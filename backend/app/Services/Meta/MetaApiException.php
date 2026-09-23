<?php

namespace App\Services\Meta;

use Illuminate\Http\Client\Response;
use RuntimeException;

class MetaApiException extends RuntimeException
{
    public function __construct(
        public readonly int $status,
        public readonly ?int $metaCode,
        public readonly ?int $metaSubcode,
        public readonly string $metaMessage,
        public readonly ?string $fbTraceId,
    ) {
        parent::__construct($metaMessage, $status);
    }

    public static function fromResponse(Response $response): self
    {
        $error = $response->json('error') ?? [];

        return new self(
            $response->status(),
            isset($error['code']) ? (int) $error['code'] : null,
            isset($error['error_subcode']) ? (int) $error['error_subcode'] : null,
            (string) ($error['message'] ?? 'Meta API request failed.'),
            $error['fbtrace_id'] ?? null,
        );
    }
}
