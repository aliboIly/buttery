import type { ReactElement } from "react";
import { IconButton, NotificationNudge } from "@buttery/react";
import { Bell } from "lucide-react";

/** A nudge on the notifications bell that opens by itself on the first visit only. */
export function DeliveryQuestions(): ReactElement {
  return (
    <NotificationNudge
      title="2 customers asked about delivery"
      description="Reply before Tuesday's roast ships."
      action={{ label: "Read messages", href: "#messages" }}
      storageKey="example-delivery-questions"
    >
      <IconButton icon={Bell} label="Notifications" dot />
    </NotificationNudge>
  );
}
