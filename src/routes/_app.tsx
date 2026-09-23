import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import {
  BarChart3,
  Building2,
  CreditCard,
  Inbox,
  KeyRound,
  LayoutDashboard,
  MessageSquare,
  Megaphone,
  Users,
  Settings,
  Send,
  Webhook,
  FileText,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { getSession, hydrateSession } from "@/stores/auth";

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/whatsapp", label: "WhatsApp", icon: MessageSquare },
  { to: "/inbox", label: "Inbox", icon: Inbox },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/templates", label: "Templates", icon: FileText },
  { to: "/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/messages", label: "Messages", icon: Send },
  { to: "/api", label: "API", icon: KeyRound },
  { to: "/webhooks", label: "Webhooks", icon: Webhook },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/billing", label: "Billing", icon: CreditCard },
  { to: "/team", label: "Team", icon: Building2 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export const Route = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: ({ location }) => {
    hydrateSession();
    const session = getSession();
    if (!session) throw redirect({ to: "/auth/login", search: { redirect: location.href } });
    if (session.user.role === "super_admin") throw redirect({ to: "/admin" });
    if (!session.user.email_verified_at) throw redirect({ to: "/auth/verify-email" });
    if (!session.tenant) throw redirect({ to: "/onboarding" });
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <DashboardShell nav={NAV} areaLabel="Customer workspace">
      <Outlet />
    </DashboardShell>
  );
}
