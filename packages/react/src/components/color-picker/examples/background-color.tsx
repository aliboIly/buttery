import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Chip, ColorPicker } from "@butteryui/react";

const DEFAULT_BACKGROUND = "#7c9cf5";

/** A slide's background color kept in state as `#rrggbb`; Reset beside it puts the first color back, and the thumbs glide there. */
export function BackgroundColor(): ReactElement {
  const [color, setColor] = useState(DEFAULT_BACKGROUND);
  return (
    <Stack gap={3}>
      <ColorPicker label="Background" value={color} onValueChange={setColor} />
      <Inline gap={2} align="center">
        <Text variant="caption" tone="secondary" tabular>
          {color}
        </Text>
        <Chip
          aria-disabled={color === DEFAULT_BACKGROUND}
          onClick={() => {
            setColor(DEFAULT_BACKGROUND);
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
