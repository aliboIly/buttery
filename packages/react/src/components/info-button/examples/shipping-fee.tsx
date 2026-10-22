import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, InfoButton } from "@buttery/react";

/** An info button whose popover the page keeps in state, so a link-style button elsewhere can open it too. */
export function ShippingFee(): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <Stack gap={2} align="start">
      <Inline gap={1} align="center">
        <Text variant="label">Shipping: $4.50</Text>
        <InfoButton
          info="A flat rate for bags under 2 kg, and free on orders over $40."
          open={open}
          onOpenChange={setOpen}
        />
      </Inline>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setOpen(true);
        }}
      >
        How is shipping priced?
      </Button>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "How is shipping priced?");
  await see("A flat rate for bags under 2 kg, and free on orders over $40.");
};
