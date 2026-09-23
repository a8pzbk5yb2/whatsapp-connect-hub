<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Tenant;
use App\Models\TenantUser;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use App\Support\ApiResponse;
use App\Support\Mask;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct(private readonly AuditLogger $audit)
    {
    }

    public function stats(): JsonResponse
    {
        return ApiResponse::success([
            'tenants_total' => Tenant::count(),
            'tenants_active' => Tenant::where('status', 'active')->count(),
            'tenants_suspended' => Tenant::where('status', 'suspended')->count(),
            'users_total' => User::count(),
            'wabas_connected' => 0,
            'numbers_connected' => 0,
            'messages_24h' => 0,
            'webhook_failures_24h' => 0,
        ]);
    }

    public function tenants(Request $request): JsonResponse
    {
        $search = (string) $request->query('search', '');

        $rows = Tenant::query()
            ->when($search !== '', fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            }))
            ->orderByDesc('created_at')
            ->limit(100)
            ->get()
            ->map(fn (Tenant $tenant) => [
                'id' => (string) $tenant->id,
                'company_name' => $tenant->company_name,
                'owner_email' => $tenant->owner()?->email,
                'status' => $tenant->status,
                'whatsapp_status' => $tenant->whatsappStatus(),
                'users_count' => TenantUser::where('tenant_id', $tenant->id)->count(),
                'created_at' => $tenant->created_at?->toIso8601String(),
            ])
            ->all();

        return ApiResponse::success($rows);
    }

    public function setTenantStatus(Request $request, Tenant $tenant): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:active,suspended']]);

        $tenant->status = $data['status'];
        $tenant->save();

        $this->audit->log(
            $data['status'] === 'suspended' ? 'TENANT_SUSPENDED' : 'TENANT_ACTIVATED',
            $tenant->id,
            $request->user()->id,
            'tenant',
            (string) $tenant->id
        );

        return ApiResponse::success(['status' => $tenant->status], 'Client updated.');
    }

    /** Masked only. Raw Meta credentials never leave the server. */
    public function metaSettings(): JsonResponse
    {
        return ApiResponse::success([
            'app_id_masked' => Mask::secret((string) config('meta.app_id')),
            'app_secret_masked' => Mask::secret((string) config('meta.app_secret')),
            'config_id_masked' => Mask::secret((string) config('meta.config_id')),
            'graph_version' => config('meta.graph_version'),
            'webhook_url' => url('/webhooks/meta/whatsapp'),
            'webhook_verify_token_set' => (bool) config('meta.webhook_verify_token'),
            'webhook_status' => config('meta.app_id') && config('meta.app_secret') ? 'configured' : 'incomplete',
        ]);
    }

    public function auditLogs(Request $request): JsonResponse
    {
        $rows = AuditLog::query()
            ->when($request->query('tenant_id'), fn ($q, $id) => $q->where('tenant_id', $id))
            ->when($request->query('action'), fn ($q, $a) => $q->where('action', $a))
            ->orderByDesc('created_at')
            ->limit(200)
            ->get()
            ->map(fn (AuditLog $log) => [
                'id' => (string) $log->id,
                'tenant_id' => $log->tenant_id ? (string) $log->tenant_id : null,
                'user_id' => $log->user_id ? (string) $log->user_id : null,
                'action' => $log->action,
                'resource_type' => $log->resource_type,
                'resource_id' => $log->resource_id,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at?->toIso8601String(),
            ])
            ->all();

        return ApiResponse::success($rows);
    }
}
