import type { ReactElement } from "react";
import { Popover, Pressable, Stack, Surface, Text } from "@buttery/core";

const PRODUCTS = ["Card Studio", "Templates", "Brand kits"] as const;

/** A blurred scrim under a menu that opens over page content; Escape or a click on the scrim closes it. */
export function BlurBehindMenu(): ReactElement {
  return (
    <Popover>
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Popover.Trigger asChild>
          <Pressable>
            <Text variant="button">Products</Text>
          </Pressable>
        </Popover.Trigger>
      </Surface>
      <Popover.Content scrim="blur" align="start" aria-label="Products">
        <Stack gap={1}>
          {PRODUCTS.map((product) => (
            <Surface
              key={product}
              asChild
              level="app"
              padX={3}
              padY={2}
              radius="md"
            >
              <Popover.Close asChild>
                <Pressable>
                  <Text variant="menu">{product}</Text>
                </Pressable>
              </Popover.Close>
            </Surface>
          ))}
        </Stack>
      </Popover.Content>
    </Popover>
  );
}
