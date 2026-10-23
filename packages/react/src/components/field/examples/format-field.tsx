import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Field, Select } from "@buttery/react";

type Format = "csv" | "pdf";

const FORMATS = [
  { value: "csv", label: "CSV" },
  { value: "pdf", label: "PDF" },
] as const;

const HINTS: Readonly<Record<Format, string>> = {
  csv: "CSV opens in any spreadsheet app.",
  pdf: "PDF keeps the orders as they look on this page.",
};

/** A select in its outline look for the export format, labelled by Field, with a hint that follows the choice. */
export function FormatField(): ReactElement {
  const [format, setFormat] = useState<Format>("csv");
  return (
    <Field label="Export as" hint={HINTS[format]}>
      {(control) => (
        <Select<Format>
          {...control}
          label="Export as"
          variant="outline"
          options={FORMATS}
          value={format}
          onValueChange={setFormat}
        />
      )}
    </Field>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("CSV opens in any spreadsheet app.");
  await press("combobox", /^Export as/);
  await press("option", "PDF");
  await see("PDF keeps the orders as they look on this page.");
};
