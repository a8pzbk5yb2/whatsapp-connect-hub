import { createFileRoute } from "@tanstack/react-router";
import { MessagesSquare } from "lucide-react";
import { PhasePlaceholder } from "@/components/common/PhasePlaceholder";

export const Route = createFileRoute("/_app/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox — WA Platform" },
      { name: "description", content: "A shared team inbox for every WhatsApp conversation." },
      { property: "og:title", content: "Inbox — WA Platform" },
      { property: "og:description", content: "A shared team inbox for every WhatsApp conversation." },
    ],
  }),
  component: () => (
    <PhasePlaceholder title="Inbox" description="A shared team inbox for every WhatsApp conversation." icon={MessagesSquare} phase="Phase 4" />
  ),
});
