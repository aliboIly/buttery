import { useState } from "react";
import type { ReactElement } from "react";
import type { DemoSection } from "@buttery/core";
import { Field, SegmentedControl, Select } from "@buttery/react";

type Format = "png" | "jpg" | "webp";

const FORMATS = [
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPG" },
  { value: "webp", label: "WebP" },
] as const;

function ExportFormat(): ReactElement {
  const [format, setFormat] = useState<Format>("jpg");
  return (
    <Field
      label="Export as"
      hint="PNG and WebP keep transparent corners."
      error={
        format === "jpg"
          ? "JPG fills transparent corners with white."
          : undefined
      }
    >
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

export const demos: readonly DemoSection[] = [
  {
    title: "Any control",
    description:
      "The label names the control, and the hint and the error are read with it.",
    render: () => <ExportFormat />,
  },
  {
    title: "A segmented control",
    render: () => (
      <Field label="Card size" hint="Medium fits a story and a post.">
        {(control) => (
          <SegmentedControl
            {...control}
            label="Card size"
            options={["Small", "Medium", "Large"]}
            defaultValue="Medium"
          />
        )}
      </Field>
    ),
  },
];
