import type { ReactElement } from "react";
import { Popover, Pressable, Stack, Text } from "@buttery/core";

const SIZES = ["Square", "Portrait", "Story", "Wide"] as const;

/** A trigger that opens a short list of canvas sizes. */
export function CanvasSize(): ReactElement {
  return (
    <Popover>
      <Popover.Trigger asChild>
        <Pressable>
          <Text variant="button">Canvas size</Text>
        </Pressable>
      </Popover.Trigger>
      <Popover.Content align="start" aria-label="Canvas sizes">
        <Stack gap={1}>
          {SIZES.map((size) => (
            <Popover.Close key={size} asChild>
              <Pressable>
                <Text variant="menu">{size}</Text>
              </Pressable>
            </Popover.Close>
          ))}
        </Stack>
      </Popover.Content>
    </Popover>
  );
}
