import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Inline } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { NumberField, Select } from "@buttery/react";
import type { SelectOption } from "@buttery/react";

export const page: DocsPage = {
  section: "components/selection",
  title: "Select",
  description:
    "A trigger that shows the chosen value and opens a list to pick another, with an optional footer for custom values.",
  order: 90,
  status: "stable",
  since: "0.5.0",
};

type Shape = "match" | "16:9" | "4:3" | "1:1" | "3:2" | "9:16";

const SHAPES: readonly SelectOption<Shape>[] = [
  { value: "1:1", label: "Square · 1:1" },
  { value: "4:3", label: "Classic · 4:3" },
  { value: "3:2", label: "Photo · 3:2" },
  { value: "16:9", label: "Wide · 16:9" },
  { value: "9:16", label: "Tall · 9:16" },
  { value: "match", label: "Fit to card" },
];

function CanvasSize(): ReactElement {
  const [shape, setShape] = useState<Shape>("16:9");
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  return (
    <Inline justify="end">
      <Select
        label="Canvas shape"
        options={SHAPES}
        value={shape}
        onValueChange={setShape}
        footerLabel="Custom size"
        footer={
          <Grid columns={2} gap={2}>
            <NumberField
              label="Width"
              labelPosition="top"
              min={1}
              max={8000}
              value={width}
              onValueChange={setWidth}
            />
            <NumberField
              label="Height"
              labelPosition="top"
              min={1}
              max={8000}
              value={height}
              onValueChange={setHeight}
            />
          </Grid>
        }
      />
    </Inline>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Canvas shape",
    description:
      "A ghost pill showing the value; the list lines up with its end and checks the chosen option.",
    render: () => (
      <Inline justify="end">
        <Select label="Canvas shape" options={SHAPES} defaultValue="16:9" />
      </Inline>
    ),
  },
  {
    title: "With a footer",
    description:
      "Width and height fields under the list for a custom size; Tab moves between the list and the fields.",
    render: () => <CanvasSize />,
  },
  {
    title: "Small, placeholder and disabled",
    render: () => (
      <Inline gap={2} wrap>
        <Select
          label="Export format"
          size="sm"
          options={[
            { value: "png", label: "PNG" },
            { value: "jpg", label: "JPG" },
          ]}
          defaultValue="png"
        />
        <Select
          label="Template"
          options={SHAPES}
          placeholder="Choose a shape"
        />
        <Select
          label="Canvas shape"
          options={SHAPES}
          defaultValue="1:1"
          disabled
        />
      </Inline>
    ),
  },
];
