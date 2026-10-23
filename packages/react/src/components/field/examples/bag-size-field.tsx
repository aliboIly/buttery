import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Field, SegmentedControl } from "@butteryui/react";

type BagSize = "250 g" | "500 g" | "1 kg";

/** A segmented control with a label, a hint and an error, wired by Field: 1 kg shows the error. */
export function BagSizeField(): ReactElement {
  const [size, setSize] = useState<BagSize>("500 g");
  return (
    <Field
      label="Bag size"
      hint="500 g lasts about two weeks."
      error={
        size === "1 kg" ? "1 kg bags are for wholesale accounts." : undefined
      }
    >
      {(control) => (
        <SegmentedControl<BagSize>
          {...control}
          label="Bag size"
          options={["250 g", "500 g", "1 kg"]}
          value={size}
          onValueChange={setSize}
        />
      )}
    </Field>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "1 kg");
  await see("1 kg bags are for wholesale accounts.");
};
