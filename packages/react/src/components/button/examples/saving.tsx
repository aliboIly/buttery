import { useState } from "react";
import type { ReactElement } from "react";
import { Button } from "@buttery/react";

/** A save that takes a moment: the button shows a spinner and holds its width until it's done. */
export function Saving(): ReactElement {
  const [saving, setSaving] = useState(false);
  return (
    <Button
      variant="primary"
      loading={saving}
      onClick={() => {
        setSaving(true);
        window.setTimeout(() => {
          setSaving(false);
        }, 1200);
      }}
    >
      Save the card
    </Button>
  );
}
