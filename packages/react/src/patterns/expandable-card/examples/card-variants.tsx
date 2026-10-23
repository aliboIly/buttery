import type { ReactElement } from "react";
import { Center, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Bento, ExpandableCard } from "@butteryui/react";

/** A tinted card beside a plain one, each opening into the same dialog surface. */
export function CardVariants(): ReactElement {
  return (
    <Bento>
      <ExpandableCard
        title="Gift a subscription"
        variant="tinted"
        detail={
          <Text variant="body-lg">
            Pick a coffee, how often it ships and when the first bag arrives.
          </Text>
        }
      >
        <Center style={{ blockSize: "100%" }}>
          <Surface level="card" padX={6} padY={4}>
            <Text variant="title">3 months</Text>
          </Surface>
        </Center>
      </ExpandableCard>
      <ExpandableCard
        title="Brew guides inside"
        variant="plain"
        detail={
          <Text variant="body-lg">
            Every bag comes with a card for pour-over, French press and
            espresso.
          </Text>
        }
      >
        <Center style={{ blockSize: "100%" }}>
          <Text variant="title">Pour-over · 1:16</Text>
        </Center>
      </ExpandableCard>
    </Bento>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Open Gift a subscription");
  await see(
    "Pick a coffee, how often it ships and when the first bag arrives.",
  );
  await press("button", "Close");
  await press("button", "Open Brew guides inside");
  await see(
    "Every bag comes with a card for pour-over, French press and espresso.",
  );
  await press("button", "Close");
};
