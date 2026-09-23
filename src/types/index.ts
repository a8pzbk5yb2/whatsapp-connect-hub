export type RoleKey = "super_admin" | "tenant_owner" | "tenant_staff";

export const PERMISSIONS = [
  "messages.view",
  "messages.send",
  "contacts.manage",
  "campaigns.manage",
  "templates.view",
  "templates.manage",
  "analytics.view",
  "settings.manage",
  "team.manage",
  "billing.manage",
  "api.manage",
  "whatsapp.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<RoleKey, Permission[]> = {
  super_admin: [...PERMISSIONS],
  tenant_owner: [...PERMISSIONS],
  tenant_staff: ["messages.view", "messages.send", "contacts.manage", "templates.view", "analytics.view"],
};

export const ROLE_LABELS: Record<RoleKey, string> = {
  super_admin: "Super Admin",
  tenant_owner: "Owner",
  tenant_staff: "Staff",
};

export type TenantStatus = "active" | "suspended" | "pending";

export type ConnectionHealth = "connected" | "attention" | "disconnected";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: RoleKey;
  permissions: Permission[];
  email_verified_at: string | null;
  created_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  company_name: string;
  status: TenantStatus;
  support_email?: string | null;
  timezone: string;
  whatsapp_status: ConnectionHealth;
  created_at: string;
}

export interface Session {
  token: string;
  user: User;
  tenant: Tenant | null;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: RoleKey;
  permissions: Permission[];
  status: "active" | "invited";
  created_at: string;
}

export interface ClientDashboardStats {
  whatsapp_status: ConnectionHealth;
  connected_number: string | null;
  messages_today: number;
  messages_month: number;
  delivery_rate: number;
  failed_messages: number;
  balance: number;
  api_usage: number;
}

export interface AdminStats {
  total_clients: number;
  connected_wabas: number;
  connected_numbers: number;
  messages_today: number;
  messages_month: number;
  failed_messages: number;
  active_campaigns: number;
  webhook_errors: number;
}

export interface AdminTenantRow {
  id: string;
  company_name: string;
  owner_email: string;
  status: TenantStatus;
  whatsapp_status: ConnectionHealth;
  users: number;
  created_at: string;
}

export interface MetaSettings {
  app_id_masked: string;
  app_secret_masked: string;
  config_id_masked: string;
  graph_version: string;
  webhook_url: string;
  webhook_status: "connected" | "not_configured";
  environment: string;
}

export interface AuditLogRow {
  id: string;
  action: string;
  actor: string;
  resource_type: string;
  ip_address: string;
  created_at: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: { code: string; details?: unknown };
}
