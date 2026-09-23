import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { ApiError, usingFixtures } from "@/services/api";
import {
  getSession,
  hydrateSession,
  markEmailVerified,
  resendVerificationEmail,
  useAuth,
} from "@/stores/auth";

export const Route = createFileRoute("/auth/verify-email")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Confirm your email — WA Platform" },
      { name: "description", content: "Confirm your email address to activate your WA Platform workspace." },
      { property: "og:title", content: "Confirm your email — WA Platform" },
      { property: "og:description", content: "Confirm your email address to activate your workspace." },
    ],
  }),
  beforeLoad: () => {
    hydrateSession();
    const session = getSession();
    if (!session) throw redirect({ to: "/auth/login" });
    if (session.user.email_verified_at) throw redirect({ to: "/dashboard" });
  },
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function resend() {
    setBusy(true);
    try {
      await resendVerificationEmail();
      toast.success("Confirmation email sent again.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "We could not resend the email.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmNow() {
    setBusy(true);
    try {
      await markEmailVerified();
      toast.success("Email confirmed.");
      navigate({ to: "/onboarding", replace: true });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "We could not confirm your email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Confirm your email" description={`We sent a confirmation link to ${user?.email ?? "your inbox"}.`}>
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand-soft-foreground">
          <MailCheck className="size-6" />
        </span>
        <p className="mt-4 text-sm text-muted-foreground">
          Open the link in that email to activate your workspace. You can close this tab afterwards.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button variant="outline" onClick={resend} disabled={busy}>
            Resend confirmation email
          </Button>
          {usingFixtures ? (
            <Button onClick={confirmNow} disabled={busy}>
              Confirm now (demo)
            </Button>
          ) : null}
        </div>
      </div>
    </AuthLayout>
  );
}
