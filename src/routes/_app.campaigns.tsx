import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { PhasePlaceholder } from "@/components/common/PhasePlaceholder";

export const Route = createFileRoute("/_app/campaigns")({
  head: () => ({
    meta: [
      { title: "Campaigns — WA Platform" },
      { name: "description", content: "Scheduled bulk template sends with live reporting." },
      { property: "og:title", content: "Campaigns — WA Platform" },
      { property: "og:description", content: "Scheduled bulk template sends with live reporting." },
    ],
  }),
  component: () => (
    <PhasePlaceholder title="Campaigns" description="Scheduled bulk template sends with live reporting." icon={Megaphone} phase="Phase 5" />
  ),
});
