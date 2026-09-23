import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/services/api";
import { createOrganization, getSession, hydrateSession } from "@/stores/auth";

const schema = z.object({
  company_name: z.string().min(2, "Enter your company name"),
  support_email: z.string().email("Enter a valid email address"),
  timezone: z.string().min(2, "Enter a timezone"),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create your organisation — WA Platform" },
      { name: "description", content: "Set up your company workspace before connecting WhatsApp." },
      { property: "og:title", content: "Create your organisation — WA Platform" },
      { property: "og:description", content: "Set up your company workspace before connecting WhatsApp." },
    ],
  }),
  beforeLoad: () => {
    hydrateSession();
    const session = getSession();
    if (!session) throw redirect({ to: "/auth/login" });
    if (session.user.role === "super_admin") throw redirect({ to: "/admin" });
    if (session.tenant) throw redirect({ to: "/dashboard" });
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const session = getSession();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company_name: "",
      support_email: session?.user.email ?? "",
      timezone: "Asia/Kolkata",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await createOrganization(values);
      toast.success("Organisation created");
      navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "We could not create your organisation.");
    }
  }

  const errors = form.formState.errors;

  return (
    <AuthLayout title="Create your organisation" description="One workspace per company. You can invite your team next.">
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <Label htmlFor="company_name">Company name</Label>
          <Input id="company_name" {...form.register("company_name")} />
          {errors.company_name ? <p className="text-xs text-destructive">{errors.company_name.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="support_email">Support email</Label>
          <Input id="support_email" type="email" {...form.register("support_email")} />
          {errors.support_email ? <p className="text-xs text-destructive">{errors.support_email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input id="timezone" {...form.register("timezone")} />
          {errors.timezone ? <p className="text-xs text-destructive">{errors.timezone.message}</p> : null}
        </div>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          Continue
        </Button>
      </form>
    </AuthLayout>
  );
}
