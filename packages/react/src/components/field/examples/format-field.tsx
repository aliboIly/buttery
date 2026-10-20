import type { ReactElement } from "react";
import { Field } from "@buttery/react";

/** A native select for the export format, labelled and described by Field. */
export function FormatField(): ReactElement {
  return (
    <Field label="Export as" hint="PNG keeps transparent corners." required>
      {(control) => (
        <select {...control} className="bt-control" defaultValue="png">
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
        </select>
      )}
    </Field>
  );
}
