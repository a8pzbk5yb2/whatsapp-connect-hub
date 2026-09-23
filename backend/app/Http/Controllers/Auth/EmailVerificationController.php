<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\SessionResource;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class EmailVerificationController extends Controller
{
    public function verify(EmailVerificationRequest $request): JsonResponse
    {
        $request->fulfill();

        $user = $request->user();

        return ApiResponse::success(
            SessionResource::make($user, $user->currentTenant(), $request->bearerToken() ?? ''),
            'Email confirmed.'
        );
    }

    public function verifyCurrent(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user && ! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        return ApiResponse::success(
            SessionResource::make($user, $user->currentTenant(), $request->bearerToken() ?? ''),
            'Email confirmed.'
        );
    }

    public function resend(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponse::error('UNAUTHENTICATED', 'Please sign in again.', 401);
        }

        if ($user->hasVerifiedEmail()) {
            return ApiResponse::success(null, 'Your email is already confirmed.');
        }

        try {
            $user->sendEmailVerificationNotification();
        } catch (Throwable $e) {
            // Mail transport problems must never surface as a server crash.
            Log::channel('stack')->error('Verification email failed to send', [
                'user_id' => $user->id,
                'reason' => $e->getMessage(),
            ]);

            return ApiResponse::error(
                'MAIL_NOT_CONFIGURED',
                'We could not send the confirmation email. Please check the mail settings or try again later.',
                503
            );
        }

        return ApiResponse::success(null, 'Confirmation email sent.');
    }
}
