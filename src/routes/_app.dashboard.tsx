import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { ErrorState, HealthBadge, PageHeader, StatCard } from "@/components/common/page-parts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/services/api";
import { useAuth } from "@/stores/auth";
import type { ClientDashboardStats } from "@/types";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — WA Platform" },
      { name: "description", content: "Your WhatsApp connection status, message volume and usage at a glance." },
      { property: "og:title", content: "Dashboard — WA Platform" },
      { property: "og:description", content: "Your WhatsApp connection status, message volume and usage." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, tenant } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => apiRequest<ClientDashboardStats>("/dashboard/stats"),
  });

  const status = data?.whatsapp_status ?? tenant?.whatsapp_status ?? "disconnected";

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "there"}`}
        description="Here is how your WhatsApp messaging is doing today."
      />

      {isError ? <ErrorState message="We could not load your dashboard figures. Please refresh." /> : null}

      <Card className="mb-6">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>WhatsApp connection</CardTitle>
            <CardDescription>
              {status === "connected"
                ? "Your business is connected and able to send messages."
                : "Connect your WhatsApp Business account to start sending messages."}
            </CardDescription>
          </div>
          <HealthBadge status={status} />
        </CardHeader>
        <CardContent>
          <Button asChild size="lg">
            <Link to="/whatsapp">
              <MessageSquare className="mr-2 size-4" />
              {status === "connected" ? "Manage connection" : "Connect WhatsApp"}
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Messages today" value={data?.messages_today ?? 0} loading={isLoading} />
        <StatCard label="Messages this month" value={data?.messages_month ?? 0} loading={isLoading} />
        <StatCard label="Delivery rate" value={`${data?.delivery_rate ?? 0}%`} loading={isLoading} />
        <StatCard label="Failed messages" value={data?.failed_messages ?? 0} loading={isLoading} />
        <StatCard
          label="Connected number"
          value={data?.connected_number ?? "—"}
          hint="Available once WhatsApp is connected"
          loading={isLoading}
        />
        <StatCard label="Balance" value={`₹${(data?.balance ?? 0).toFixed(2)}`} loading={isLoading} />
        <StatCard label="API calls this month" value={data?.api_usage ?? 0} loading={isLoading} />
        <StatCard label="Team" value={tenant ? tenant.company_name : "—"} hint="Manage members under Team" />
      </div>
    </>
  );
}
