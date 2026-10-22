import { useState } from "react";
import type { ReactElement } from "react";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { Field, SegmentedControl, Select } from "@buttery/react";

export const page: DocsPage = {
  section: "components/inputs",
  title: "Field",
  description:
    "A label, an optional hint and an error message wired to any form control by id.",
  order: 50,
  status: "stable",
  since: "0.5.0",
};

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

export const live: LiveDemo = {
  controls: {
    label: { kind: "text", initial: "Export as" },
    hint: { kind: "text", initial: "PNG and WebP keep transparent corners." },
    error: { kind: "text", initial: "" },
  },
  render: ({ label, hint, error }) => (
    <Field label={String(label)} hint={String(hint)} error={String(error)}>
      {(control) => (
        <Select<Format>
          {...control}
          label={String(label)}
          variant="outline"
          options={FORMATS}
          defaultValue="png"
        />
      )}
    </Field>
  ),
  code: ({ label, hint, error }) => {
    const props = [
      `label="${String(label)}"`,
      ...(hint === "" ? [] : [`hint="${String(hint)}"`]),
      ...(error === "" ? [] : [`error="${String(error)}"`]),
    ];
    return `<Field ${props.join(" ")}>
  {(control) => (
    <Select
      {...control}
      label="${String(label)}"
      variant="outline"
      options={[
        { value: "png", label: "PNG" },
        { value: "jpg", label: "JPG" },
        { value: "webp", label: "WebP" },
      ]}
      defaultValue="png"
    />
  )}
</Field>`;
  },
};

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
