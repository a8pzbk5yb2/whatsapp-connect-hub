import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/common/page-parts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/services/api";
import { logout, updateOrganization, useAuth } from "@/stores/auth";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — WA Platform" },
      { name: "description", content: "Update your company profile, support email and timezone." },
      { property: "og:title", content: "Settings — WA Platform" },
      { property: "og:description", content: "Update your company profile, support email and timezone." },
    ],
  }),
  component: SettingsPage,
});

const schema = z.object({
  company_name: z.string().min(2, "Enter your company name"),
  support_email: z.string().email("Enter a valid email address"),
  timezone: z.string().min(2, "Enter a timezone"),
});

type FormValues = z.infer<typeof schema>;

function SettingsPage() {
  const { tenant, user } = useAuth();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      company_name: tenant?.company_name ?? "",
      support_email: tenant?.support_email ?? "",
      timezone: tenant?.timezone ?? "Asia/Kolkata",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await updateOrganization(values);
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "We could not save your settings.");
    }
  }

  return (
    <>
      <PageHeader title="Settings" description="Your company profile and account." />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Company profile</CardTitle>
          <CardDescription>Shown to your team and used on notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="max-w-md space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="company_name">Company name</Label>
              <Input id="company_name" {...form.register("company_name")} />
              {form.formState.errors.company_name ? (
                <p className="text-xs text-destructive">{form.formState.errors.company_name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="support_email">Support email</Label>
              <Input id="support_email" type="email" {...form.register("support_email")} />
              {form.formState.errors.support_email ? (
                <p className="text-xs text-destructive">{form.formState.errors.support_email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" {...form.register("timezone")} />
              {form.formState.errors.timezone ? (
                <p className="text-xs text-destructive">{form.formState.errors.timezone.message}</p>
              ) : null}
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your account</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={async () => {
              await logout();
              navigate({ to: "/auth/login", replace: true });
            }}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
