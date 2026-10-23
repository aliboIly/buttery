import { useState } from "react";
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

const PRODUCTS = ["Coffee", "Subscriptions", "Wholesale"] as const;

/** A top bar's menu that opens over the page on a blurred scrim; choosing a page or pressing the scrim closes it. */
export function BlurBehindMenu(): ReactElement {
  const [product, setProduct] = useState<(typeof PRODUCTS)[number]>("Coffee");
  return (
    <Stack gap={4}>
      <Surface level="raised" padX={4} padY={2} radius="full">
        <Inline gap={4} align="center" justify="between">
          <Text variant="label">Halfmoon Roastery</Text>
          <Popover>
            <Surface asChild level="app" padX={4} padY={2} radius="full">
              <Popover.Trigger asChild>
                <Pressable>
                  <Text variant="button">Shop</Text>
                </Pressable>
              </Popover.Trigger>
            </Surface>
            <Popover.Content scrim="blur" align="end" aria-label="Shop">
              <Stack gap={1}>
                {PRODUCTS.map((option) => (
                  <Surface
                    key={option}
                    asChild
                    level="app"
                    padX={3}
                    padY={2}
                    radius="md"
                  >
                    <Popover.Close asChild>
                      <Pressable
                        aria-current={option === product ? "page" : undefined}
                        onClick={() => {
                          setProduct(option);
                        }}
                      >
                        <Text variant="menu">{option}</Text>
                      </Pressable>
                    </Popover.Close>
                  </Surface>
                ))}
              </Stack>
            </Popover.Content>
          </Popover>
        </Inline>
      </Surface>
      <Text variant="title">{`Browsing ${product}`}</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Browsing Coffee");
  await press("button", "Shop");
  await press("button", "Subscriptions");
  await see("Browsing Subscriptions");
};
