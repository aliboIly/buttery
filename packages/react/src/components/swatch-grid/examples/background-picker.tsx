import { useState } from "react";
import type { ReactElement } from "react";
import { gradientCss, gradients } from "@buttery/core/palettes";
import { SwatchGrid } from "@buttery/react";
import type { Swatch } from "@buttery/react";

const SWATCHES: readonly Swatch[] = gradients.map((preset) => ({
  value: preset.id,
  label: preset.name,
  fill: gradientCss(preset),
}));

/** The gradient presets as swatches, chosen into state. */
export function BackgroundPicker(): ReactElement {
  const [background, setBackground] = useState("lilac");
  return (
    <SwatchGrid
      label="Background"
      swatches={SWATCHES}
      value={background}
      onValueChange={setBackground}
    />
  );
}
