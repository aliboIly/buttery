import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { OptionTiles } from "@buttery/react";

const NEEDS = [
  { value: "shop", label: "Sell online" },
  { value: "wholesale", label: "Sell to cafés" },
  { value: "subscriptions", label: "Run subscriptions" },
  { value: "counter", label: "Take payments at the counter" },
] as const;

type Need = (typeof NEEDS)[number]["value"];

/** What a new roastery needs, the choices listed under the tiles in their order. */
export function SetupNeeds(): ReactElement {
  const [needs, setNeeds] = useState<readonly Need[]>([]);
  const chosen = NEEDS.filter((need) => needs.includes(need.value));
  return (
    <Stack gap={3}>
      <OptionTiles
        label="What you need"
        options={NEEDS}
        value={needs}
        onValueChange={setNeeds}
      />
      <Text variant="caption">
        {chosen.length === 0
          ? "Nothing chosen yet"
          : `Chosen: ${chosen.map((need) => need.label).join(", ")}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("checkbox", "Run subscriptions");
  await press("checkbox", "Sell online");
  await see("Chosen: Sell online, Run subscriptions");
};
