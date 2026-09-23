<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public const PERMISSIONS = [
        'messages.view' => 'View messages',
        'messages.send' => 'Send messages',
        'contacts.manage' => 'Manage contacts',
        'campaigns.manage' => 'Manage campaigns',
        'templates.view' => 'View templates',
        'templates.manage' => 'Manage templates',
        'analytics.view' => 'View analytics',
        'settings.manage' => 'Manage settings',
        'team.manage' => 'Manage team members',
        'billing.manage' => 'Manage billing',
        'api.manage' => 'Manage API keys',
        'whatsapp.manage' => 'Manage the WhatsApp connection',
    ];

    public const STAFF_DEFAULTS = [
        'messages.view',
        'messages.send',
        'contacts.manage',
        'templates.view',
        'analytics.view',
    ];

    public function run(): void
    {
        foreach (self::PERMISSIONS as $key => $description) {
            Permission::updateOrCreate(['key' => $key], ['description' => $description]);
        }

        $owner = Role::updateOrCreate(
            ['key' => 'tenant_owner'],
            ['name' => 'Owner', 'description' => 'Full access to the workspace']
        );
        $staff = Role::updateOrCreate(
            ['key' => 'tenant_staff'],
            ['name' => 'Staff', 'description' => 'Configurable limited access']
        );
        Role::updateOrCreate(
            ['key' => 'super_admin'],
            ['name' => 'Super Admin', 'description' => 'Platform administrator']
        );

        $owner->permissions()->sync(Permission::query()->pluck('id'));
        $staff->permissions()->sync(
            Permission::query()->whereIn('key', self::STAFF_DEFAULTS)->pluck('id')
        );
    }
}
