import { useState } from "react";
import type { ReactElement } from "react";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { Field, SegmentedControl, Select } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/inputs",
  title: "Field",
  description:
    "A label, an optional hint and an error message wired to any form control by id.",
  order: 50,
  status: "stable",
  since: "0.5.0",
};

type Format = "csv" | "pdf" | "json";

const FORMATS = [
  { value: "csv", label: "CSV" },
  { value: "pdf", label: "PDF" },
  { value: "json", label: "JSON" },
] as const;

function ExportFormat(): ReactElement {
  const [format, setFormat] = useState<Format>("pdf");
  return (
    <Field
      label="Export as"
      hint="CSV and JSON hold every order."
      error={
        format === "pdf" ? "PDF holds the first 500 orders only." : undefined
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
    hint: { kind: "text", initial: "CSV and JSON hold every order." },
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
          defaultValue="csv"
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
        { value: "csv", label: "CSV" },
        { value: "pdf", label: "PDF" },
        { value: "json", label: "JSON" },
      ]}
      defaultValue="csv"
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
      <Field label="Bag size" hint="500 g lasts about two weeks.">
        {(control) => (
          <SegmentedControl
            {...control}
            label="Bag size"
            options={["250 g", "500 g", "1 kg"]}
            defaultValue="500 g"
          />
        )}
      </Field>
    ),
  },
];
