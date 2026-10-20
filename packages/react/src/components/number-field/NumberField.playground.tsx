import { useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { NumberField } from "@buttery/react";

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
