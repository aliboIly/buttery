import type { ReactElement } from "react";
import { FitBox, Surface } from "@buttery/core";

/** A 4:3 canvas that fills a stage with a 32px margin and stays centered as the stage resizes. */
export function StageCanvas(): ReactElement {
  return (
    <Surface level="app" style={{ blockSize: "var(--bt-bento-row)" }}>
      <FitBox ratio={4 / 3} inset={8}>
        <Surface level="card" />
      </FitBox>
    </Surface>
  );
}
