import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Inline } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { NumberField } from "@buttery/react";

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
];
