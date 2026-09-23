import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { PhasePlaceholder } from "@/components/common/PhasePlaceholder";

export const Route = createFileRoute("/_app/contacts")({
  head: () => ({
    meta: [
      { title: "Contacts — WA Platform" },
      { name: "description", content: "Your customer list with opt-in status and tags." },
      { property: "og:title", content: "Contacts — WA Platform" },
      { property: "og:description", content: "Your customer list with opt-in status and tags." },
    ],
  }),
  component: () => (
    <PhasePlaceholder title="Contacts" description="Your customer list with opt-in status and tags." icon={Users} phase="Phase 4" />
  ),
});
