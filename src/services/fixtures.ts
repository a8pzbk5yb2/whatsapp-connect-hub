/**
 * Development fixture layer.
 *
 * Active only while VITE_API_BASE_URL is unset (or VITE_USE_FIXTURES=true).
 * It emulates the Laravel API envelope so the dashboard is demoable before the
 * backend in ./backend is deployed. No component imports this directly.
 */
import {
  ROLE_PERMISSIONS,
  type AdminStats,
  type AdminTenantRow,
  type AuditLogRow,
  type ClientDashboardStats,
  type MetaSettings,
  type RoleKey,
  type Session,
  type TeamMember,
  type Tenant,
  type User,
} from "@/types";

interface StoredAccount {
  user: User;
  tenant: Tenant | null;
  password: string;
  team: TeamMember[];
}

interface FixtureDb {
  accounts: Record<string, StoredAccount>;
  tokens: Record<string, string>;
}

const DB_KEY = "wasaas.fixture.db";

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function seed(): FixtureDb {
  const adminUser: User = {
    id: "usr_admin",
    name: "Platform Admin",
    email: "admin@platform.test",
    phone: "+910000000000",
    role: "super_admin",
    permissions: ROLE_PERMISSIONS.super_admin,
    email_verified_at: nowIso(),
    created_at: nowIso(),
  };
  const ownerUser: User = {
    id: "usr_owner",
    name: "Demo Owner",
    email: "owner@demo.test",
    phone: "+919999999999",
    role: "tenant_owner",
    permissions: ROLE_PERMISSIONS.tenant_owner,
    email_verified_at: nowIso(),
    created_at: nowIso(),
  };
  const tenant: Tenant = {
    id: "tnt_demo",
    name: "Demo Workspace",
    company_name: "Demo Pvt Ltd",
    status: "active",
    support_email: "support@demo.test",
    timezone: "Asia/Kolkata",
    whatsapp_status: "disconnected",
    created_at: nowIso(),
  };
  return {
    accounts: {
      "admin@platform.test": { user: adminUser, tenant: null, password: "password", team: [] },
      "owner@demo.test": {
        user: ownerUser,
        tenant,
        password: "password",
        team: [
          {
            id: ownerUser.id,
            name: ownerUser.name,
            email: ownerUser.email,
            role: "tenant_owner",
            permissions: ROLE_PERMISSIONS.tenant_owner,
            status: "active",
            created_at: nowIso(),
          },
        ],
      },
    },
    tokens: {},
  };
}

function read(): FixtureDb {
  if (typeof localStorage === "undefined") return seed();
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const fresh = seed();
    localStorage.setItem(DB_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    return JSON.parse(raw) as FixtureDb;
  } catch {
    const fresh = seed();
    localStorage.setItem(DB_KEY, JSON.stringify(fresh));
    return fresh;
  }
}

function write(db: FixtureDb) {
  if (typeof localStorage !== "undefined") localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function accountForToken(db: FixtureDb, token: string | null): StoredAccount {
  const email = token ? db.tokens[token] : undefined;
  const account = email ? db.accounts[email] : undefined;
  if (!account) throw new FixtureError("UNAUTHENTICATED", "Your session has expired. Please sign in again.", 401);
  return account;
}

export class FixtureError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

function sessionFor(account: StoredAccount, token: string): Session {
  return { token, user: account.user, tenant: account.tenant };
}

const clientStats: ClientDashboardStats = {
  whatsapp_status: "disconnected",
  connected_number: null,
  messages_today: 0,
  messages_month: 0,
  delivery_rate: 0,
  failed_messages: 0,
  balance: 0,
  api_usage: 0,
};

const adminStats: AdminStats = {
  total_clients: 2,
  connected_wabas: 0,
  connected_numbers: 0,
  messages_today: 0,
  messages_month: 0,
  failed_messages: 0,
  active_campaigns: 0,
  webhook_errors: 0,
};

const metaSettings: MetaSettings = {
  app_id_masked: "1234567•••",
  app_secret_masked: "••••••••••••",
  config_id_masked: "9876543•••",
  graph_version: "v24.0",
  webhook_url: "https://your-api.example.com/webhooks/meta/whatsapp",
  webhook_status: "not_configured",
  environment: "local",
};

