<?php

namespace App\Http\Middleware;

use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * The tenant is derived from the authenticated user only. A tenant id sent by
 * the client is ignored entirely.
 */
class ResolveTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponse::error('UNAUTHENTICATED', 'Please sign in to continue.', 401);
        }

        $tenant = $user->currentTenant();

        if (! $tenant) {
            return ApiResponse::error('NO_TENANT', 'No organisation is linked to this account.', 409);
        }

        if ($tenant->status === 'suspended') {
            return ApiResponse::error('TENANT_SUSPENDED', 'This workspace is suspended. Contact support.', 403);
        }

        app()->instance('currentTenantId', $tenant->id);
        app()->instance('currentTenant', $tenant);
        $request->attributes->set('tenant', $tenant);

        return $next($request);
    }
}
