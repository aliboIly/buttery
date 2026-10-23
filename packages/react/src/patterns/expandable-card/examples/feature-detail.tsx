import type { ReactElement } from "react";
import { Center, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Bento, ExpandableCard } from "@buttery/react";

/** A feature card with a longer note behind it, beside a card that doesn't open. */
export function FeatureDetail(): ReactElement {
  return (
    <Bento>
      <ExpandableCard
        title="Every change kept"
        span={6}
        detail={
          <Text variant="body-lg">
            Undo and redo remember every change you make to a deck, up to 100
            steps back.
          </Text>
        }
      >
        <Center style={{ blockSize: "100%" }}>
          <Text variant="title">Undo · Redo</Text>
        </Center>
      </ExpandableCard>
      <Bento.Card title="Any size" span={6}>
        <Center style={{ blockSize: "100%" }}>
          <Text variant="title">16:9</Text>
        </Center>
      </Bento.Card>
    </Bento>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Open Every change kept");
  await see(
    "Undo and redo remember every change you make to a deck, up to 100 steps back.",
  );
  await press("button", "Close");
};
