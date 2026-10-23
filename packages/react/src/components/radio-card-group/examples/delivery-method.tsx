import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { RadioCardGroup, TextField } from "@buttery/react";

/** A wholesale order's delivery step: how a café gets its order, shipping asking for an address of its own. */
export function DeliveryMethod(): ReactElement {
  const [method, setMethod] = useState("pickup");
  const [address, setAddress] = useState("");
  return (
    <Stack gap={4}>
      <Text variant="title-sm">Delivery</Text>
      <RadioCardGroup
        label="Delivery"
        value={method}
        onValueChange={setMethod}
        options={[
          {
            value: "pickup",
            label: "Pick up at the roastery",
            description: "Ready from 8:00 on the roast day.",
          },
          {
            value: "ship",
            label: "Ship to the café",
            description: "Sent the day after roasting.",
            detail: (
              <TextField
                label="Café address"
                value={address}
                onValueChange={setAddress}
              />
            ),
          },
        ]}
      />
      <Text variant="caption">
        {method === "pickup"
          ? "Picking up"
          : `Shipping to ${address === "" ? "…" : address}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("radio", "Ship to the café");
  await type("Café address", "9 Pier Street");
  await see("Shipping to 9 Pier Street");
};
