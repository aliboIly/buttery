import type { ReactElement } from "react";
import { Pressable, Surface } from "@buttery/core";

/** A color swatch the user can pick, with its name for screen readers. */
export function SwatchButton(): ReactElement {
  return (
    <Surface asChild level="inset" pad={6}>
      <Pressable aria-label="Lilac" aria-pressed="true" />
    </Surface>
  );
}
