import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { IconButton, ValueBadge } from "@buttery/react";

const LEVELS: readonly number[] = [50, 75, 100, 125, 150, 200];

/** A canvas zoom control: the badge keeps room for 200%, so the buttons beside it never move. */
export function ZoomControl(): ReactElement {
  const [level, setLevel] = useState(2);
  return (
    <Inline gap={1}>
      <IconButton
        icon={Minus}
        label="Zoom out"
        aria-disabled={level === 0}
        onClick={() => {
          setLevel(Math.max(0, level - 1));
        }}
      />
      <ValueBadge reserve={["50%", "200%"]}>
        {`${String(LEVELS[level] ?? 100)}%`}
      </ValueBadge>
      <IconButton
        icon={Plus}
        label="Zoom in"
        aria-disabled={level === LEVELS.length - 1}
        onClick={() => {
          setLevel(Math.min(LEVELS.length - 1, level + 1));
        }}
      />
    </Inline>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("100%");
  await press("button", "Zoom in");
  await see("125%");
  await press("button", "Zoom out");
  await press("button", "Zoom out");
  await see("75%");
};
