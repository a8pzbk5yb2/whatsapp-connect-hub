<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\SessionResource;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\TenantUser;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use App\Support\ApiResponse;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

class AuthController extends Controller
{
    public function __construct(private readonly AuditLogger $audit)
    {
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        // The user, the tenant and the owner membership must all exist or none.
        $result = DB::transaction(function () use ($request) {
            $user = User::create($request->safe()->only(['name', 'email', 'phone', 'password']));

            $tenant = Tenant::create([
                'name' => $request->validated('company_name'),
                'company_name' => $request->validated('company_name'),
                'support_email' => $request->validated('email'),
                'timezone' => $request->validated('timezone', 'UTC'),
                'status' => 'active',
            ]);

            TenantUser::create([
                'tenant_id' => $tenant->id,
                'user_id' => $user->id,
                'role_id' => Role::where('key', 'tenant_owner')->firstOrFail()->id,
                'status' => 'active',
            ]);

            return [$user, $tenant];
        });

        [$user, $tenant] = $result;

        $user->sendEmailVerificationNotification();
        event(new Registered($user));

        $this->audit->log('USER_REGISTERED', $tenant->id, $user->id, 'user', (string) $user->id);

        return ApiResponse::success(
            SessionResource::make($user, $tenant, $user->createToken('web')->plainTextToken),
            'Account created. Please confirm your email address.',
            201
        );
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $key = 'login:'.$request->ip().':'.$request->validated('email');

        if (RateLimiter::tooManyAttempts($key, 5)) {
            return ApiResponse::error('TOO_MANY_ATTEMPTS', 'Too many attempts. Try again in a minute.', 429);
        }

        $user = User::where('email', $request->validated('email'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            RateLimiter::hit($key, 60);

            return ApiResponse::error('INVALID_CREDENTIALS', 'Those sign-in details did not match our records.', 401);
        }

        RateLimiter::clear($key);
        $tenant = $user->currentTenant();

        if ($tenant && $tenant->status === 'suspended') {
            return ApiResponse::error('TENANT_SUSPENDED', 'This workspace is suspended. Contact support.', 403);
        }

        $this->audit->log('USER_LOGGED_IN', $tenant?->id, $user->id, 'user', (string) $user->id);

        return ApiResponse::success(
            SessionResource::make($user, $tenant, $user->createToken('web')->plainTextToken),
            'Signed in.'
        );
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return ApiResponse::success(null, 'Signed out.');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return ApiResponse::success(
            SessionResource::make($user, $user->currentTenant(), $request->bearerToken() ?? ''),
            'OK'
        );
    }
}
