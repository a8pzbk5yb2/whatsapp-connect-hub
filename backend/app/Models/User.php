<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens;
    use HasFactory;
    use Notifiable;

    protected $fillable = ['name', 'email', 'phone', 'password', 'is_super_admin', 'email_verified_at'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_super_admin' => 'boolean',
        ];
    }

    public function tenants(): BelongsToMany
    {
        return $this->belongsToMany(Tenant::class, 'tenant_users')
            ->withPivot(['role_id', 'status'])
            ->withTimestamps();
    }

    public function membership(?Tenant $tenant = null): ?TenantUser
    {
        $query = TenantUser::query()->where('user_id', $this->id);

        if ($tenant) {
            $query->where('tenant_id', $tenant->id);
        }

        return $query->first();
    }

    public function currentTenant(): ?Tenant
    {
        $membership = $this->membership();

        return $membership?->tenant;
    }

    public function isSuperAdmin(): bool
    {
        return (bool) $this->is_super_admin;
    }

    /** Effective permissions come from the role on the tenant membership. */
    public function permissions(): array
    {
        if ($this->isSuperAdmin()) {
            return Permission::query()->pluck('key')->all();
        }

        $membership = $this->membership();

        return $membership?->role?->permissions->pluck('key')->all() ?? [];
    }

    public function hasPermission(string $permission): bool
    {
        return $this->isSuperAdmin() || in_array($permission, $this->permissions(), true);
    }
}
