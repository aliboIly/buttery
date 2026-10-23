import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button } from "@butteryui/react";

/** One action and what it changes: each press adds a bag to the order. */
export function AddToOrder(): ReactElement {
  const [bags, setBags] = useState(0);
  return (
    <Inline gap={3} align="center">
      <Button
        variant="primary"
        onClick={() => {
          setBags(bags + 1);
        }}
      >
        Add a bag
      </Button>
      <Text variant="body" tone="secondary">
        {bags === 1
          ? "1 bag in your order"
          : `${String(bags)} bags in your order`}
      </Text>
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Add a bag");
  await see("1 bag in your order");
  await press("button", "Add a bag");
  await see("2 bags in your order");
};
