import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ErrorState, HealthBadge, PageHeader } from "@/components/common/page-parts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/services/api";
import type { MetaSettings } from "@/types";

export const Route = createFileRoute("/_admin/admin/meta")({
  head: () => ({
    meta: [
      { title: "Meta integration — WA Platform admin" },
      { name: "description", content: "Your Meta application configuration and webhook status, with values masked." },
      { property: "og:title", content: "Meta integration — WA Platform admin" },
      { property: "og:description", content: "Meta application configuration and webhook status." },
    ],
  }),
  component: AdminMeta,
});

function Row({ label, value, loading }: { label: string; value?: string; loading: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      {loading ? <Skeleton className="h-4 w-32" /> : <span className="font-mono text-sm text-foreground">{value}</span>}
    </div>
  );
}

function AdminMeta() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "meta-settings"],
    queryFn: () => apiRequest<MetaSettings>("/admin/meta-settings"),
  });

  return (
    <>
      <PageHeader
        title="Meta integration"
        description="These values live in the server configuration. Secrets are never sent to the browser."
      />

      {isError ? <ErrorState message="We could not load the integration settings. Please refresh." /> : null}

      <Card className="mb-6">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Application</CardTitle>
            <CardDescription>Owned by you, shared by every customer.</CardDescription>
          </div>
          <HealthBadge status={data?.webhook_status === "connected" ? "connected" : "attention"} />
        </CardHeader>
        <CardContent>
          <Row label="App ID" value={data?.app_id_masked} loading={isLoading} />
          <Row label="App secret" value={data?.app_secret_masked} loading={isLoading} />
          <Row label="Signup configuration ID" value={data?.config_id_masked} loading={isLoading} />
          <Row label="Graph API version" value={data?.graph_version} loading={isLoading} />
          <Row label="Environment" value={data?.environment} loading={isLoading} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook</CardTitle>
          <CardDescription>Give this address to Meta when configuring the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <Row label="Callback URL" value={data?.webhook_url} loading={isLoading} />
          <Row
            label="Verification"
            value={data?.webhook_status === "connected" ? "Verified" : "Not configured yet"}
            loading={isLoading}
          />
        </CardContent>
      </Card>
    </>
  );
}
