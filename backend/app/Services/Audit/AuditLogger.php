<?php

namespace App\Services\Audit;

use App\Models\AuditLog;
use Illuminate\Http\Request;

/**
 * Passwords, access tokens and any other credential must never be passed in
 * $metadata. Keys listed in self::FORBIDDEN are stripped defensively.
 */
class AuditLogger
{
    private const FORBIDDEN = ['password', 'password_confirmation', 'token', 'access_token', 'secret'];

    public function log(
        string $action,
        ?int $tenantId,
        ?int $userId,
        string $resourceType,
        ?string $resourceId = null,
        array $metadata = [],
        ?Request $request = null,
    ): AuditLog {
        $request ??= request();

        return AuditLog::create([
            'tenant_id' => $tenantId,
            'user_id' => $userId,
            'action' => $action,
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'ip_address' => $request?->ip(),
            'user_agent' => substr((string) $request?->userAgent(), 0, 255),
            'metadata' => collect($metadata)->except(self::FORBIDDEN)->all(),
        ]);
    }
}
