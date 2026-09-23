<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'company_name',
        'support_email',
        'timezone',
        'status',
        'brand_color',
        'logo_path',
    ];

    public function members(): HasMany
    {
        return $this->hasMany(TenantUser::class);
    }

    public function owner(): ?User
    {
        return $this->members()
            ->whereHas('role', fn ($q) => $q->where('key', 'tenant_owner'))
            ->first()?->user;
    }

    /**
     * Phase 2 attaches the Meta business, WABA and phone numbers here. Until a
     * WABA is connected the workspace reports "disconnected".
     */
    public function whatsappStatus(): string
    {
        return 'disconnected';
    }
}
