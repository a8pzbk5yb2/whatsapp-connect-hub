<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Services\Audit\AuditLogger;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    public function __construct(private readonly AuditLogger $audit)
    {
    }

    public function show(Request $request): JsonResponse
    {
        $tenant = $request->attributes->get('tenant');

        return ApiResponse::success($this->present($tenant));
    }

    public function update(Request $request): JsonResponse
    {
        /** @var Tenant $tenant */
        $tenant = $request->attributes->get('tenant');
        $this->authorize('update', $tenant);

        $data = $request->validate([
            'company_name' => ['sometimes', 'string', 'min:2', 'max:190'],
            'support_email' => ['sometimes', 'nullable', 'email:rfc', 'max:190'],
            'timezone' => ['sometimes', 'string', 'max:64'],
            'brand_color' => ['sometimes', 'nullable', 'string', 'max:32'],
        ]);

        $tenant->fill($data);
        if (isset($data['company_name'])) {
            $tenant->name = $data['company_name'];
        }
        $tenant->save();

        $this->audit->log(
            'TENANT_UPDATED',
            $tenant->id,
            $request->user()->id,
            'tenant',
            (string) $tenant->id,
            ['fields' => array_keys($data)]
        );

        return ApiResponse::success($this->present($tenant), 'Settings saved.');
    }

    private function present(Tenant $tenant): array
    {
        return [
            'id' => (string) $tenant->id,
            'name' => $tenant->name,
            'company_name' => $tenant->company_name,
            'status' => $tenant->status,
            'support_email' => $tenant->support_email,
            'timezone' => $tenant->timezone,
            'whatsapp_status' => $tenant->whatsappStatus(),
            'created_at' => $tenant->created_at?->toIso8601String(),
        ];
    }
}
