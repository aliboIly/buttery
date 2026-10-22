import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Chip, ColorPicker } from "@buttery/react";

const DEFAULT_BACKDROP = "#7c9cf5";

/** A backdrop color kept in state as `#rrggbb`, which a Reset beside it puts back, the thumbs gliding there. */
export function BackdropColor(): ReactElement {
  const [color, setColor] = useState(DEFAULT_BACKDROP);
  return (
    <Stack gap={3}>
      <ColorPicker label="Backdrop" value={color} onValueChange={setColor} />
      <Inline gap={2} align="center">
        <Text variant="caption" tone="secondary" tabular>
          {color}
        </Text>
        <Chip
          aria-disabled={color === DEFAULT_BACKDROP}
          onClick={() => {
            setColor(DEFAULT_BACKDROP);
          }}
        >
          Reset
        </Chip>
      </Inline>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, type, key, see }) => {
  await type("Hex code", "{selectall}F97316");
  await key("Enter");
  await see("#f97316");
  await press("button", "Reset");
  await see("#7c9cf5");
};
