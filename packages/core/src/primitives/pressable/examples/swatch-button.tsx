import { useState } from "react";
import type { ReactElement } from "react";
import { Pressable } from "@buttery/core";
import { gradientCss, gradients } from "@buttery/core/palettes";

const lilac = gradients.find((preset) => preset.id === "lilac");

/** A color swatch the user can pick: its name for screen readers, a ring while it's picked. */
export function SwatchButton(): ReactElement {
  const [picked, setPicked] = useState(true);
  return (
    <Pressable
      aria-label="Lilac"
      aria-pressed={picked}
      onClick={() => {
        setPicked((current) => !current);
      }}
      style={{
        inlineSize: "var(--bt-h-cta)",
        blockSize: "var(--bt-h-cta)",
        borderRadius: "var(--bt-r-sm)",
        backgroundImage: lilac ? gradientCss(lilac) : undefined,
        boxShadow: picked ? "var(--bt-ring-select)" : "var(--bt-shadow-inset)",
      }}
    />
  );
}
