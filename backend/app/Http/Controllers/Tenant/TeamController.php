<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\TenantUser;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TeamController extends Controller
{
    public function __construct(private readonly AuditLogger $audit)
    {
    }

    public function index(Request $request): JsonResponse
    {
        /** @var Tenant $tenant */
        $tenant = $request->attributes->get('tenant');
        $this->authorize('view', $tenant);

        $members = TenantUser::with(['user', 'role'])
            ->where('tenant_id', $tenant->id)
            ->get()
            ->map(fn (TenantUser $m) => $this->present($m))
            ->all();

        return ApiResponse::success($members);
    }

    public function store(Request $request): JsonResponse
    {
        /** @var Tenant $tenant */
        $tenant = $request->attributes->get('tenant');
        $this->authorize('manageTeam', $tenant);

        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:190'],
            'role' => ['required', 'in:tenant_owner,tenant_staff'],
        ]);

        $membership = DB::transaction(function () use ($data, $tenant) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                ['name' => $data['name'], 'password' => Str::password(24)]
            );

            if (TenantUser::where('tenant_id', $tenant->id)->where('user_id', $user->id)->exists()) {
                return null;
            }

            return TenantUser::create([
                'tenant_id' => $tenant->id,
                'user_id' => $user->id,
                'role_id' => Role::where('key', $data['role'])->firstOrFail()->id,
                'status' => 'invited',
                'invited_at' => now(),
            ]);
        });

        if (! $membership) {
            return ApiResponse::error('ALREADY_MEMBER', 'That person is already on the team.', 409);
        }

        $this->audit->log(
            'TEAM_MEMBER_INVITED',
            $tenant->id,
            $request->user()->id,
            'tenant_user',
            (string) $membership->id,
            ['email' => $data['email'], 'role' => $data['role']]
        );

        return ApiResponse::success($this->present($membership->load(['user', 'role'])), 'Invitation sent.', 201);
    }

    public function update(Request $request, int $member): JsonResponse
    {
        /** @var Tenant $tenant */
        $tenant = $request->attributes->get('tenant');
        $this->authorize('manageTeam', $tenant);

        $data = $request->validate(['role' => ['required', 'in:tenant_owner,tenant_staff']]);

        $membership = TenantUser::where('tenant_id', $tenant->id)->findOrFail($member);

        if ($this->isLastOwner($tenant, $membership) && $data['role'] !== 'tenant_owner') {
            return ApiResponse::error('LAST_OWNER', 'A workspace needs at least one owner.', 422);
        }

        $membership->role_id = Role::where('key', $data['role'])->firstOrFail()->id;
        $membership->save();

        $this->audit->log(
            'TEAM_MEMBER_ROLE_CHANGED',
            $tenant->id,
            $request->user()->id,
            'tenant_user',
            (string) $membership->id,
            ['role' => $data['role']]
        );

        return ApiResponse::success($this->present($membership->load(['user', 'role'])), 'Role updated.');
    }

    public function destroy(Request $request, int $member): JsonResponse
    {
        /** @var Tenant $tenant */
        $tenant = $request->attributes->get('tenant');
        $this->authorize('manageTeam', $tenant);

        $membership = TenantUser::where('tenant_id', $tenant->id)->findOrFail($member);

        if ($this->isLastOwner($tenant, $membership)) {
            return ApiResponse::error('LAST_OWNER', 'A workspace needs at least one owner.', 422);
        }

        $membership->delete();

        $this->audit->log(
            'TEAM_MEMBER_REMOVED',
            $tenant->id,
            $request->user()->id,
            'tenant_user',
            (string) $member
        );

        return ApiResponse::success(null, 'Team member removed.');
    }

    private function isLastOwner(Tenant $tenant, TenantUser $membership): bool
    {
        if ($membership->role?->key !== 'tenant_owner') {
            return false;
        }

        return TenantUser::where('tenant_id', $tenant->id)
            ->whereHas('role', fn ($q) => $q->where('key', 'tenant_owner'))
            ->count() <= 1;
    }

    private function present(TenantUser $membership): array
    {
        return [
            'id' => (string) $membership->id,
            'name' => $membership->user->name,
            'email' => $membership->user->email,
            'role' => $membership->role->key,
            'status' => $membership->status,
            'invited_at' => $membership->invited_at?->toIso8601String(),
            'joined_at' => $membership->created_at?->toIso8601String(),
        ];
    }
}
