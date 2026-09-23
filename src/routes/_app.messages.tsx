import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { PhasePlaceholder } from "@/components/common/PhasePlaceholder";

export const Route = createFileRoute("/_app/messages")({
  head: () => ({
    meta: [
      { title: "Messages — WA Platform" },
      { name: "description", content: "Every message sent and received, with delivery status." },
      { property: "og:title", content: "Messages — WA Platform" },
      { property: "og:description", content: "Every message sent and received, with delivery status." },
    ],
  }),
  component: () => (
    <PhasePlaceholder title="Message history" description="Every message sent and received, with delivery status." icon={Send} phase="Phase 4" />
  ),
});
