import { useRef, useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import { Chip, FloatingToolbar } from "@buttery/react";

const CARDS = ["Launch", "Recap", "Roadmap"] as const;

/** Actions for the cards picked, shown while any are. */
export function SelectionActions(): ReactElement {
  const row = useRef<HTMLDivElement>(null);
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
  return (
    <>
      <Inline ref={row} gap={2}>
        {CARDS.map((card) => (
          <Chip
            key={card}
            aria-pressed={picked.has(card)}
            onClick={() => {
              const next = new Set(picked);
              if (next.has(card)) next.delete(card);
              else next.add(card);
              setPicked(next);
            }}
          >
            {card}
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
        <FloatingToolbar.Button>Duplicate</FloatingToolbar.Button>
      </FloatingToolbar>
    </>
  );
}
