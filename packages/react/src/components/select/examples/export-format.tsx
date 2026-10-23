import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Select } from "@butteryui/react";
import type { SelectOption } from "@butteryui/react";

type Format = "png" | "jpg" | "webp";

const FORMATS: readonly SelectOption<Format>[] = [
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPG" },
  { value: "webp", label: "WebP" },
];

/** A small select for an export format, typed to its values, with the file name it leads to. */
export function ExportFormat(): ReactElement {
  const [format, setFormat] = useState<Format>("png");
  return (
    <Inline gap={3} align="center">
      <Select
        label="Export format"
        size="sm"
        options={FORMATS}
        value={format}
        onValueChange={setFormat}
      />
      <Text variant="body" tone="secondary">
        Saves as title-slide.{format}
      </Text>
    </Inline>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Saves as title-slide.png");
  await press("combobox", "Export format, PNG");
  await press("option", "WebP");
  await see("Saves as title-slide.webp");
};
