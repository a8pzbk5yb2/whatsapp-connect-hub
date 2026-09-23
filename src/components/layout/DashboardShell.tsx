import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, ShieldCheck } from "lucide-react";
import { useState, type ComponentType, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { logout, useAuth } from "@/stores/auth";
import { ROLE_LABELS } from "@/types";

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

interface DashboardShellProps {
  nav: NavItem[];
  areaLabel: string;
  children: ReactNode;
}

function NavLinks({ nav, onNavigate }: { nav: NavItem[]; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand({ areaLabel }: { areaLabel: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-4">
      <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <ShieldCheck className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-sidebar-foreground">WA Platform</span>
        <span className="block text-xs text-sidebar-foreground/60">{areaLabel}</span>
      </span>
    </div>
  );
}

export function DashboardShell({ nav, areaLabel, children }: DashboardShellProps) {
  const { user, tenant } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await logout();
    navigate({ to: "/auth/login", replace: true });
  }

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <Brand areaLabel={areaLabel} />
        <div className="flex-1 overflow-y-auto px-3 pb-6">
          <NavLinks nav={nav} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 border-sidebar-border bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Brand areaLabel={areaLabel} />
              <div className="px-3 pb-6">
                <NavLinks nav={nav} onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
            {tenant?.company_name ?? "Platform administration"}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-soft-foreground">
                  {initials}
                </span>
                <span className="hidden text-sm sm:inline">{user?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="space-y-0.5">
                <span className="block text-sm">{user?.name}</span>
                <span className="block text-xs font-normal text-muted-foreground">{user?.email}</span>
                <span className="block text-xs font-normal text-muted-foreground">
                  {user ? ROLE_LABELS[user.role] : ""}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleSignOut}>
                <LogOut className="mr-2 size-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
