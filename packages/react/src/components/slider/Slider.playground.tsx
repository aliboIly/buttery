import { useState } from "react";
import type { ReactElement } from "react";
import { Stack } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { Slider } from "@buttery/react";

function RotationDemo(): ReactElement {
  const [angle, setAngle] = useState(-8);
  return (
    <Slider
      label="Rotation"
      min={-180}
      max={180}
      format="°"
      detents={[0]}
      resetValue={0}
      value={angle}
      onValueChange={setAngle}
    />
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Rotation",
    description:
      "Drag past 0° and it catches there. Double-click the label or the badge to reset; Shift and an arrow key moves ten degrees.",
    render: () => <RotationDemo />,
  },
  {
    title: "Formats, a filled range and disabled",
    render: () => (
      <Stack gap={4}>
        <Slider
          label="Scale"
          min={50}
          max={200}
          defaultValue={100}
          format="%"
        />
        <Slider label="Blur" max={40} defaultValue={12} format="px" showRange />
        <Slider label="Depth" defaultValue={30} disabled />
      </Stack>
    ),
  },
];
