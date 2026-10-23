import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Chip, Switch } from "@butteryui/react";

const EFFECTS = ["Grain", "Vignette", "Soft focus"];

/** An inspector section with Clear all at the end of its title, unavailable once every effect is off. */
export function ClearAll(): ReactElement {
  const [on, setOn] = useState<readonly string[]>(["Grain", "Vignette"]);
  return (
    <Stack gap={3}>
      <Inline gap={2} align="center" justify="between">
        <Text variant="control">Effects</Text>
        <Chip
          aria-disabled={on.length === 0}
          onClick={() => {
            setOn([]);
          }}
        >
          Clear all
        </Chip>
      </Inline>
      {EFFECTS.map((effect) => (
        <Switch
          key={effect}
          label={effect}
          checked={on.includes(effect)}
          onCheckedChange={(checked) => {
            setOn(
              checked
                ? [...on, effect]
                : on.filter((other) => other !== effect),
            );
          }}
        />
      ))}
      <Text variant="caption">
        {on.length === 0 ? "No effects" : `${String(on.length)} effects on`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("2 effects on");
  await press("button", "Clear all");
  await see("No effects");
};
