import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Building2, ClipboardList, LayoutDashboard, Plug, Settings } from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { getSession, hydrateSession } from "@/stores/auth";

const NAV: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/clients", label: "Clients", icon: Building2 },
  { to: "/admin/meta", label: "Meta integration", icon: Plug },
  { to: "/admin/audit-logs", label: "Audit logs", icon: ClipboardList },
  { to: "/admin/settings", label: "Platform settings", icon: Settings },
];

export const Route = createFileRoute("/_admin")({
  ssr: false,
  beforeLoad: ({ location }) => {
    hydrateSession();
    const session = getSession();
    if (!session) throw redirect({ to: "/auth/login", search: { redirect: location.href } });
    if (session.user.role !== "super_admin") throw redirect({ to: "/dashboard" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <DashboardShell nav={NAV} areaLabel="Platform administration">
      <Outlet />
    </DashboardShell>
  );
}
