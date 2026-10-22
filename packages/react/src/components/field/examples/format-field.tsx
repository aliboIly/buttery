import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Field, Select } from "@buttery/react";

type Format = "png" | "jpg";

const FORMATS = [
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPG" },
] as const;

const HINTS: Readonly<Record<Format, string>> = {
  png: "PNG keeps transparent corners.",
  jpg: "JPG fills transparent corners with white.",
};

/** A select in its outline look for the export format, labelled by Field, with a hint that follows the choice. */
export function FormatField(): ReactElement {
  const [format, setFormat] = useState<Format>("png");
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
  await see("PNG keeps transparent corners.");
  await press("button", /^Export as/);
  await press("option", "JPG");
  await see("JPG fills transparent corners with white.");
};
