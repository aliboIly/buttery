import type { ReactElement } from "react";
import {
  Inline,
  Popover,
  Pressable,
  Stack,
  Surface,
  Text,
} from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

/** Both variants, drawn by Popover's scrim prop: dim darkens the page, blur softens it under a light wash. */
export function DimOrBlur(): ReactElement {
  return (
    <Inline gap={2}>
      <Popover>
        <Surface asChild level="raised" padX={4} padY={2} radius="full">
          <Popover.Trigger asChild>
            <Pressable>
              <Text variant="button">Dim the page</Text>
            </Pressable>
          </Popover.Trigger>
        </Surface>
        <Popover.Content scrim="dim" align="start" aria-label="Dim scrim">
          <Stack padX={2} padY={1}>
            <Text variant="menu">The page is dimmed behind this panel</Text>
          </Stack>
        </Popover.Content>
      </Popover>
      <Popover>
        <Surface asChild level="raised" padX={4} padY={2} radius="full">
          <Popover.Trigger asChild>
            <Pressable>
              <Text variant="button">Blur the page</Text>
            </Pressable>
          </Popover.Trigger>
        </Surface>
        <Popover.Content scrim="blur" align="start" aria-label="Blur scrim">
          <Stack padX={2} padY={1}>
            <Text variant="menu">The page is blurred behind this panel</Text>
          </Stack>
        </Popover.Content>
      </Popover>
    </Inline>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await press("button", "Dim the page");
  await see("The page is dimmed behind this panel");
  await key("Escape");
  await press("button", "Blur the page");
  await see("The page is blurred behind this panel");
};
