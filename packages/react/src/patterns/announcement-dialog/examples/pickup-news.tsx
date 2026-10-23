import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { AnnouncementDialog, Button } from "@butteryui/react";

/** A text-only announcement opened from a button, with a closing paragraph after its sections. */
export function PickupNews(): ReactElement {
  return (
    <AnnouncementDialog
      trigger={<Button size="sm">Local pickup</Button>}
      title="Customers can pick up at the roastery"
      sections={[
        {
          title: "Choose it at checkout",
          body: "Pickup shows next to shipping for addresses within 20 miles.",
        },
        { body: "You'll get a list of the day's pickups each morning at 8." },
      ]}
      doneLabel="Sounds good"
    />
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Local pickup");
  await see("Choose it at checkout");
  await press("button", "Sounds good");
};
