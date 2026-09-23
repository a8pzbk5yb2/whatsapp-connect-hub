import { createFileRoute } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { PhasePlaceholder } from "@/components/common/PhasePlaceholder";

export const Route = createFileRoute("/_app/api")({
  head: () => ({
    meta: [
      { title: "API — WA Platform" },
      { name: "description", content: "Keys and documentation for sending messages from your own systems." },
      { property: "og:title", content: "API — WA Platform" },
      { property: "og:description", content: "Keys and documentation for sending messages from your own systems." },
    ],
  }),
  component: () => (
    <PhasePlaceholder title="API keys" description="Keys and documentation for sending messages from your own systems." icon={KeyRound} phase="Phase 6" />
  ),
});
