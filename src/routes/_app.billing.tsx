import { createFileRoute } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";
import { PhasePlaceholder } from "@/components/common/PhasePlaceholder";

export const Route = createFileRoute("/_app/billing")({
  head: () => ({
    meta: [
      { title: "Billing — WA Platform" },
      { name: "description", content: "Wallet balance, plans, invoices and usage records." },
      { property: "og:title", content: "Billing — WA Platform" },
      { property: "og:description", content: "Wallet balance, plans, invoices and usage records." },
    ],
  }),
  component: () => (
    <PhasePlaceholder title="Billing" description="Wallet balance, plans, invoices and usage records." icon={CreditCard} phase="Phase 6" />
  ),
});
