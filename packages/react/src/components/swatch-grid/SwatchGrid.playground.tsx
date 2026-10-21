import { gradientCss, gradients, solids } from "@buttery/core/palettes";
import type { DemoSection } from "@buttery/core";
import { SwatchGrid } from "@buttery/react";
import type { Swatch } from "@buttery/react";

const GRADIENTS: readonly Swatch[] = gradients.map((preset) => ({
  value: preset.id,
  label: preset.name,
  fill: gradientCss(preset),
}));

const SOLIDS: readonly Swatch[] = solids.map((preset) => ({
  value: preset.id,
  label: preset.name,
  fill: preset.hex,
}));

export const demos: readonly DemoSection[] = [
  {
    title: "Gradients",
    description:
      "buttery's 24 gradients, six to a row. The chosen one gets the selection ring at once.",
    render: () => (
      <SwatchGrid label="Backdrop" swatches={GRADIENTS} defaultValue="lilac" />
    ),
  },
  {
    title: "Solids and disabled",
    render: () => (
      <SwatchGrid
        label="Fill"
        swatches={SOLIDS}
        defaultValue="stone"
        disabled
      />
    ),
  },
];
