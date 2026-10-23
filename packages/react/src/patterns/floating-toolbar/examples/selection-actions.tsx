import { useRef, useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Chip, FloatingToolbar } from "@butteryui/react";

interface Slide {
  readonly id: number;
  readonly title: string;
}

const SLIDES: readonly Slide[] = [
  { id: 1, title: "Agenda" },
  { id: 2, title: "Recap" },
  { id: 3, title: "Roadmap" },
];

/** Actions for the slides picked, shown while any are: how many, then Clear and Duplicate. */
export function SelectionActions(): ReactElement {
  const row = useRef<HTMLDivElement>(null);
  const [slides, setSlides] = useState<readonly Slide[]>(SLIDES);
  const [picked, setPicked] = useState<ReadonlySet<number>>(new Set());
  const duplicate = (): void => {
    const next = Math.max(...slides.map((slide) => slide.id)) + 1;
    const copies = slides
      .filter((slide) => picked.has(slide.id))
      .map((slide, index) => ({
        id: next + index,
        title: `${slide.title} copy`,
      }));
    setSlides([...slides, ...copies]);
    setPicked(new Set());
  };
  return (
    <>
      <Inline ref={row} gap={2} wrap>
        {slides.map((slide) => (
          <Chip
            key={slide.id}
            aria-pressed={picked.has(slide.id)}
            onClick={() => {
              const next = new Set(picked);
              if (next.has(slide.id)) next.delete(slide.id);
              else next.add(slide.id);
              setPicked(next);
            }}
          >
            {slide.title}
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
