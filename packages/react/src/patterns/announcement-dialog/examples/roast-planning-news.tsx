import type { ReactElement } from "react";
import { AnnouncementDialog, Button } from "@buttery/react";

/** What's new behind a button; with a `storageKey` it would also open by itself on a first visit. */
export function RoastPlanningNews(): ReactElement {
  return (
    <AnnouncementDialog
      trigger={<Button size="sm">What's new</Button>}
      title="Roasts plan themselves now"
      sections={[
        {
          title: "A week ahead",
          body: "Orders and subscriptions fill next week's roasts as they come in.",
        },
      ]}
      learnMore={{
        label: "How roast planning works",
        href: "#docs-roast-planning",
      }}
    />
  );
}
