import { useState } from "react";
import type { ReactElement } from "react";
import { TextArea } from "@buttery/react";

/** A note under the card that grows as it gets longer. */
export function CardNote(): ReactElement {
  const [note, setNote] = useState("");
  return (
    <TextArea
      label="Note"
      hint="Shown under the card in small type."
      value={note}
      onValueChange={setNote}
      maxLength={280}
    />
  );
}
