import type { ReactElement } from "react";
import { Pressable, Surface } from "@buttery/core";

/** A color swatch the user can pick, with its name for screen readers. */
export function SwatchButton(): ReactElement {
  return (
    <Pressable aria-label="Lilac" aria-pressed="true">
      <Surface level="inset" pad={6} />
    </Pressable>
  );
}
