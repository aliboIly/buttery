import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { solids } from "@buttery/core/palettes";
import { Button, ColorPicker } from "@buttery/react";

const PRESETS = solids.slice(0, 6).map((solid) => solid.hex);
const FIRST_FILL = PRESETS[0] ?? "#f5d06f";

/** A card's fill with six presets and an undo, which keeps one step per drag, key, code or preset rather than per frame. */
export function FillWithPresets(): ReactElement {
  const [fill, setFill] = useState(FIRST_FILL);
  const [committed, setCommitted] = useState(FIRST_FILL);
  const [history, setHistory] = useState<readonly string[]>([]);
  const previous = history.at(-1);
  return (
    <Stack gap={3}>
      <ColorPicker
        label="Card fill"
        value={fill}
        onValueChange={setFill}
        onValueCommit={(color) => {
          setHistory([...history, committed]);
          setCommitted(color);
        }}
        presets={PRESETS}
      />
      <Inline gap={3} align="center" justify="between">
        <Text variant="caption" tone="secondary">
          {history.length === 1
            ? "1 step to undo"
            : `${String(history.length)} steps to undo`}
        </Text>
        <Button
          size="sm"
          aria-disabled={previous === undefined}
          onClick={() => {
            if (previous === undefined) return;
            setFill(previous);
            setCommitted(previous);
            setHistory(history.slice(0, -1));
          }}
        >
          Undo
        </Button>
      </Inline>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, type, key, see }) => {
  await see("0 steps to undo");
  await type("Hex code", "{selectall}2563EB");
  await key("Enter");
  await see("1 step to undo");
  await press("button", "Undo");
  await see("0 steps to undo");
};
