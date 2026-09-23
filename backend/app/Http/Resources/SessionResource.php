<?php

namespace App\Http\Resources;

use App\Models\Tenant;
use App\Models\User;

/**
 * The exact shape the React client expects from /auth/*. Nothing sensitive is
 * included: no password hash, no Meta credentials.
 */
class SessionResource
{
    public static function make(User $user, ?Tenant $tenant, string $token): array
    {
        return [
            'token' => $token,
            'user' => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->isSuperAdmin()
                    ? 'super_admin'
                    : ($user->membership()?->role?->key ?? 'tenant_staff'),
                'permissions' => $user->permissions(),
                'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                'created_at' => $user->created_at?->toIso8601String(),
            ],
            'tenant' => $tenant ? [
                'id' => (string) $tenant->id,
                'name' => $tenant->name,
                'company_name' => $tenant->company_name,
                'status' => $tenant->status,
                'support_email' => $tenant->support_email,
                'timezone' => $tenant->timezone,
                'whatsapp_status' => $tenant->whatsappStatus(),
                'created_at' => $tenant->created_at?->toIso8601String(),
            ] : null,
        ];
    }
}
