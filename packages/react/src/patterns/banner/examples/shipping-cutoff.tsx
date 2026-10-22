import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Banner } from "@buttery/react";
import { Truck } from "lucide-react";

/** A suggestion whose action is a button that makes the change in place, then offers to undo it. */
export function ShippingCutoff(): ReactElement {
  const [later, setLater] = useState(false);
  return (
    <Banner
      icon={Truck}
      action={{
        label: later ? "Undo" : "Move it to 4pm",
        onClick: () => {
          setLater(!later);
        },
      }}
    >
      {later
        ? "Orders placed before 4pm now ship the same day."
        : "Ship more orders the same day by moving your cutoff from 2pm to 4pm."}
    </Banner>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Move it to 4pm");
  await see("Orders placed before 4pm now ship the same day.");
  await press("button", "Undo");
  await see(
    "Ship more orders the same day by moving your cutoff from 2pm to 4pm.",
  );
};
