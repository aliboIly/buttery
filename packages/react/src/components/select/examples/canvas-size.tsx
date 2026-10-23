import { useState } from "react";
import type { ReactElement } from "react";
import { Grid } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { NumberField, Select } from "@butteryui/react";
import type { SelectOption } from "@butteryui/react";

type Shape = "16:9" | "4:3" | "1:1" | "9:16" | "custom";

const SHAPES: readonly SelectOption<Shape>[] = [
  { value: "16:9", label: "16:9" },
  { value: "4:3", label: "4:3" },
  { value: "1:1", label: "1:1" },
  { value: "9:16", label: "9:16" },
];

const RATIOS: Readonly<Record<Exclude<Shape, "custom">, number>> = {
  "16:9": 16 / 9,
  "4:3": 4 / 3,
  "1:1": 1,
  "9:16": 9 / 16,
};

/** Preset shapes with width and height fields underneath; typing a size makes it custom. */
export function CanvasSize(): ReactElement {
  const [shape, setShape] = useState<Shape>("16:9");
  const [width, setWidth] = useState(1600);
  const [height, setHeight] = useState(900);
  return (
    <Select
      label="Canvas shape"
      options={SHAPES}
      value={shape}
      valueLabel={
        shape === "custom" ? `${String(width)} × ${String(height)}` : undefined
      }
      onValueChange={(next) => {
        setShape(next);
        if (next !== "custom") setHeight(Math.round(width / RATIOS[next]));
      }}
      footerLabel="Custom size"
      footer={
        <Grid columns={2} gap={2}>
          <NumberField
            label="Width"
            labelPosition="top"
            min={1}
            max={8000}
            value={width}
            onValueChange={(next) => {
              setWidth(next);
              setShape("custom");
            }}
          />
          <NumberField
            label="Height"
            labelPosition="top"
            min={1}
            max={8000}
            value={height}
            onValueChange={(next) => {
              setHeight(next);
              setShape("custom");
            }}
          />
        </Grid>
      }
    />
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("combobox", "Canvas shape, 16:9");
  await type("Width", "{selectall}1200{Enter}");
  await see("1200 × 900");
};
