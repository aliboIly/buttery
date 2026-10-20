import type { ReactElement } from "react";
import { FitBox, Surface } from "@buttery/core";

/** A 9:16 story preview that fills the height of a wide area without overflowing it. */
export function PortraitPreview(): ReactElement {
  return (
    <Surface level="section" style={{ blockSize: "var(--bt-bento-row)" }}>
      <FitBox ratio={9 / 16} inset={4}>
        <Surface level="raised" />
      </FitBox>
    </Surface>
  );
}
