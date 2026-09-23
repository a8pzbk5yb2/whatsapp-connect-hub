<?php

use App\Http\Middleware\AssignRequestId;
use App\Http\Middleware\EnsurePermission;
use App\Http\Middleware\EnsureSuperAdmin;
use App\Http\Middleware\ResolveTenant;
use App\Support\ApiResponse;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        web: __DIR__.'/../routes/webhooks.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [AssignRequestId::class]);

        $middleware->alias([
            'tenant' => ResolveTenant::class,
            'super-admin' => EnsureSuperAdmin::class,
            'permission' => EnsurePermission::class,
        ]);

        // The webhook route is called by Meta, not by a browser session.
        $middleware->validateCsrfTokens(except: ['webhooks/meta/*']);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Stack traces and internal messages never reach an API client.
        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return match (true) {
                $e instanceof ValidationException => ApiResponse::error(
                    'VALIDATION_FAILED',
                    'Please check the highlighted fields.',
                    422,
                    $e->errors()
                ),
                $e instanceof AuthenticationException => ApiResponse::error(
                    'UNAUTHENTICATED',
                    'Please sign in to continue.',
                    401
                ),
                $e instanceof AuthorizationException => ApiResponse::error(
                    'FORBIDDEN',
                    'You do not have permission to do that.',
                    403
                ),
                $e instanceof ModelNotFoundException,
                $e instanceof NotFoundHttpException => ApiResponse::error(
                    'NOT_FOUND',
                    'We could not find what you asked for.',
                    404
                ),
                default => ApiResponse::error(
                    'SERVER_ERROR',
                    'Something went wrong. The team has been notified.',
                    500
                ),
            };
        });
    })->create();
