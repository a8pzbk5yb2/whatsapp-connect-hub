# Deploying on shared hosting (cPanel / Plesk / LiteSpeed)

Nothing in this project needs Node.js, Docker or Redis on the server. The
front-end ships as plain static files and the API is a standard PHP application.

## 1. Build the front-end

On your own machine:

```bash
bun install          # or: npm install
bun run build:static # or: npm run build:static
```

Upload **everything inside `dist/client/`** (including the hidden `.htaccess`)
to the web root of your domain — usually `public_html/`.

Set the API address before building, in a `.env` file at the project root:

```
VITE_API_BASE_URL=https://api.your-domain.com
VITE_USE_FIXTURES=false
```

Leaving `VITE_USE_FIXTURES=true` keeps the built-in demo data, which is useful
for showing the interface before the API is live.

## 2. Upload the API

Requirements offered by almost every host: PHP 8.3, MySQL 8, and the standard
PHP extensions (`pdo_mysql`, `mbstring`, `bcmath`, `intl`, `zip`, `openssl`).
Redis is optional, not required.

1. Run `composer install --no-dev --optimize-autoloader` locally, then upload the
   whole `backend/` folder (with `vendor/`) outside or inside `public_html`.
2. Point the domain or subdomain (e.g. `api.your-domain.com`) at
   `backend/public`. If your host cannot change the document root, upload the
   project into the folder the domain serves — the included `backend/.htaccess`
   forwards requests into `public/` and blocks `.env`, `vendor` and `storage`.
3. Copy `.env.example` to `.env`, fill in the database credentials, the app URL,
   the front-end URL and your Meta keys.
4. From the host's Terminal (or a one-off cron line):

```bash
php artisan key:generate
php artisan migrate --force
php artisan db:seed --class=Database\\Seeders\\RolePermissionSeeder --force
php artisan config:cache && php artisan route:cache
```

5. Make `storage/` and `bootstrap/cache/` writable (755, or 775 if PHP runs as a
   different user).

## 3. Two cron jobs

Shared hosting has no Supervisor, so background work runs from cron. Add these
in cPanel → Cron Jobs (replace the path with your own):

```
* * * * * cd /home/USER/backend && php artisan schedule:run >> /dev/null 2>&1
* * * * * cd /home/USER/backend && php artisan queue:work --queue=meta-webhooks,message-send,meta-api,campaigns,template-sync,waba-sync,notifications,analytics --stop-when-empty --max-time=55 --tries=3 >> /dev/null 2>&1
```

The second line starts a worker every minute, empties the queue in priority
order and exits before the next run, so only one worker is ever active.

If your host allows only one cron entry per minute, use the scheduler line and
add `Schedule::command('queue:work --stop-when-empty --max-time=55')->everyMinute();`
to `routes/console.php`.

## 4. No Redis? Nothing to do

`.env.example` already defaults caching, sessions and the queue to MySQL and
files. On a VPS you can switch `CACHE_STORE`, `QUEUE_CONNECTION` and
`SESSION_DRIVER` to `redis` without touching any code.

## 5. Checklist

- `https://api.your-domain.com/up` returns a healthy response
- The site loads and a hard refresh on a deep link such as `/admin/clients` works
- `.env` is not reachable in a browser
- Meta webhook URL points at `https://api.your-domain.com/webhooks/meta/whatsapp`
