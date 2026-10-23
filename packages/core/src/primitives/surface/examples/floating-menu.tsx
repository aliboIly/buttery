import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** The floating level used by menus and popovers, holding a short list. */
export function FloatingMenu(): ReactElement {
  return (
    <Surface level="floating" style={{ inlineSize: "var(--bt-w-menu-min)" }}>
      <Stack gap={1} padX={3} padY={2}>
        <Text variant="menu">Wide</Text>
        <Text variant="menu">Square</Text>
        <Text variant="menu">Tall</Text>
      </Stack>
    </Surface>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Square");
};
