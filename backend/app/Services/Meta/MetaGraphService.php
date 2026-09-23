<?php

namespace App\Services\Meta;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * The single place in the application that talks to the Meta Graph API.
 * Controllers, jobs and (obviously) the React client never call Graph directly.
 * The Graph version always comes from config, never from a literal.
 */
class MetaGraphService
{
    public function baseUrl(): string
    {
        return rtrim((string) config('meta.graph_base_url'), '/').'/'.config('meta.graph_version');
    }

    public function get(string $path, array $query = [], ?string $accessToken = null): array
    {
        return $this->call('GET', $path, ['query' => $query], $accessToken);
    }

    public function post(string $path, array $payload = [], ?string $accessToken = null): array
    {
        return $this->call('POST', $path, ['json' => $payload], $accessToken);
    }

    public function delete(string $path, array $query = [], ?string $accessToken = null): array
    {
        return $this->call('DELETE', $path, ['query' => $query], $accessToken);
    }

    private function call(string $method, string $path, array $options, ?string $accessToken): array
    {
        $request = Http::timeout((int) config('meta.http.timeout'))
            ->retry(
                (int) config('meta.http.retries'),
                (int) config('meta.http.retry_delay_ms'),
                throw: false
            )
            ->acceptJson();

        if ($accessToken) {
            $request = $request->withToken($accessToken);
        }

        $url = $this->baseUrl().'/'.ltrim($path, '/');

        /** @var Response $response */
        $response = $request->send($method, $url, $options);

        $this->logCall($method, $path, $response);

        if ($response->failed()) {
            throw MetaApiException::fromResponse($response);
        }

        return $response->json() ?? [];
    }

    /**
     * Diagnostics only, in server logs. Tokens are never written: the bearer
     * lives in the request object and is not part of what we log.
     */
    private function logCall(string $method, string $path, Response $response): void
    {
        Log::channel('meta')->info('meta.graph.call', [
            'method' => $method,
            'path' => $path,
            'status' => $response->status(),
            'graph_version' => config('meta.graph_version'),
            'request_id' => request()->attributes->get('request_id'),
        ]);
    }
}
