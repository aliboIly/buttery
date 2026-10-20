import type { ReactElement } from "react";
import { Popover, Pressable, Stack, Surface, Text } from "@buttery/core";

const SIZES = ["Square", "Portrait", "Story", "Wide"] as const;

/** A trigger that opens a short list of canvas sizes. */
export function CanvasSize(): ReactElement {
  return (
    <Popover>
      <Popover.Trigger asChild>
        <Pressable>
          <Surface level="raised" padX={4} padY={2} radius="full">
            <Text variant="button">Canvas size</Text>
          </Surface>
        </Pressable>
      </Popover.Trigger>
      <Popover.Content align="start" aria-label="Canvas sizes">
        <Stack gap={1}>
          {SIZES.map((size) => (
            <Popover.Close key={size} asChild>
              <Pressable>
                <Surface level="app" padX={3} padY={2} radius="md">
                  <Text variant="menu">{size}</Text>
                </Surface>
              </Pressable>
            </Popover.Close>
          ))}
        </Stack>
      </Popover.Content>
    </Popover>
  );
}
