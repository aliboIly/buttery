import type { DemoSection } from "@buttery/core";
import { Field } from "@buttery/react";

export const demos: readonly DemoSection[] = [
  {
    title: "Any control",
    description:
      "The label names the control, and the hint and the error are read with it.",
    render: () => (
      <Field
        label="Card width"
        hint="Between 400 and 2000 pixels"
        error="Wider than 1800 pixels won't fit a story."
      >
        {(control) => (
          <input
            {...control}
            className="bt-control"
            type="range"
            min={400}
            max={2000}
            defaultValue={1900}
          />
        )}
      </Field>
    ),
  },
];
