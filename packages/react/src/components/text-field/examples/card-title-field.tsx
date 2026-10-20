import type { ReactElement } from "react";
import { TextField } from "@buttery/react";

/** A card's title with a hint, uncontrolled. */
export function CardTitleField(): ReactElement {
  return (
    <TextField
      label="Title"
      hint="Shown large on the card"
      defaultValue="Summer launch"
      maxLength={60}
    />
  );
}
