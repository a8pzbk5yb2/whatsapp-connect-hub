<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Tenant;
use App\Models\TenantUser;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    private function makeTenantOwner(string $company): array
    {
        $tenant = Tenant::create(['name' => $company, 'company_name' => $company, 'status' => 'active']);
        $user = User::factory()->create();
        TenantUser::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'role_id' => Role::where('key', 'tenant_owner')->first()->id,
            'status' => 'active',
        ]);

        return [$tenant, $user];
    }

    public function test_team_list_only_returns_own_tenant_members(): void
    {
        [, $userA] = $this->makeTenantOwner('Alpha');
        $this->makeTenantOwner('Beta');

        Sanctum::actingAs($userA);

        $response = $this->getJson('/api/v1/team')->assertOk();

        $this->assertCount(1, $response->json('data'));
        $this->assertSame($userA->email, $response->json('data.0.email'));
    }

    public function test_client_supplied_tenant_id_is_ignored(): void
    {
        [, $userA] = $this->makeTenantOwner('Alpha');
        [$tenantB] = $this->makeTenantOwner('Beta');

        Sanctum::actingAs($userA);

        $response = $this->getJson('/api/v1/tenant?tenant_id='.$tenantB->id)->assertOk();

        $this->assertSame('Alpha', $response->json('data.company_name'));
    }

    public function test_staff_cannot_manage_team(): void
    {
        [$tenant] = $this->makeTenantOwner('Alpha');
        $staff = User::factory()->create();
        TenantUser::create([
            'tenant_id' => $tenant->id,
            'user_id' => $staff->id,
            'role_id' => Role::where('key', 'tenant_staff')->first()->id,
            'status' => 'active',
        ]);

        Sanctum::actingAs($staff);

        $this->postJson('/api/v1/team', [
            'name' => 'New Person',
            'email' => 'new@example.com',
            'role' => 'tenant_staff',
        ])->assertStatus(403);
    }

    public function test_non_super_admin_cannot_reach_admin_area(): void
    {
        [, $user] = $this->makeTenantOwner('Alpha');
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/admin/stats')->assertStatus(403);
    }
}
