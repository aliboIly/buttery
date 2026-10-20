import type { ReactElement } from "react";
import { SegmentedControl } from "@buttery/react";

/** A canvas aspect ratio, with labels that differ from the values. */
export function AspectPicker(): ReactElement {
  return (
    <SegmentedControl
      label="Aspect ratio"
      defaultValue="4:5"
      options={[
        { value: "1:1", label: "Square" },
        { value: "4:5", label: "Portrait" },
        { value: "16:9", label: "Wide" },
      ]}
    />
  );
}
