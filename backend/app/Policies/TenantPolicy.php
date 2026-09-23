<?php

namespace App\Policies;

use App\Models\Tenant;
use App\Models\User;

class TenantPolicy
{
    public function view(User $user, Tenant $tenant): bool
    {
        return $user->isSuperAdmin() || $user->membership($tenant) !== null;
    }

    public function update(User $user, Tenant $tenant): bool
    {
        return $user->isSuperAdmin()
            || ($user->membership($tenant) !== null && $user->hasPermission('settings.manage'));
    }

    public function manageTeam(User $user, Tenant $tenant): bool
    {
        return $user->isSuperAdmin()
            || ($user->membership($tenant) !== null && $user->hasPermission('team.manage'));
    }

    public function suspend(User $user, Tenant $tenant): bool
    {
        return $user->isSuperAdmin();
    }
}
