import { Bell } from "lucide-react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { IconButton, NotificationNudge } from "@buttery/react";

/** A nudge on the notifications bell that opens by itself on the first visit only, and from the bell after that. */
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

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("2 customers asked about delivery");
  await press("button", "Later");
  await press("button", "Notifications, new");
  await see("Reply before Tuesday's roast ships.");
};
