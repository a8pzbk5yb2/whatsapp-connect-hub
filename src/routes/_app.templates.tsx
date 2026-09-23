import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { PhasePlaceholder } from "@/components/common/PhasePlaceholder";

export const Route = createFileRoute("/_app/templates")({
  head: () => ({
    meta: [
      { title: "Templates — WA Platform" },
      { name: "description", content: "Message templates synchronised from WhatsApp." },
      { property: "og:title", content: "Templates — WA Platform" },
      { property: "og:description", content: "Message templates synchronised from WhatsApp." },
    ],
  }),
  component: () => (
    <PhasePlaceholder title="Templates" description="Message templates synchronised from WhatsApp." icon={FileText} phase="Phase 4" />
  ),
});
