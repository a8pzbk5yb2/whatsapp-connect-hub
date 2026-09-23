import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { HealthBadge, PageHeader } from "@/components/common/page-parts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/stores/auth";

export const Route = createFileRoute("/_app/whatsapp")({
  head: () => ({
    meta: [
      { title: "WhatsApp connection — WA Platform" },
      { name: "description", content: "Connect your WhatsApp Business account through Meta's official signup flow." },
      { property: "og:title", content: "WhatsApp connection — WA Platform" },
      { property: "og:description", content: "Connect your WhatsApp Business account through Meta's official flow." },
    ],
  }),
  component: WhatsAppPage,
});

const STEPS = [
  "Meta authorisation",
  "Business detected",
  "WhatsApp account detected",
  "Phone number detected",
  "Webhook connected",
  "Templates synchronised",
];

function WhatsAppPage() {
  const { tenant } = useAuth();
  const status = tenant?.whatsapp_status ?? "disconnected";

  return (
    <>
      <PageHeader
        title="WhatsApp connection"
        description="Your business connects directly with Meta. We never ask for your Facebook password."
        action={<HealthBadge status={status} />}
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{status === "connected" ? "Connected" : "Not connected yet"}</CardTitle>
          <CardDescription>
            {status === "connected"
              ? "Your WhatsApp Business account is linked to this workspace."
              : "Start the official Meta signup to link your Business Portfolio, WhatsApp account and phone number."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Business</dt>
              <dd className="mt-1 text-sm text-foreground">—</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">WhatsApp account</dt>
              <dd className="mt-1 text-sm text-foreground">—</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Phone number</dt>
              <dd className="mt-1 text-sm text-foreground">—</dd>
            </div>
          </dl>

          <Button
            size="lg"
            onClick={() =>
              toast.info("Meta signup is being enabled", {
                description: "Connecting a live WhatsApp Business account becomes available in the next phase.",
              })
            }
          >
            <MessageSquare className="mr-2 size-4" /> Connect WhatsApp
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What happens when you connect</CardTitle>
          <CardDescription>Each step is completed automatically — nothing to type in by hand.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {STEPS.map((step) => (
              <li key={step} className="flex items-center gap-3 text-sm text-muted-foreground">
                {status === "connected" ? (
                  <CheckCircle2 className="size-4 text-success" />
                ) : (
                  <Circle className="size-4" />
                )}
                {step}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </>
  );
}
