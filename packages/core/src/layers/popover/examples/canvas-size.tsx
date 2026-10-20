import type { ReactElement } from "react";
import { Popover, Pressable, Stack, Surface, Text } from "@buttery/core";

const SIZES = ["Square", "Portrait", "Story", "Wide"] as const;

/** A trigger that opens a short list of canvas sizes. */
export function CanvasSize(): ReactElement {
  return (
    <Popover>
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Popover.Trigger asChild>
          <Pressable>
            <Text variant="button">Canvas size</Text>
          </Pressable>
        </Popover.Trigger>
      </Surface>
      <Popover.Content align="start" aria-label="Canvas sizes">
        <Stack gap={1}>
          {SIZES.map((size) => (
            <Surface
              key={size}
              asChild
              level="app"
              padX={3}
              padY={2}
              radius="md"
            >
              <Popover.Close asChild>
                <Pressable>
                  <Text variant="menu">{size}</Text>
                </Pressable>
              </Popover.Close>
            </Surface>
          ))}
        </Stack>
      </Popover.Content>
    </Popover>
  );
}
