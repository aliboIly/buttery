import { useState } from "react";
import type { ReactElement } from "react";
import { Morph, Pressable, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** A panel that grows to show more details and shrinks back, with no jump. */
export function DetailsPanel(): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <Surface level="card" pad={4}>
      <Morph>
        <Stack gap={3} align="start">
          <Text variant="label">Spring launch</Text>
          {open ? (
            <Text variant="body">
              12 slides, Paper theme, 16:9. Edited today by you.
            </Text>
          ) : null}
          <Surface asChild level="raised" padX={4} padY={2} radius="full">
            <Pressable
              aria-expanded={open}
              onClick={() => {
                setOpen((current) => !current);
              }}
            >
              <Text variant="button">
                {open ? "Fewer details" : "More details"}
              </Text>
            </Pressable>
          </Surface>
        </Stack>
      </Morph>
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "More details");
  await see("12 slides, Paper theme, 16:9. Edited today by you.");
  await press("button", "Fewer details");
  await see("More details");
};
