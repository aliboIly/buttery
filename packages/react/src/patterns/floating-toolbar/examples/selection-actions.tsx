import { useRef, useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Chip, FloatingToolbar } from "@buttery/react";

interface Card {
  readonly id: number;
  readonly title: string;
}

const CARDS: readonly Card[] = [
  { id: 1, title: "Launch" },
  { id: 2, title: "Recap" },
  { id: 3, title: "Roadmap" },
];

/** Actions for the cards picked, shown while any are: how many, then Clear and Duplicate. */
export function SelectionActions(): ReactElement {
  const row = useRef<HTMLDivElement>(null);
  const [cards, setCards] = useState<readonly Card[]>(CARDS);
  const [picked, setPicked] = useState<ReadonlySet<number>>(new Set());
  const duplicate = (): void => {
    const next = Math.max(...cards.map((card) => card.id)) + 1;
    const copies = cards
      .filter((card) => picked.has(card.id))
      .map((card, index) => ({
        id: next + index,
        title: `${card.title} copy`,
      }));
    setCards([...cards, ...copies]);
    setPicked(new Set());
  };
  return (
    <>
      <Inline ref={row} gap={2} wrap>
        {cards.map((card) => (
          <Chip
            key={card.id}
            aria-pressed={picked.has(card.id)}
            onClick={() => {
              const next = new Set(picked);
              if (next.has(card.id)) next.delete(card.id);
              else next.add(card.id);
              setPicked(next);
            }}
          >
            {card.title}
          </Chip>
        ))}
      </Inline>
      <FloatingToolbar
        anchor={row}
        label="Selection"
        meta={`${String(picked.size)} selected`}
        open={picked.size > 0}
      >
        <FloatingToolbar.Button
          variant="ghost"
          onClick={() => {
            setPicked(new Set());
          }}
        >
          Clear
        </FloatingToolbar.Button>
        <FloatingToolbar.Button onClick={duplicate}>
          Duplicate
        </FloatingToolbar.Button>
      </FloatingToolbar>
    </>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Recap");
  await see("1 selected");
  await press("button", "Duplicate");
  await see("Recap copy");
};
