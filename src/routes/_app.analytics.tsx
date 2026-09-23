import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { PhasePlaceholder } from "@/components/common/PhasePlaceholder";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — WA Platform" },
      { name: "description", content: "Delivery, read and failure trends over time." },
      { property: "og:title", content: "Analytics — WA Platform" },
      { property: "og:description", content: "Delivery, read and failure trends over time." },
    ],
  }),
  component: () => (
    <PhasePlaceholder title="Analytics" description="Delivery, read and failure trends over time." icon={BarChart3} phase="Phase 5" />
  ),
});
