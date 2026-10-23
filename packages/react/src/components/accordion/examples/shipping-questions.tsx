import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Accordion } from "@buttery/react";

/** The shop's shipping questions, one open at a time. */
export function ShippingQuestions(): ReactElement {
  return (
    <Accordion>
      <Accordion.Item value="arrival" title="When will my coffee arrive?">
        Order by noon and we roast it the next morning, then ship it that
        afternoon. Most bags arrive in two to four days.
      </Accordion.Item>
      <Accordion.Item value="shipping" title="How much is shipping?">
        Standard shipping is $6, and free once an order reaches $40. Next-day
        delivery is $14.
      </Accordion.Item>
      <Accordion.Item value="abroad" title="Do you ship outside the US?">
        Not yet. We ship to every state, and Alaska and Hawaii take a day or two
        longer.
      </Accordion.Item>
    </Accordion>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "How much is shipping?");
  await see(/Next-day delivery is \$14\.$/);
  await press("button", "Do you ship outside the US?");
  await see(/^Not yet\. We ship to every state/);
};
