import { useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import { NumberField } from "@buttery/react";

/** A crop's width and height in pixels, side by side. */
export function CropSize(): ReactElement {
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(630);
  return (
    <Inline gap={4}>
      <NumberField
        label="W"
        unit="px"
        min={1}
        value={width}
        onValueChange={setWidth}
      />
      <NumberField
        label="H"
        unit="px"
        min={1}
        value={height}
        onValueChange={setHeight}
      />
    </Inline>
  );
}
