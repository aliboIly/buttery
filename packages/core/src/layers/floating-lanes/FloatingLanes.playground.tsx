import { VisuallyHidden } from "radix-ui";
import { useRef, useState } from "react";
import type { ReactElement } from "react";
import {
  FloatingLanes,
  Inline,
  laneNames,
  Pressable,
  Surface,
  Text,
} from "@buttery/core";
import type { DemoSection, DocsPage, LaneName } from "@buttery/core";

export const page: DocsPage = {
  section: "foundations",
  title: "FloatingLanes",
  description:
    "Hosts free-floating UI in lanes that stack items and keep clear of sticky bars and anchored toolbars.",
  order: 110,
  status: "stable",
  since: "0.2.0",
};

interface LaneItem {
  readonly id: number;
  readonly lane: LaneName;
}

/** Adds `item` and drops the oldest in its lane past three, the room a lane has. */
function withItem(items: readonly LaneItem[], item: LaneItem): LaneItem[] {
  const next = [...items, item];
  return next.filter(
    (current, index) =>
      next.slice(index + 1).filter((later) => later.lane === current.lane)
        .length < 3,
  );
}

function LaneDemo(): ReactElement {
  const [items, setItems] = useState<readonly LaneItem[]>([]);
  const nextId = useRef(1);
  return (
    <>
      <Inline gap={2} wrap>
        {laneNames.map((lane) => (
          <Surface key={lane} asChild level="raised" padX={4} padY={2}>
            <Pressable
              onClick={() => {
                const id = nextId.current;
                nextId.current += 1;
                setItems((current) => withItem(current, { id, lane }));
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
        {items.length > 0 ? `Message ${String(items.at(-1)?.id ?? 0)}` : ""}
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
      "Items stack 8px apart and stay 24px from the edges and clear of sticky bars. A lane has room for three, so a fourth here lets the oldest go.",
    render: () => <LaneDemo />,
  },
];
