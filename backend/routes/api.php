<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Tenant\DashboardController;
use App\Http\Controllers\Tenant\TeamController;
use App\Http\Controllers\Tenant\TenantController;
use Illuminate\Support\Facades\Route;

$apiRoutes = function (): void {
    // Public auth endpoints.
    Route::post('auth/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:20,1');
    Route::post('auth/forgot-password', [PasswordController::class, 'forgot'])->middleware('throttle:6,1');
    Route::post('auth/reset-password', [PasswordController::class, 'reset'])->middleware('throttle:6,1');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::get('auth/verify-email/{id}/{hash}', [EmailVerificationController::class, 'verify'])
            ->middleware('signed')
            ->name('verification.verify');
        Route::post('auth/verify-email/resend', [EmailVerificationController::class, 'resend'])
            ->middleware('throttle:6,1');

        // Tenant area. ResolveTenant derives the tenant from the signed-in user.
        Route::middleware('tenant')->group(function (): void {
            Route::get('tenant', [TenantController::class, 'show']);
            Route::patch('tenant', [TenantController::class, 'update']);
            Route::get('dashboard/stats', DashboardController::class);

            Route::get('team', [TeamController::class, 'index']);
            Route::post('team', [TeamController::class, 'store']);
            Route::patch('team/{member}', [TeamController::class, 'update']);
            Route::delete('team/{member}', [TeamController::class, 'destroy']);
        });

        // Platform administration.
        Route::middleware('super-admin')->prefix('admin')->group(function (): void {
            Route::get('stats', [AdminController::class, 'stats']);
            Route::get('tenants', [AdminController::class, 'tenants']);
            Route::patch('tenants/{tenant}/status', [AdminController::class, 'setTenantStatus']);
            Route::get('meta-settings', [AdminController::class, 'metaSettings']);
            Route::get('audit-logs', [AdminController::class, 'auditLogs']);
        });
    });
};

// Register routes for both /auth/login and /v1/auth/login
$apiRoutes();
Route::prefix('v1')->group($apiRoutes);
