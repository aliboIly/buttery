import { VisuallyHidden } from "radix-ui";
import { useState } from "react";
import type { ReactElement } from "react";
import {
  FloatingLanes,
  Inline,
  laneNames,
  Pressable,
  Surface,
  Text,
} from "@buttery/core";
import type { DemoSection, LaneName } from "@buttery/core";

function LaneDemo(): ReactElement {
  const [items, setItems] = useState<
    readonly { readonly id: number; readonly lane: LaneName }[]
  >([]);
  return (
    <>
      <Inline gap={2} wrap>
        {laneNames.map((lane) => (
          <Surface key={lane} asChild level="raised" padX={4} padY={2}>
            <Pressable
              onClick={() => {
                setItems((current) => [
                  ...current,
                  { id: current.length + 1, lane },
                ]);
              }}
            >
              <Text variant="button">Add to {lane}</Text>
            </Pressable>
          </Surface>
        ))}
        <Surface asChild level="raised" padX={4} padY={2}>
          <Pressable
            onClick={() => {
              setItems([]);
            }}
          >
            <Text variant="button">Clear</Text>
          </Pressable>
        </Surface>
      </Inline>
      <VisuallyHidden.Root role="status">
        {items.length > 0 ? `Message ${String(items.length)}` : ""}
      </VisuallyHidden.Root>
      {items.map((item) => (
        <FloatingLanes.Item key={item.id} lane={item.lane}>
          <Surface level="floating" padX={4} padY={2}>
            <Text>Message {item.id}</Text>
          </Surface>
        </FloatingLanes.Item>
      ))}
    </>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Lanes",
    description:
      "Items stack 8px apart and stay 24px from the edges and clear of sticky bars.",
    render: () => <LaneDemo />,
  },
];
