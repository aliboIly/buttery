import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, celebrate } from "@butteryui/react";

/** A deck's export panel that celebrates the first export and none after it, saying each one in text. */
export function FirstExport(): ReactElement {
  const [exports, setExports] = useState(0);
  return (
    <Surface level="card" pad={4}>
      <Inline gap={4} align="center" justify="between">
        <Stack gap={1}>
          <Text variant="label">Spring launch</Text>
          <Text variant="caption" role="status">
            {exports === 0
              ? "Not exported yet"
              : exports === 1
                ? "Your first export is in your downloads"
                : `Exported ${String(exports)} times`}
          </Text>
        </Stack>
        <Button
          variant="primary"
          onClick={(event) => {
            if (exports === 0) celebrate(event.currentTarget);
            setExports(exports + 1);
          }}
        >
          Export as PDF
        </Button>
      </Inline>
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Export as PDF");
  await see("Your first export is in your downloads");
  await press("button", "Export as PDF");
  await see("Exported 2 times");
};
