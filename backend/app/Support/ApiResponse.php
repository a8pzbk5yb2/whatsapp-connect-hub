<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

/**
 * Every API response uses the same envelope:
 * { success, message, data } or { success, message, error: { code } }.
 * Internal exception details never cross this boundary.
 */
class ApiResponse
{
    public static function success(mixed $data = null, string $message = 'OK', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    public static function error(string $code, string $message, int $status = 400, array $details = []): JsonResponse
    {
        $error = ['code' => $code];

        if ($details !== []) {
            $error['details'] = $details;
        }

        return response()->json([
            'success' => false,
            'message' => $message,
            'error' => $error,
        ], $status);
    }
}
