import { useState } from "react";
import type { ReactElement } from "react";
import { Morph, Pressable, Stack, Surface, Text } from "@buttery/core";

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
              Square card, blend backdrop, soft edge. Edited today by you.
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
