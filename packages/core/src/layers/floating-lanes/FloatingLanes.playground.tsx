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
          <Pressable
            key={lane}
            onClick={() => {
              setItems((current) => [
                ...current,
                { id: current.length + 1, lane },
              ]);
            }}
          >
            <Surface level="raised" padX={4} padY={2}>
              <Text variant="button">Add to {lane}</Text>
            </Surface>
          </Pressable>
        ))}
        <Pressable
          onClick={() => {
            setItems([]);
          }}
        >
          <Surface level="raised" padX={4} padY={2}>
            <Text variant="button">Clear</Text>
          </Surface>
        </Pressable>
      </Inline>
      {items.map((item) => (
        <FloatingLanes.Item key={item.id} lane={item.lane}>
          <Surface level="floating" padX={4} padY={2} role="status">
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
