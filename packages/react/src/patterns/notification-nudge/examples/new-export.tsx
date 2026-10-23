import { Download } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, IconButton, NotificationNudge } from "@butteryui/react";

/** A nudge kept open in state, opened when the page decides, here from a button, pointing at a new export button. */
export function NewExport(): ReactElement {
  const [open, setOpen] = useState(false);
  const [exported, setExported] = useState(false);
  return (
    <Stack gap={3} align="start">
      <Inline gap={3} align="center">
        <Button
          size="sm"
          onClick={() => {
            setOpen(true);
          }}
        >
          Point out the export
        </Button>
        <NotificationNudge
          title="Export orders to a spreadsheet"
          description="Pick the columns, then download them as CSV."
          action={{
            label: "Try it",
            onClick: () => {
              setExported(true);
            },
          }}
          open={open}
          onOpenChange={setOpen}
          side="right"
          align="center"
        >
          <IconButton icon={Download} label="Export" />
        </NotificationNudge>
      </Inline>
      <Text variant="caption">
        {exported ? "Downloaded orders.csv" : "Nothing exported yet"}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Point out the export");
  await see("Export orders to a spreadsheet");
  await press("button", "Try it");
  await see("Downloaded orders.csv");
};
