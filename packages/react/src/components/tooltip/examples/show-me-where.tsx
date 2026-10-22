import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, Tooltip } from "@buttery/react";

/** A tooltip whose open state the example keeps, so a tip elsewhere can open it to point out a button. */
export function ShowMeWhere(): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <Stack gap={6} align="start">
      <Inline gap={3}>
        <Text variant="body" tone="secondary">
          Cards export as PNG files.
        </Text>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setOpen(true);
          }}
        >
          Show me where
        </Button>
      </Inline>
      <Tooltip
        label="Saves a 2× PNG to your downloads"
        side="bottom"
        open={open}
        onOpenChange={setOpen}
      >
        <Button variant="primary">Export</Button>
      </Tooltip>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Show me where");
  await see("Saves a 2× PNG to your downloads");
};
