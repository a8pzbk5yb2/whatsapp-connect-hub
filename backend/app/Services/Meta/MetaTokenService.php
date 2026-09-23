<?php

namespace App\Services\Meta;

use Illuminate\Support\Facades\Crypt;

/**
 * Owns every access token in the platform. Tokens are encrypted at rest and
 * only ever returned to other services, never to a controller response or a log
 * line. Phase 2 persists them on meta_credentials.
 */
class MetaTokenService
{
    public function __construct(private readonly MetaGraphService $graph)
    {
    }

    public function encrypt(string $token): string
    {
        return Crypt::encryptString($token);
    }

    public function decrypt(string $encrypted): string
    {
        return Crypt::decryptString($encrypted);
    }

    /** Exchange the short-lived code from Embedded Signup for a long-lived token. */
    public function exchangeCode(string $code): array
    {
        return $this->graph->get('oauth/access_token', [
            'client_id' => config('meta.app_id'),
            'client_secret' => config('meta.app_secret'),
            'code' => $code,
        ]);
    }

    public function debug(string $token): array
    {
        return $this->graph->get('debug_token', [
            'input_token' => $token,
            'access_token' => config('meta.app_id').'|'.config('meta.app_secret'),
        ]);
    }

    public function appSecretProof(string $token): string
    {
        return hash_hmac('sha256', $token, (string) config('meta.app_secret'));
    }
}
