import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, MailCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/services/api";
import { requestPasswordReset } from "@/stores/auth";

const schema = z.object({ email: z.string().email("Enter a valid email address") });
type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/auth/forgot-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset your password — WA Platform" },
      { name: "description", content: "Request a password reset link for your WA Platform workspace." },
      { property: "og:title", content: "Reset your password — WA Platform" },
      { property: "og:description", content: "Request a password reset link for your WA Platform workspace." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  async function onSubmit(values: FormValues) {
    try {
      await requestPasswordReset(values.email);
      setSent(true);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "We could not send the reset link. Please try again.");
    }
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      description="We'll email you a link to choose a new one."
      footer={
        <Link to="/auth/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
            <MailCheck className="size-6" />
          </span>
          <p className="mt-4 text-sm text-foreground">
            If an account exists for that address, a reset link is on its way.
          </p>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
