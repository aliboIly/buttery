import { useState } from "react";
import type { ReactElement } from "react";
import { SegmentedControl } from "@buttery/react";

/** Gradient or solid fill for a card background. */
export function FillSwitch(): ReactElement {
  const [fill, setFill] = useState<"Gradient" | "Solid">("Gradient");
  return (
    <SegmentedControl
      label="Fill"
      options={["Gradient", "Solid"]}
      value={fill}
      onValueChange={setFill}
    />
  );
}
