<?php

use Illuminate\Support\Facades\Schedule;

/*
 * Scheduled reconciliation. The jobs themselves arrive with their phases; the
 * cadence is fixed here so the scheduler contract is stable.
 */

// Schedule::job(new SyncWabaHealth)->hourly();
// Schedule::job(new SyncTemplates)->everySixHours();
// Schedule::job(new CheckTokenStatus)->daily();
// Schedule::job(new RetryFailedWebhooks)->everyFifteenMinutes();

Schedule::command('queue:prune-failed --hours=168')->daily();
