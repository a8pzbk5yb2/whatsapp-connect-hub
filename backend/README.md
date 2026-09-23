# WhatsApp Platform API — Phase 1 (Foundation)

Laravel 11 / PHP 8.3 API for the multi-tenant WhatsApp Business Platform SaaS.
This folder is not run by the Lovable preview — deploy it on your own server
(MySQL + Redis) and point the React app at it.

## What Phase 1 contains

- Registration, sign-in, sign-out, password reset, email verification (Sanctum tokens)
- Tenants, tenant memberships, roles and permissions (super admin / owner / staff)
- Tenant isolation: `ResolveTenant` derives the tenant from the signed-in user only,
  a global scope constrains every tenant-owned query, policies guard every action
- Audit logging (never stores passwords or tokens)
- Platform admin: client list, suspend/activate, masked Meta settings, audit search
- Meta service layer stubs: `MetaGraphService`, `MetaTokenService`,
  `MetaWebhookService`, `MetaErrorService` — the only places allowed to touch Graph
- Webhook endpoint `/webhooks/meta/whatsapp` with challenge + signature verification
- Queue, logging, Docker, Nginx and Supervisor configuration

Not yet implemented (later phases): Embedded Signup, WABA/number sync, messaging,
templates, inbox, campaigns, API keys, billing.

## Install

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Seed the roles and permissions before first use:

```bash
php artisan db:seed --class=Database\\Seeders\\RolePermissionSeeder
```

## Environment

Meta credentials live here and nowhere else. Only `META_APP_ID` and
`META_CONFIG_ID` may ever be sent to the browser; `META_APP_SECRET`, tokens,
database and Redis credentials must never leave the server.

`META_GRAPH_VERSION` (default `v24.0`) is read from config everywhere — the Graph
version is never hard-coded in code.

## Webhook

Configure in the Meta App dashboard:

- Callback URL: `https://your-domain/webhooks/meta/whatsapp`
- Verify token: the value of `META_WEBHOOK_VERIFY_TOKEN`

GET answers the challenge; POST verifies `X-Hub-Signature-256` and returns 200
immediately — processing is queued, never inline.

## Production

Cloudflare → Nginx → PHP-FPM, with Redis, queue workers and the scheduler under
Supervisor (`docker/supervisord.conf`). Start with:

```bash
docker compose up -d --build
```

## Tests

```bash
php artisan test
```

Covers authentication, RBAC, tenant isolation and admin access control.
