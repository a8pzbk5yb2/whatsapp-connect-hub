<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\SessionResource;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    public function resend(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return ApiResponse::success(null, 'Your email is already confirmed.');
        }

        $request->user()->sendEmailVerificationNotification();

        return ApiResponse::success(null, 'Confirmation email sent.');
    }
}
