import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, HealthBadge, PageHeader, TableSkeleton } from "@/components/common/page-parts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiError, apiRequest } from "@/services/api";
import type { AdminTenantRow } from "@/types";

export const Route = createFileRoute("/_admin/admin/clients")({
  head: () => ({
    meta: [
      { title: "Clients — WA Platform admin" },
      { name: "description", content: "Every customer on the platform, their connection state and status." },
      { property: "og:title", content: "Clients — WA Platform admin" },
      { property: "og:description", content: "Every customer on the platform and their connection state." },
    ],
  }),
  component: AdminClients,
});

function AdminClients() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "tenants"],
    queryFn: () => apiRequest<AdminTenantRow[]>("/admin/tenants"),
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, suspend }: { id: string; suspend: boolean }) =>
      apiRequest(`/admin/tenants/${id}/${suspend ? "suspend" : "activate"}`, { method: "POST" }),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tenants"] });
      toast.success(variables.suspend ? "Client suspended" : "Client reactivated");
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "That change could not be saved."),
  });

  const rows = (data ?? []).filter(
    (row) =>
      row.company_name.toLowerCase().includes(search.toLowerCase()) ||
      row.owner_email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <PageHeader title="Clients" description="Every customer workspace on the platform." />

      <div className="mb-4 max-w-sm">
        <Input placeholder="Search by company or email" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isError ? <ErrorState message="We could not load the client list. Please refresh." /> : null}
      {isLoading ? <TableSkeleton /> : null}

      {!isLoading && rows.length === 0 ? (
        <EmptyState icon={Building2} title="No clients found" description="No customer matches your search." />
      ) : null}

      {!isLoading && rows.length > 0 ? (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.company_name}</TableCell>
                  <TableCell className="text-muted-foreground">{row.owner_email}</TableCell>
                  <TableCell>{row.users}</TableCell>
                  <TableCell>
                    <HealthBadge status={row.whatsapp_status} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.status === "active" ? "secondary" : "destructive"}>
                      {row.status === "active" ? "Active" : "Suspended"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          {row.status === "active" ? "Suspend" : "Reactivate"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {row.status === "active" ? `Suspend ${row.company_name}?` : `Reactivate ${row.company_name}?`}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {row.status === "active"
                              ? "Their team loses access and outgoing messages stop. Historical data is kept."
                              : "Their team regains access and messaging resumes."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => toggleStatus.mutate({ id: row.id, suspend: row.status === "active" })}
                          >
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </>
  );
}
