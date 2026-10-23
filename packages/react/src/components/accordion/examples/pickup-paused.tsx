import { Store, Truck, Zap } from "lucide-react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Accordion } from "@butteryui/react";

/** Ways to get an order, one of them paused: a disabled item stays shut and the keyboard passes over it. */
export function PickupPaused(): ReactElement {
  return (
    <Accordion variant="contained">
      <Accordion.Item
        value="standard"
        icon={Truck}
        title="Standard shipping"
        description="2 to 4 days, free from $40"
      >
        Parcels leave the roastery at 4pm on roasting days, Monday to Friday.
      </Accordion.Item>
      <Accordion.Item
        value="next-day"
        icon={Zap}
        title="Next-day delivery"
        description="$14"
      >
        Order by noon and it arrives the day after it roasts.
      </Accordion.Item>
      <Accordion.Item
        value="pickup"
        icon={Store}
        title="Pick up at the counter"
        description="Back when the counter reopens in spring"
        disabled
      >
        Collect your bag at 1180 SE Water Ave, Tuesday to Saturday.
      </Accordion.Item>
    </Accordion>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Back when the counter reopens in spring");
  await press("button", /^Next-day delivery/);
  await see("Order by noon and it arrives the day after it roasts.");
};
