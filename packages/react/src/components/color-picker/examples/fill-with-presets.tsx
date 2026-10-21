import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import { ColorPicker } from "@buttery/react";
import { solids } from "@buttery/core/palettes";

const PRESETS = solids.slice(0, 6).map((solid) => solid.hex);

/** A fill with six presets that keeps a history step only when a drag, a key or a pick settles. */
export function FillWithPresets(): ReactElement {
  const [fill, setFill] = useState(PRESETS[0] ?? "#f5d06f");
  const [history, setHistory] = useState<readonly string[]>([]);
  return (
    <Stack gap={3}>
      <ColorPicker
        label="Card fill"
        value={fill}
        onValueChange={setFill}
        onValueCommit={(color) => {
          setHistory([...history, color]);
        }}
        presets={PRESETS}
      />
      <Text variant="caption" tone="secondary">
        {`${String(history.length)} steps to undo`}
      </Text>
    </Stack>
  );
}
