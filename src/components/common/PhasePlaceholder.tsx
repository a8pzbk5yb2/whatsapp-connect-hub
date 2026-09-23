import type { ComponentType } from "react";
import { EmptyState, PageHeader } from "@/components/common/page-parts";

export function PhasePlaceholder({
  title,
  description,
  icon,
  phase,
}: {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  phase: string;
}) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={icon}
        title={`${title} arrives in ${phase}`}
        description="This area is part of the roadmap and is not available yet. The navigation is in place so the flow is complete."
      />
    </>
  );
}
