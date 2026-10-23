import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, Tooltip } from "@buttery/react";

/** A hint on a button whose label is short. */
export function ExportHint(): ReactElement {
  const [saved, setSaved] = useState(false);
  return (
    <Inline gap={3}>
      <Tooltip label="Saves a 2× PNG to your downloads">
        <Button
          variant="primary"
          onClick={() => {
            setSaved(true);
          }}
        >
          Export
        </Button>
      </Tooltip>
      {saved ? (
        <Text variant="body" tone="secondary">
          Saved title-slide@2x.png
        </Text>
      ) : null}
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Export");
  await see("Saved title-slide@2x.png");
};
