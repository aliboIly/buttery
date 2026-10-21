import { useState } from "react";
import type { ReactElement } from "react";
import { SegmentedControl } from "@buttery/react";

/** Gradient or solid fill for a card background. */
export function FillSwitch(): ReactElement {
  const [fill, setFill] = useState<"Blend" | "Color">("Blend");
  return (
    <SegmentedControl
      label="Fill"
      options={["Blend", "Color"]}
      value={fill}
      onValueChange={setFill}
    />
  );
}
