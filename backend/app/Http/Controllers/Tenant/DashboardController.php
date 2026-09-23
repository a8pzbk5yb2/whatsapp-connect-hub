<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\TenantUser;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Phase 1 reports real counts for what exists today. Messaging, campaign
     * and credit figures stay at zero until their tables land in later phases;
     * they are never faked.
     */
    public function __invoke(Request $request): JsonResponse
    {
        /** @var Tenant $tenant */
        $tenant = $request->attributes->get('tenant');

        return ApiResponse::success([
            'whatsapp_status' => $tenant->whatsappStatus(),
            'messages_sent_24h' => 0,
            'messages_delivered_24h' => 0,
            'messages_failed_24h' => 0,
            'active_conversations' => 0,
            'contacts_total' => 0,
            'templates_approved' => 0,
            'campaigns_running' => 0,
            'credits_balance' => 0,
            'team_members' => TenantUser::where('tenant_id', $tenant->id)->count(),
        ]);
    }
}
