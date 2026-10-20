import { useState } from "react";
import type { ReactElement } from "react";
import { Field } from "@buttery/react";

/** A native range input with a label, a hint and an error, wired by Field. */
export function CardSizeField(): ReactElement {
  const [size, setSize] = useState(1200);
  return (
    <Field
      label="Card width"
      hint={`${String(size)} pixels`}
      error={
        size > 1800 ? "Wider than 1800 pixels won't fit a story." : undefined
      }
    >
      {(control) => (
        <input
          {...control}
          className="bt-control"
          type="range"
          min={400}
          max={2000}
          step={100}
          value={size}
          onChange={(event) => {
            setSize(Number(event.target.value));
          }}
        />
      )}
    </Field>
  );
}
