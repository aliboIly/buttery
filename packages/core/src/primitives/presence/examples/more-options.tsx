import { useId, useState } from "react";
import type { ReactElement } from "react";
import { Presence, Pressable, Stack, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

/** Extra options that rise in under the button that shows them, and fade as they go. */
export function MoreOptions(): ReactElement {
  const [open, setOpen] = useState(false);
  const panel = useId();
  return (
    <Stack gap={3} align="start">
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Pressable
          aria-expanded={open}
          aria-controls={open ? panel : undefined}
          onClick={() => {
            setOpen((current) => !current);
          }}
        >
          <Text variant="button">
            {open ? "Fewer options" : "More options"}
          </Text>
        </Pressable>
      </Surface>
      <Presence id={panel} show={open} preset="rise">
        <Surface level="card" pad={4}>
          <Stack gap={1}>
            <Text variant="label">Export at twice the size</Text>
            <Text variant="caption">Sharper on high-density screens.</Text>
          </Stack>
        </Surface>
      </Presence>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "More options");
  await see("Export at twice the size");
  await see("Fewer options");
};
