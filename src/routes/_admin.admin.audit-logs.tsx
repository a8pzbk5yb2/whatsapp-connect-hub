import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { EmptyState, ErrorState, PageHeader, TableSkeleton } from "@/components/common/page-parts";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/services/api";
import type { AuditLogRow } from "@/types";

export const Route = createFileRoute("/_admin/admin/audit-logs")({
  head: () => ({
    meta: [
      { title: "Audit logs — WA Platform admin" },
      { name: "description", content: "A record of sensitive actions taken across the platform." },
      { property: "og:title", content: "Audit logs — WA Platform admin" },
      { property: "og:description", content: "A record of sensitive actions taken across the platform." },
    ],
  }),
  component: AdminAuditLogs,
});

function AdminAuditLogs() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "audit-logs"],
    queryFn: () => apiRequest<AuditLogRow[]>("/admin/audit-logs"),
  });

  return (
    <>
      <PageHeader title="Audit logs" description="Who did what, and from where." />
      {isError ? <ErrorState message="We could not load the audit trail. Please refresh." /> : null}
      {isLoading ? <TableSkeleton /> : null}

      {!isLoading && data && data.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Nothing logged yet" description="Actions will appear here as they happen." />
      ) : null}

      {!isLoading && data && data.length > 0 ? (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Badge variant="secondary">{row.action}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.actor}</TableCell>
                  <TableCell className="text-muted-foreground">{row.resource_type}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{row.ip_address}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(row.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </>
  );
}
