import { Inline } from "@buttery/core";
import { useState } from "react";
import type { ReactElement } from "react";
import { Button, IconButton, NotificationNudge } from "@buttery/react";
import { Download } from "lucide-react";

/** A nudge the page opens when it decides to, here from a button, pointing at a new export button. */
export function NewExport(): ReactElement {
  const [open, setOpen] = useState(false);
  return (
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
        action={{ label: "Try it", onClick: () => undefined }}
        open={open}
        onOpenChange={setOpen}
        side="right"
        align="center"
      >
        <IconButton icon={Download} label="Export" />
      </NotificationNudge>
    </Inline>
  );
}
