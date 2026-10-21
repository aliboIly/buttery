import type { ReactElement } from "react";
import { Center, Text } from "@buttery/core";
import { Bento, ExpandableCard } from "@buttery/react";

/** A feature card with a longer note behind it. */
export function FeatureDetail(): ReactElement {
  return (
    <Bento>
      <ExpandableCard
        title="Every change kept"
        span={6}
        detail={
          <Text variant="body-lg">
            Undo and redo remember every change you make to a card, up to 100
            steps back.
          </Text>
        }
      >
        <Center style={{ blockSize: "100%" }}>
          <Text variant="title">Undo · Redo</Text>
        </Center>
      </ExpandableCard>
    </Bento>
  );
}
