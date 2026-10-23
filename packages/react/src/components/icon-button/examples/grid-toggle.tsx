import { Grid3x3 } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { IconButton } from "@butteryui/react";

/** A toggle that stays tinted while it's on; its name stays put and aria-pressed says whether it's on. */
export function GridToggle(): ReactElement {
  const [visible, setVisible] = useState(true);
  return (
    <Inline gap={3} align="center">
      <IconButton
        icon={Grid3x3}
        label="Grid"
        aria-pressed={visible}
        onClick={() => {
          setVisible(!visible);
        }}
      />
      <Text variant="body-sm" tone="secondary">
        {visible ? "Grid lines show on the slide" : "Grid lines are hidden"}
      </Text>
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Grid");
  await see("Grid lines are hidden");
  await press("button", "Grid");
  await see("Grid lines show on the slide");
};
