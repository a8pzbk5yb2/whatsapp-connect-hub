import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { PhasePlaceholder } from "@/components/common/PhasePlaceholder";

export const Route = createFileRoute("/_admin/admin/settings")({
  head: () => ({
    meta: [
      { title: "Platform settings — WA Platform admin" },
      { name: "description", content: "Branding, pricing, limits and registration controls for the whole platform." },
      { property: "og:title", content: "Platform settings — WA Platform admin" },
      { property: "og:description", content: "Branding, pricing, limits and registration controls." },
    ],
  }),
  component: () => (
    <PhasePlaceholder
      title="Platform settings"
      description="Branding, pricing, limits and registration controls."
      icon={Settings}
      phase="Phase 6"
    />
  ),
});
