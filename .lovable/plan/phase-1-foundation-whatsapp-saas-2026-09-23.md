# Phase 1 — Foundation: WhatsApp SaaS

Delivering the foundation only: accounts, organisations, roles, and the two dashboard shells (platform admin + client). Meta onboarding, messaging, inbox, campaigns and billing come in later phases.

Two parts ship together:
1. A working React dashboard you can click through in the preview.
2. A Laravel codebase written into a `backend/` folder — real files you deploy on your own server with MySQL and Redis. It cannot run inside this preview.

## What you will see

- Sign up, log in, log out, forgot/reset password, email-verification screens.
- Organisation creation on first login, then the client dashboard.
- Client dashboard shell: sidebar with Dashboard, WhatsApp, Inbox, Contacts, Templates, Campaigns, Messages, API, Webhooks, Analytics, Billing, Team, Settings. Phase 1 fills in Dashboard, Team and Settings; the rest are proper "coming soon" empty states so navigation is complete.
- A prominent "Connect WhatsApp" card showing "Not connected" — the button is present but the Meta flow lands in Phase 2.
- Admin dashboard shell: overview cards, Clients list, and Meta Integration settings page with masked values.
- Team page: invite members, assign role, revoke.
- Status badges, toasts, confirm dialogs, loading skeletons, empty and error states throughout.

## Design direction

Modern SaaS, desktop-first admin and mobile-friendly client area. Deep green/teal brand accent (fits WhatsApp without copying it), neutral slate surfaces, clear status colours for connected / attention / disconnected. All colours defined as design tokens; no purple-on-white default look.

## Frontend technical scope

- Routes under `src/routes/`: `auth/*` (login, register, forgot, reset, verify), `_app/*` for the client area, `_admin/*` for the platform area, each with its own layout and route guard.
- TanStack Query for all server reads, React Hook Form + Zod for every form.
- `src/services/api.ts`: a single fetch client pointing at `VITE_API_BASE_URL`, attaching the Sanctum bearer token, normalising the `{ success, message, data, error }` envelope, and redirecting to login on 401.
- `src/stores/auth.ts`: session + current tenant + permission helpers; `can('messages.send')` style checks drive menu visibility.
- Typed API contracts in `src/types/` mirroring the Laravel resources.
- Until the Laravel API is reachable, the client runs against a dev fixture layer toggled by one env flag, so the UI is demoable. No fake data is baked into components.

## Laravel technical scope (`backend/`, deploy-yourself)

- Laravel 11, PHP 8.3, Sanctum token auth, MySQL 8, Redis queue/cache config.
- Migrations + models: `users`, `tenants`, `tenant_users`, `roles`, `permissions`, `role_permissions`, `audit_logs`, `system_settings`. Every tenant-owned table carries `tenant_id`.
- `ResolveTenant` middleware derives the tenant from the authenticated user only — never from a request field. A global scope plus policies enforce isolation on every model.
- Roles seeded: super admin, tenant owner, tenant staff with the configurable permission list from the spec.
- Controllers/requests for register, login, logout, me, password reset, email verification, tenant profile, team invite/role/remove, admin tenant list and suspend.
- Audit log writer for the Phase 1 actions (user invited, settings updated, tenant suspended).
- Config stubs for `META_*` env keys (read from env, never hard-coded, never returned to the browser except App ID and Config ID) plus placeholder service classes `MetaGraphService`, `MetaTokenService`, `MetaWebhookService` so Phase 2 slots in.
- `.env.example`, Dockerfile + docker-compose (nginx, php-fpm, mysql, redis, supervisor worker), and a README with deployment steps.
- Feature tests for auth, RBAC and cross-tenant access denial.

## Meta credentials

Nothing to enter yet. Phase 2 needs App ID, Config ID, App Secret, webhook verify token and webhook secret — those go into the Laravel `.env` on your server, not into this frontend.

## Out of scope for this phase

Embedded Signup, webhooks, messaging, templates, inbox, campaigns, API keys, wallet/billing, analytics charts with real data.
