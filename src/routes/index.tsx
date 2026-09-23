import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Building2, Lock, MessagesSquare, ShieldCheck, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/stores/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WA Platform — Multi-tenant WhatsApp Business SaaS" },
      {
        name: "description",
        content:
          "Onboard unlimited customers onto the WhatsApp Business Platform with official Meta Embedded Signup, strict tenant isolation and a full messaging dashboard.",
      },
      { property: "og:title", content: "WA Platform — Multi-tenant WhatsApp Business SaaS" },
      {
        property: "og:description",
        content:
          "Onboard unlimited customers onto the WhatsApp Business Platform with official Meta Embedded Signup and strict tenant isolation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Building2,
    title: "Multi-tenant by design",
    body: "Every record is scoped to a tenant and every request is authorised server-side. No customer can ever see another's data.",
  },
  {
    icon: ShieldCheck,
    title: "Official Meta onboarding",
    body: "Customers connect their own Business Portfolio, WABA and numbers through Meta Embedded Signup. No manual IDs or tokens.",
  },
  {
    icon: MessagesSquare,
    title: "Inbox, templates, campaigns",
    body: "A shared team inbox, template sync, and queue-driven campaigns built on the WhatsApp Business Platform.",
  },
  {
    icon: Workflow,
    title: "Reliable webhooks",
    body: "Signed, idempotent webhook ingestion with queue workers, retries and dead-letter handling.",
  },
  {
    icon: Lock,
    title: "Encrypted credentials",
    body: "Access tokens are encrypted at rest, masked in logs and never reach the browser.",
  },
  {
    icon: BarChart3,
    title: "Usage and billing ready",
    body: "Wallets, plans, usage records and per-tenant rate limits sit alongside full audit logging.",
  },
];

function Landing() {
  const { isAuthenticated, isSuperAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </span>
            <span className="font-semibold text-foreground">WA Platform</span>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button asChild>
                <Link to={isSuperAdmin ? "/admin" : "/dashboard"}>Go to dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link to="/auth/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth/register">Create account</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand-soft-foreground">
          WhatsApp Business Platform
        </p>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Run your own WhatsApp messaging platform for every one of your customers.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          One Meta application, unlimited customers. Each business connects its own WhatsApp account through Meta's
          official flow, and starts messaging in minutes — with no manual setup from your team.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/auth/register">Get started free</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/auth/login">Sign in to your workspace</Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-border bg-card/40">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="pt-6">
                <span className="flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                  <feature.icon className="size-5" />
                </span>
                <h2 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground sm:px-6">
          Built on the official Meta WhatsApp Business Platform APIs.
        </div>
      </footer>
    </div>
  );
}
