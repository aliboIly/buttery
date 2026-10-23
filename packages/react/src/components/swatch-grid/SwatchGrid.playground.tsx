import { gradientCss, gradients, solids } from "@butteryui/core/palettes";
import { demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { SwatchGrid } from "@butteryui/react";
import type { Swatch } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/selection",
  title: "SwatchGrid",
  description:
    "A grid of color and gradient swatches to pick one from, like radio buttons.",
  order: 100,
  status: "stable",
  since: "0.6.0",
};

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

const COLUMNS: readonly (4 | 5 | 6 | 7 | 8)[] = [4, 5, 6, 7, 8];

export const live: LiveDemo = {
  controls: {
    swatches: {
      kind: "choice",
      options: ["gradients", "solids"],
      initial: "gradients",
    },
    columns: { kind: "number", initial: 6, min: 4, max: 8, step: 1 },
    disabled: { kind: "toggle", initial: false },
  },
  render: ({ swatches, columns, disabled }) => (
    <SwatchGrid
      label="Background"
      swatches={
        demoChoice(swatches, ["gradients", "solids"]) === "gradients"
          ? GRADIENTS
          : SOLIDS
      }
      columns={COLUMNS.find((count) => count === columns) ?? 6}
      disabled={disabled === true}
      defaultValue="lilac"
    />
  ),
  code: ({ swatches, columns, disabled }) =>
    [
      "<SwatchGrid",
      '  label="Background"',
      demoChoice(swatches, ["gradients", "solids"]) === "gradients"
        ? "  swatches={gradients.map((preset) => ({ value: preset.id, label: preset.name, fill: gradientCss(preset) }))}"
        : "  swatches={solids.map((preset) => ({ value: preset.id, label: preset.name, fill: preset.hex }))}",
      `  columns={${String(COLUMNS.find((count) => count === columns) ?? 6)}}`,
      ...(disabled === true ? ["  disabled"] : []),
      '  defaultValue="lilac"',
      "/>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Gradients",
    description:
      "buttery's 24 gradients, six to a row. The chosen one gets the selection ring at once.",
    render: () => (
      <SwatchGrid
        label="Background"
        swatches={GRADIENTS}
        defaultValue="lilac"
      />
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
