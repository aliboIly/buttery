import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Inline, Stack } from "@butteryui/core";
import { demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { NumberField } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/inputs",
  title: "NumberField",
  description:
    "A small field for an exact number, with arrow-key steps, a stepper on hover and scrubbing by dragging its label.",
  order: 60,
  status: "stable",
  since: "0.4.0",
};

function SizeDemo(): ReactElement {
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1350);
  return (
    <Inline gap={4} wrap>
      <NumberField
        label="W"
        unit="px"
        min={1}
        max={8000}
        value={width}
        onValueChange={setWidth}
      />
      <NumberField
        label="H"
        unit="px"
        min={1}
        max={8000}
        value={height}
        onValueChange={setHeight}
      />
    </Inline>
  );
}

export const live: LiveDemo = {
  controls: {
    label: { kind: "text", initial: "W" },
    unit: { kind: "text", initial: "px" },
    labelPosition: {
      kind: "choice",
      options: ["side", "top"],
      initial: "side",
    },
    size: { kind: "choice", options: ["md", "sm", "lg"], initial: "md" },
    variant: {
      kind: "choice",
      options: ["outline", "soft"],
      initial: "outline",
    },
    disabled: { kind: "toggle", initial: false },
  },
  render: ({ label, unit, labelPosition, size, variant, disabled }) => (
    <NumberField
      label={String(label)}
      unit={String(unit)}
      labelPosition={demoChoice(labelPosition, ["side", "top"])}
      size={demoChoice(size, ["md", "sm", "lg"])}
      variant={demoChoice(variant, ["outline", "soft"])}
      disabled={disabled === true}
      min={1}
      defaultValue={1080}
    />
  ),
  code: ({ label, unit, labelPosition, size, variant, disabled }) =>
    `<NumberField label="${String(label)}" unit="${String(unit)}" labelPosition="${String(labelPosition)}"${size === "md" ? "" : ` size="${String(size)}"`}${variant === "soft" ? ' variant="soft"' : ""}${disabled === true ? " disabled" : ""} min={1} defaultValue={1080} />`,
};

export const demos: readonly DemoSection[] = [
  {
    title: "Width and height",
    description:
      "Type and press Enter, use the arrow keys (Shift for ten), hover for the stepper, or drag the W and H labels sideways.",
    render: () => <SizeDemo />,
  },
  {
    title: "Label on top",
    description:
      "Each field fills its column under its label, as in a menu's width and height fields.",
    render: () => (
      <Grid columns={2} gap={2}>
        <NumberField label="Width" labelPosition="top" defaultValue={1600} />
        <NumberField label="Height" labelPosition="top" defaultValue={900} />
      </Grid>
    ),
  },
  {
    title: "Decimals and disabled",
    render: () => (
      <Inline gap={4} wrap>
        <NumberField
          label="Scale"
          step={0.1}
          defaultValue={1.5}
          min={0.1}
          max={4}
        />
        <NumberField label="Depth" defaultValue={12} unit="px" disabled />
      </Inline>
    ),
  },
  {
    title: "Sizes, outline and soft",
    description:
      "28, 34 and 48px tall, 16px digits at lg; soft sits on bg-control and shows its edge only on hover and while it has focus.",
    render: () => (
      <Stack gap={3}>
        {(["outline", "soft"] as const).map((variant) => (
          <Inline key={variant} gap={4} align="center" wrap>
            {(["sm", "md", "lg"] as const).map((size) => (
              <NumberField
                key={size}
                label={`Batch, ${size}${variant === "soft" ? ", soft" : ""}`}
                size={size}
                variant={variant}
                defaultValue={12}
                unit="kg"
              />
            ))}
          </Inline>
        ))}
      </Stack>
    ),
  },
];
