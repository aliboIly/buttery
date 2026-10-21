import { Stack, Text } from "@buttery/core";
import type { ExamplePlay } from "@buttery/core";
import { OptionTiles } from "@buttery/react";
import { useState } from "react";
import type { ReactElement } from "react";

/** The days the roaster runs, each with what it roasts, Sunday shown but closed. */
export function RoastDays(): ReactElement {
  const [days, setDays] = useState<readonly string[]>(["Monday"]);
  return (
    <Stack gap={3}>
      <OptionTiles
        label="Roast days"
        value={days}
        onValueChange={setDays}
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
      <Text variant="caption">
        {days.length === 0
          ? "No roast days"
          : `Roasting on ${days.join(" and ")}`}
      </Text>
    </Stack>
  );
}

export const play: ExamplePlay = async ({ press, see }) => {
  await press("checkbox", "Tuesday");
  await see("Roasting on Monday and Tuesday");
};
