import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ErrorState, PageHeader, StatCard } from "@/components/common/page-parts";
import { apiRequest } from "@/services/api";
import type { AdminStats } from "@/types";

export const Route = createFileRoute("/_admin/admin/")({
  head: () => ({
    meta: [
      { title: "Platform overview — WA Platform admin" },
      { name: "description", content: "Customer count, connected accounts and message volume across the platform." },
      { property: "og:title", content: "Platform overview — WA Platform admin" },
      { property: "og:description", content: "Customer count, connected accounts and message volume." },
    ],
  }),
  component: AdminOverview,
});

function AdminOverview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => apiRequest<AdminStats>("/admin/stats"),
  });

  return (
    <>
      <PageHeader title="Platform overview" description="Everything happening across your customers." />
      {isError ? <ErrorState message="We could not load the platform figures. Please refresh." /> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total clients" value={data?.total_clients ?? 0} loading={isLoading} />
        <StatCard label="Connected accounts" value={data?.connected_wabas ?? 0} loading={isLoading} />
        <StatCard label="Connected numbers" value={data?.connected_numbers ?? 0} loading={isLoading} />
        <StatCard label="Messages today" value={data?.messages_today ?? 0} loading={isLoading} />
        <StatCard label="Messages this month" value={data?.messages_month ?? 0} loading={isLoading} />
        <StatCard label="Failed messages" value={data?.failed_messages ?? 0} loading={isLoading} />
        <StatCard label="Active campaigns" value={data?.active_campaigns ?? 0} loading={isLoading} />
        <StatCard label="Webhook errors" value={data?.webhook_errors ?? 0} loading={isLoading} />
      </div>
    </>
  );
}
