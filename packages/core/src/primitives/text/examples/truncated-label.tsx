import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Pressable, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** An inspector row whose label truncates and keeps its full text in a tooltip, beside a value in tabular figures. */
export function TruncatedLabel(): ReactElement {
  const [angle, setAngle] = useState(135);
  return (
    <Stack gap={3} style={{ maxInlineSize: "var(--bt-w-inspector)" }}>
      <Surface level="card" padX={4} padY={3}>
        <Inline gap={2}>
          <Text truncate>Background angle for the spring launch card</Text>
          <Text variant="badge" tabular>
            {`${String(angle)}°`}
          </Text>
        </Inline>
      </Surface>
      <Inline>
        <Surface asChild level="raised" padX={4} padY={2} radius="full">
          <Pressable
            onClick={() => {
              setAngle((angle + 45) % 360);
            }}
          >
            <Text variant="button">Turn 45°</Text>
          </Pressable>
        </Surface>
      </Inline>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Turn 45°");
  await see("180°");
  await press("button", "Turn 45°");
  await see("225°");
};
