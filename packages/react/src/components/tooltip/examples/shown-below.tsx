import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, Tooltip } from "@buttery/react";

/** A tooltip that opens under its button, for controls at the top of a window. */
export function ShownBelow(): ReactElement {
  const [version, setVersion] = useState("Edited just now");
  return (
    <Inline gap={3}>
      <Tooltip label="Back to the last saved version" side="bottom">
        <Button
          variant="ghost"
          onClick={() => {
            setVersion("Back to the version saved at 9:30");
          }}
        >
          Revert
        </Button>
      </Tooltip>
      <Text variant="body" tone="secondary">
        {version}
      </Text>
    </Inline>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Edited just now");
  await press("button", "Revert");
  await see("Back to the version saved at 9:30");
};
