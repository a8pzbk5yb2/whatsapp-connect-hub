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

export async function fixtureRequest<T>(
  method: string,
  path: string,
  body: unknown,
  token: string | null,
): Promise<T> {
  await new Promise((r) => setTimeout(r, 220));
  const db = read();
  const raw = (body ?? {}) as Record<string, unknown>;
  const str = (key: string) => (typeof raw[key] === "string" ? (raw[key] as string) : "");
  const key = `${method} ${path}`;

  // ---- auth ----
  if (key === "POST /auth/register") {
    const email = str("email").toLowerCase();
    if (!email) throw new FixtureError("VALIDATION_ERROR", "Email is required.", 422);
    if (db.accounts[email]) throw new FixtureError("EMAIL_TAKEN", "An account with this email already exists.", 422);
    const user: User = {
      id: uid("usr"),
      name: str("name"),
      email,
      phone: str("phone") || null,
      role: "tenant_owner",
      permissions: ROLE_PERMISSIONS.tenant_owner,
      email_verified_at: null,
      created_at: nowIso(),
    };
    const companyName = str("company_name");
    const tenant: Tenant | null = companyName
      ? {
          id: uid("tnt"),
          name: companyName,
          company_name: companyName,
          status: "active",
          support_email: email,
          timezone: "Asia/Kolkata",
          whatsapp_status: "disconnected",
          created_at: nowIso(),
        }
      : null;
    const account: StoredAccount = {
      user,
      tenant,
      password: str("password"),
      team: [
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: "tenant_owner",
          permissions: ROLE_PERMISSIONS.tenant_owner,
          status: "active",
          created_at: nowIso(),
        },
      ],
    };
    db.accounts[email] = account;
    const registerToken = uid("tok");
    db.tokens[registerToken] = email;
    write(db);
    return sessionFor(account, registerToken) as T;
  }

  if (key === "POST /auth/login") {
    const email = str("email").toLowerCase();
    const account = db.accounts[email];
    if (!account || account.password !== str("password")) {
      throw new FixtureError("INVALID_CREDENTIALS", "Those sign-in details did not match our records.", 401);
    }
    const loginToken = uid("tok");
    db.tokens[loginToken] = email;
    write(db);
    return sessionFor(account, loginToken) as T;
  }

  if (key === "POST /auth/logout") {
    if (token) delete db.tokens[token];
    write(db);
    return { ok: true } as T;
  }

  if (key === "GET /auth/me") {
    const account = accountForToken(db, token);
    return sessionFor(account, token as string) as T;
  }

  if (key === "POST /auth/email/verify") {
    const account = accountForToken(db, token);
    account.user.email_verified_at = nowIso();
    write(db);
    return sessionFor(account, token as string) as T;
  }

  if (
    key === "POST /auth/email/resend" ||
    key === "POST /auth/password/forgot" ||
    key === "POST /auth/password/reset"
  ) {
    return { ok: true } as T;
  }

  // ---- tenant ----
  if (key === "POST /tenant") {
    const account = accountForToken(db, token);
    const companyName = str("company_name");
    account.tenant = {
      id: uid("tnt"),
      name: companyName,
      company_name: companyName,
      status: "active",
      support_email: str("support_email") || account.user.email,
      timezone: str("timezone") || "Asia/Kolkata",
      whatsapp_status: "disconnected",
      created_at: nowIso(),
    };
    if (account.team.length === 0) {
      account.team.push({
        id: account.user.id,
        name: account.user.name,
        email: account.user.email,
        role: "tenant_owner",
        permissions: ROLE_PERMISSIONS.tenant_owner,
        status: "active",
        created_at: nowIso(),
      });
    }
    write(db);
    return sessionFor(account, token as string) as T;
  }

  if (key === "PATCH /tenant") {
    const account = accountForToken(db, token);
    const current = account.tenant;
    if (!current) throw new FixtureError("NO_TENANT", "No organisation found for this account.", 404);
    const companyName = str("company_name") || current.company_name;
    account.tenant = {
      ...current,
      company_name: companyName,
      name: companyName,
      support_email: str("support_email") || current.support_email || null,
      timezone: str("timezone") || current.timezone,
    };
    write(db);
    return account.tenant as T;
  }

  if (key === "GET /tenant/team") {
    const account = accountForToken(db, token);
    return account.team as T;
  }

  if (key === "POST /tenant/team") {
    const account = accountForToken(db, token);
    const email = str("email").toLowerCase();
    if (account.team.some((m) => m.email === email)) {
      throw new FixtureError("MEMBER_EXISTS", "That person is already on your team.", 422);
    }
    const role = (str("role") || "tenant_staff") as RoleKey;
    account.team.push({
      id: uid("mem"),
      name: str("name"),
      email,
      role,
      permissions: ROLE_PERMISSIONS[role],
      status: "invited",
      created_at: nowIso(),
    });
    write(db);
    return account.team as T;
  }

  if (method === "PATCH" && path.startsWith("/tenant/team/")) {
    const account = accountForToken(db, token);
    const id = path.split("/").pop();
    const member = account.team.find((m) => m.id === id);
    if (!member) throw new FixtureError("NOT_FOUND", "That team member no longer exists.", 404);
    const role = str("role") as RoleKey;
    member.role = role;
    member.permissions = ROLE_PERMISSIONS[role];
    write(db);
    return account.team as T;
  }

  if (method === "DELETE" && path.startsWith("/tenant/team/")) {
    const account = accountForToken(db, token);
    const id = path.split("/").pop();
    account.team = account.team.filter((m) => m.id !== id);
    write(db);
    return account.team as T;
  }

  // ---- dashboards ----
  if (key === "GET /dashboard/stats") {
    accountForToken(db, token);
    return clientStats as T;
  }

  if (key === "GET /admin/stats") return adminStats as T;

  if (key === "GET /admin/tenants") {
    const rows: AdminTenantRow[] = Object.values(db.accounts)
      .filter((a): a is StoredAccount & { tenant: Tenant } => a.tenant !== null)
      .map((a) => ({
        id: a.tenant.id,
        company_name: a.tenant.company_name,
        owner_email: a.user.email,
        status: a.tenant.status,
        whatsapp_status: a.tenant.whatsapp_status,
        users: a.team.length,
        created_at: a.tenant.created_at,
      }));
    return rows as T;
  }

  if (method === "POST" && path.startsWith("/admin/tenants/")) {
    const id = path.split("/")[3];
    const account = Object.values(db.accounts).find((a) => a.tenant?.id === id);
    if (account?.tenant) {
      account.tenant.status = path.endsWith("/suspend") ? "suspended" : "active";
      write(db);
    }
    return { ok: true } as T;
  }

  if (key === "GET /admin/meta-settings") return metaSettings as T;

  if (key === "GET /admin/audit-logs") {
    const rows: AuditLogRow[] = [
      {
        id: "log_1",
        action: "USER_REGISTERED",
        actor: "owner@demo.test",
        resource_type: "user",
        ip_address: "127.0.0.1",
        created_at: nowIso(),
      },
      {
        id: "log_2",
        action: "SETTINGS_UPDATED",
        actor: "admin@platform.test",
        resource_type: "system_settings",
        ip_address: "127.0.0.1",
        created_at: nowIso(),
      },
    ];
    return rows as T;
  }

  throw new FixtureError("NOT_IMPLEMENTED", "This feature arrives in a later phase.", 501);
}
