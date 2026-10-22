import { Stack } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { TextArea } from "@buttery/react";

export const page: DocsPage = {
  section: "components/inputs",
  title: "TextArea",
  description:
    "A labelled box for longer text that grows with what's typed up to a limit, then scrolls.",
  order: 100,
  status: "stable",
  since: "0.5.0",
};

const LONG = Array.from(
  { length: 12 },
  (_, line) => `Line ${String(line + 1)} of a long note.`,
).join("\n");

export const live: LiveDemo = {
  controls: {
    label: { kind: "text", initial: "Note" },
    hint: { kind: "text", initial: "Shown under the card." },
    error: { kind: "text", initial: "" },
    rows: { kind: "number", initial: 3, min: 1, max: 8, step: 1 },
    disabled: { kind: "toggle", initial: false },
  },
  render: ({ label, hint, error, rows, disabled }) => (
    <TextArea
      label={String(label)}
      hint={String(hint)}
      error={String(error) === "" ? undefined : String(error)}
      rows={typeof rows === "number" ? rows : 3}
      disabled={disabled === true}
    />
  ),
  code: ({ label, hint, error, rows, disabled }) =>
    [
      "<TextArea",
      `  label="${String(label)}"`,
      ...(String(hint) === "" ? [] : [`  hint="${String(hint)}"`]),
      ...(String(error) === "" ? [] : [`  error="${String(error)}"`]),
      `  rows={${String(typeof rows === "number" ? rows : 3)}}`,
      ...(disabled === true ? ["  disabled"] : []),
      "/>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Grows, then scrolls",
    description:
      "Three lines when empty; it grows with the text up to eight, then scrolls with faded edges.",
    render: () => (
      <Stack gap={4}>
        <TextArea label="Note" hint="Shown under the card." />
        <TextArea label="Long note" defaultValue={LONG} />
        <TextArea
          label="Caption"
          defaultValue="Too long"
          error="Keep it under 280 characters."
        />
      </Stack>
    ),
  },
];
