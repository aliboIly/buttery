import { useState } from "react";
import type { ReactElement } from "react";
import { Select } from "@buttery/react";
import type { SelectOption } from "@buttery/react";

type Format = "png" | "jpg" | "webp";

const FORMATS: readonly SelectOption<Format>[] = [
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPG" },
  { value: "webp", label: "WebP" },
];

/** A small select for an export format, typed to its values. */
export function ExportFormat(): ReactElement {
  const [format, setFormat] = useState<Format>("png");
  return (
    <Select
      label="Export format"
      size="sm"
      options={FORMATS}
      value={format}
      onValueChange={setFormat}
    />
  );
}
