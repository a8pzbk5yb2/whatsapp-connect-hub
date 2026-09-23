import { useSyncExternalStore } from "react";
import { apiRequest, configureApi } from "@/services/api";
import type { Permission, Session, Tenant } from "@/types";

const STORAGE_KEY = "wasaas.session";

let session: Session | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function persist() {
  if (typeof localStorage === "undefined") return;
  if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  else localStorage.removeItem(STORAGE_KEY);
}

export function hydrateSession() {
  if (hydrated || typeof localStorage === "undefined") return;
  hydrated = true;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      session = JSON.parse(raw) as Session;
    } catch {
      session = null;
    }
  }
  emit();
}

export function getSession(): Session | null {
  return session;
}

export function setSession(next: Session | null) {
  session = next;
  persist();
  emit();
}

export function isAuthenticated() {
  return Boolean(session?.token);
}

export function hasPermission(permission: Permission) {
  return session?.user.permissions.includes(permission) ?? false;
}

export function isSuperAdmin() {
  return session?.user.role === "super_admin";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSession() {
  return useSyncExternalStore(
    subscribe,
    () => session,
    () => null,
  );
}

export function useAuth() {
  const current = useSession();
  return {
    session: current,
    user: current?.user ?? null,
    tenant: current?.tenant ?? null,
    isAuthenticated: Boolean(current?.token),
    isSuperAdmin: current?.user.role === "super_admin",
    can: (permission: Permission) => current?.user.permissions.includes(permission) ?? false,
  };
}

configureApi({
  getToken: () => session?.token ?? null,
  onUnauthorized: () => {
    if (session) setSession(null);
  },
});

// ---- auth actions ----

export async function login(input: { email: string; password: string }) {
  const next = await apiRequest<Session>("/auth/login", { method: "POST", body: input, skipAuthRedirect: true });
  setSession(next);
  return next;
}

export async function register(input: {
  name: string;
  email: string;
  phone: string;
  company_name: string;
  password: string;
}) {
  const next = await apiRequest<Session>("/auth/register", { method: "POST", body: input, skipAuthRedirect: true });
  setSession(next);
  return next;
}

export async function logout() {
  try {
    await apiRequest("/auth/logout", { method: "POST", skipAuthRedirect: true });
  } catch {
    // signing out locally is enough even if the server call fails
  }
  setSession(null);
}

export async function refreshSession() {
  const next = await apiRequest<Session>("/auth/me");
  setSession(next);
  return next;
}

export async function markEmailVerified() {
  const next = await apiRequest<Session>("/auth/email/verify", { method: "POST" });
  setSession(next);
  return next;
}

export async function resendVerificationEmail() {
  await apiRequest("/auth/email/resend", { method: "POST" });
}

export async function requestPasswordReset(email: string) {
  await apiRequest("/auth/password/forgot", { method: "POST", body: { email }, skipAuthRedirect: true });
}

export async function resetPassword(input: { token: string; email: string; password: string }) {
  await apiRequest("/auth/password/reset", { method: "POST", body: input, skipAuthRedirect: true });
}

export async function createOrganization(input: { company_name: string; support_email?: string; timezone?: string }) {
  const next = await apiRequest<Session>("/tenant", { method: "POST", body: input });
  setSession(next);
  return next;
}

export async function updateOrganization(input: {
  company_name?: string;
  support_email?: string;
  timezone?: string;
}) {
  const tenant = await apiRequest<Tenant>("/tenant", { method: "PATCH", body: input });
  if (session) setSession({ ...session, tenant });
  return tenant;
}
