import { useState } from "react";
import type { ReactElement } from "react";
import { Field, SegmentedControl } from "@buttery/react";

type CardSize = "Small" | "Medium" | "Large";

/** A segmented control with a label, a hint and an error, wired by Field. */
export function CardSizeField(): ReactElement {
  const [size, setSize] = useState<CardSize>("Medium");
  return (
    <Field
      label="Card size"
      hint="Medium fits a story and a post."
      error={size === "Large" ? "Large won't fit a story." : undefined}
    >
      {(control) => (
        <SegmentedControl<CardSize>
          {...control}
          label="Card size"
          options={["Small", "Medium", "Large"]}
          value={size}
          onValueChange={setSize}
        />
      )}
    </Field>
  );
}
