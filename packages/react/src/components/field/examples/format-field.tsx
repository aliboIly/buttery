import type { ReactElement } from "react";
import { Field, Select } from "@buttery/react";

const FORMATS = [
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPG" },
] as const;

/** A select in its outline look for the export format, labelled and described by Field. */
export function FormatField(): ReactElement {
  return (
    <Field label="Export as" hint="PNG keeps transparent corners.">
      {(control) => (
        <Select
          {...control}
          label="Export as"
          variant="outline"
          options={FORMATS}
          defaultValue="png"
        />
      )}
    </Field>
  );
}
