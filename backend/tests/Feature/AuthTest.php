<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_registration_creates_user_tenant_and_owner_membership(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Ada Lovelace',
            'email' => 'ada@example.com',
            'phone' => '+441234567890',
            'company_name' => 'Analytical Ltd',
            'password' => 'super-secret-1',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.role', 'tenant_owner')
            ->assertJsonPath('data.tenant.company_name', 'Analytical Ltd');

        $this->assertDatabaseHas('tenant_users', ['user_id' => User::first()->id, 'status' => 'active']);
        $this->assertDatabaseHas('audit_logs', ['action' => 'USER_REGISTERED']);
    }

    public function test_login_rejects_wrong_password_without_leaking_detail(): void
    {
        User::factory()->create(['email' => 'ada@example.com', 'password' => 'super-secret-1']);

        $this->postJson('/api/v1/auth/login', ['email' => 'ada@example.com', 'password' => 'wrong'])
            ->assertStatus(401)
            ->assertJsonPath('error.code', 'INVALID_CREDENTIALS');
    }

    public function test_protected_endpoint_requires_authentication(): void
    {
        $this->getJson('/api/v1/dashboard/stats')->assertStatus(401);
    }
}
