import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, OptionTiles } from "@buttery/react";

const days = new Intl.ListFormat("en", { type: "conjunction" });

/** The days the roaster runs, kept in state so a button outside the tiles can clear them; Sunday shows but is closed. */
export function RoastDays(): ReactElement {
  const [chosen, setChosen] = useState<readonly string[]>(["Monday"]);
  return (
    <Stack gap={3}>
      <OptionTiles
        label="Roast days"
        value={chosen}
        onValueChange={setChosen}
        options={[
          { value: "Monday", label: "Monday", description: "Espresso blends" },
          { value: "Tuesday", label: "Tuesday", description: "Single origins" },
          {
            value: "Thursday",
            label: "Thursday",
            description: "Decaf and cold brew",
          },
          {
            value: "Sunday",
            label: "Sunday",
            description: "The roastery is closed",
            disabled: true,
          },
        ]}
      />
      <Inline gap={3} align="center" justify="between">
        <Text variant="caption">
          {chosen.length === 0
            ? "No roast days"
            : `Roasting on ${days.format(chosen)}`}
        </Text>
        <Button
          variant="ghost"
          size="sm"
          aria-disabled={chosen.length === 0}
          onClick={() => {
            setChosen([]);
          }}
        >
          Clear
        </Button>
      </Inline>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("checkbox", "Tuesday");
  await see("Roasting on Monday and Tuesday");
  await press("button", "Clear");
  await see("No roast days");
};
