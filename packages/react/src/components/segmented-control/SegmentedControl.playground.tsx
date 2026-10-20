import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { SegmentedControl } from "@buttery/react";

function FillDemo(): ReactElement {
  const [fill, setFill] = useState("Gradient");
  return (
    <Stack gap={3} align="start">
      <SegmentedControl
        label="Fill"
        options={["Gradient", "Solid"]}
        value={fill}
        onValueChange={setFill}
      />
      <Text variant="body-sm">Showing {fill.toLowerCase()} swatches.</Text>
    </Stack>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Two options",
    description:
      "Click a segment or use the arrow keys: the selection slides, and one is always chosen.",
    render: () => <FillDemo />,
  },
  {
    title: "Equal widths, a disabled option",
    render: () => (
      <SegmentedControl
        label="Canvas fit"
        options={[
          { value: "fit", label: "Fit" },
          { value: "fill", label: "Fill the frame" },
          { value: "crop", label: "Crop", disabled: true },
        ]}
      />
    ),
  },
];
