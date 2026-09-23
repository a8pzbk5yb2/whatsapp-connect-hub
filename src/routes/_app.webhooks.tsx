import { createFileRoute } from "@tanstack/react-router";
import { Webhook } from "lucide-react";
import { PhasePlaceholder } from "@/components/common/PhasePlaceholder";

export const Route = createFileRoute("/_app/webhooks")({
  head: () => ({
    meta: [
      { title: "Webhooks — WA Platform" },
      { name: "description", content: "Forward message events to your own endpoints." },
      { property: "og:title", content: "Webhooks — WA Platform" },
      { property: "og:description", content: "Forward message events to your own endpoints." },
    ],
  }),
  component: () => (
    <PhasePlaceholder title="Webhooks" description="Forward message events to your own endpoints." icon={Webhook} phase="Phase 3" />
  ),
});
