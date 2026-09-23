import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, usingFixtures } from "@/services/api";
import { getSession, hydrateSession, isSuperAdmin, login } from "@/stores/auth";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/auth/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — WA Platform" },
      { name: "description", content: "Sign in to your WhatsApp Business workspace." },
      { property: "og:title", content: "Sign in — WA Platform" },
      { property: "og:description", content: "Sign in to your WhatsApp Business workspace." },
    ],
  }),
  beforeLoad: () => {
    hydrateSession();
    if (getSession()) throw redirect({ to: isSuperAdmin() ? "/admin" : "/dashboard" });
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      const session = await login(values);
      toast.success("Welcome back");
      if (session.user.role === "super_admin") navigate({ to: "/admin", replace: true });
      else if (!session.tenant) navigate({ to: "/onboarding", replace: true });
      else navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "We could not sign you in. Please try again.");
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      description="Access your WhatsApp Business workspace."
      footer={
        <span>
          Don't have an account?{" "}
          <Link to="/auth/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </span>
      }
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email ? (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/auth/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
          {form.formState.errors.password ? (
            <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          Sign in
        </Button>
      </form>

      {usingFixtures ? (
        <div className="mt-6 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Demo accounts</p>
          <p className="mt-1">Customer: owner@demo.test / password</p>
          <p>Platform admin: admin@platform.test / password</p>
        </div>
      ) : null}
    </AuthLayout>
  );
}
