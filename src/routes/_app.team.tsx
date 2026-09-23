import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Trash2, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { EmptyState, ErrorState, PageHeader, TableSkeleton } from "@/components/common/page-parts";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiError, apiRequest } from "@/services/api";
import { useAuth } from "@/stores/auth";
import { ROLE_LABELS, type RoleKey, type TeamMember } from "@/types";

export const Route = createFileRoute("/_app/team")({
  head: () => ({
    meta: [
      { title: "Team — WA Platform" },
      { name: "description", content: "Invite colleagues and control what each of them can do in your workspace." },
      { property: "og:title", content: "Team — WA Platform" },
      { property: "og:description", content: "Invite colleagues and control what each of them can do." },
    ],
  }),
  component: TeamPage,
});

const inviteSchema = z.object({
  name: z.string().min(2, "Enter their name"),
  email: z.string().email("Enter a valid email address"),
  role: z.enum(["tenant_owner", "tenant_staff"]),
});

type InviteValues = z.infer<typeof inviteSchema>;

function TeamPage() {
  const queryClient = useQueryClient();
  const { can, user } = useAuth();
  const [open, setOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["team"],
    queryFn: () => apiRequest<TeamMember[]>("/tenant/team"),
  });

  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { name: "", email: "", role: "tenant_staff" },
  });

  const invite = useMutation({
    mutationFn: (values: InviteValues) => apiRequest<TeamMember[]>("/tenant/team", { method: "POST", body: values }),
    onSuccess: (members) => {
      queryClient.setQueryData(["team"], members);
      toast.success("Invitation sent");
      form.reset();
      setOpen(false);
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "We could not send that invitation."),
  });

  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: RoleKey }) =>
      apiRequest<TeamMember[]>(`/tenant/team/${id}`, { method: "PATCH", body: { role } }),
    onSuccess: (members) => {
      queryClient.setQueryData(["team"], members);
      toast.success("Role updated");
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "We could not update that role."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiRequest<TeamMember[]>(`/tenant/team/${id}`, { method: "DELETE" }),
    onSuccess: (members) => {
      queryClient.setQueryData(["team"], members);
      toast.success("Member removed");
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "We could not remove that member."),
  });

  const canManage = can("team.manage");

  return (
    <>
      <PageHeader
        title="Team"
        description="Invite colleagues and decide what each of them can do."
        action={
          canManage ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 size-4" /> Invite member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={form.handleSubmit((values) => invite.mutate(values))} noValidate>
                  <DialogHeader>
                    <DialogTitle>Invite a team member</DialogTitle>
                    <DialogDescription>They will receive an email to set their password.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-name">Name</Label>
                      <Input id="invite-name" {...form.register("name")} />
                      {form.formState.errors.name ? (
                        <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-email">Email</Label>
                      <Input id="invite-email" type="email" {...form.register("email")} />
                      {form.formState.errors.email ? (
                        <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-role">Role</Label>
                      <Select
                        value={form.watch("role")}
                        onValueChange={(value) => form.setValue("role", value as "tenant_owner" | "tenant_staff")}
                      >
                        <SelectTrigger id="invite-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tenant_staff">Staff — limited access</SelectItem>
                          <SelectItem value="tenant_owner">Owner — full access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={invite.isPending}>
                      {invite.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                      Send invitation
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          ) : null
        }
      />

      {isError ? <ErrorState message="We could not load your team. Please refresh." /> : null}
      {isLoading ? <TableSkeleton /> : null}

      {!isLoading && data && data.length === 0 ? (
        <EmptyState icon={Users} title="No team members yet" description="Invite a colleague to share the workload." />
      ) : null}

      {!isLoading && data && data.length > 0 ? (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                  <TableCell>
                    {canManage && member.id !== user?.id ? (
                      <Select
                        value={member.role}
                        onValueChange={(role) => changeRole.mutate({ id: member.id, role: role as RoleKey })}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tenant_staff">Staff</SelectItem>
                          <SelectItem value="tenant_owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      ROLE_LABELS[member.role]
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.status === "active" ? "secondary" : "outline"}>
                      {member.status === "active" ? "Active" : "Invited"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canManage && member.id !== user?.id ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={`Remove ${member.name}`}>
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove {member.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              They will lose access to this workspace immediately. You can invite them again later.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => remove.mutate(member.id)}>Remove</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : null}
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
