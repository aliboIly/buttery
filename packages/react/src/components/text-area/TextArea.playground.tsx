import { demoChoice, Stack } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { TextArea } from "@butteryui/react";

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
    hint: { kind: "text", initial: "Printed on the packing slip." },
    error: { kind: "text", initial: "" },
    rows: { kind: "number", initial: 3, min: 1, max: 8, step: 1 },
    size: { kind: "choice", options: ["md", "sm", "lg"], initial: "md" },
    variant: {
      kind: "choice",
      options: ["outline", "soft"],
      initial: "outline",
    },
    disabled: { kind: "toggle", initial: false },
  },
  render: ({ label, hint, error, rows, size, variant, disabled }) => (
    <TextArea
      label={String(label)}
      hint={String(hint)}
      error={String(error) === "" ? undefined : String(error)}
      rows={typeof rows === "number" ? rows : 3}
      size={demoChoice(size, ["md", "sm", "lg"])}
      variant={demoChoice(variant, ["outline", "soft"])}
      disabled={disabled === true}
    />
  ),
  code: ({ label, hint, error, rows, size, variant, disabled }) =>
    [
      "<TextArea",
      `  label="${String(label)}"`,
      ...(size === "md" ? [] : [`  size="${String(size)}"`]),
      ...(variant === "soft" ? ['  variant="soft"'] : []),
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
        <TextArea label="Note" hint="Printed on the packing slip." />
        <TextArea label="Long note" defaultValue={LONG} />
        <TextArea
          label="Caption"
          defaultValue="Too long"
          error="Keep it under 280 characters."
        />
      </Stack>
    ),
  },
  {
    title: "Sizes",
    description:
      "One line of a small box is 28px tall, as an sm field is, and of a large one 48px with 16px text, as an lg field is; md keeps 22px lines.",
    render: () => (
      <Stack gap={4}>
        <TextArea label="Batch note" size="sm" rows={2} />
        <TextArea label="Packing note" rows={2} />
        <TextArea label="Gift message" size="lg" rows={2} />
      </Stack>
    ),
  },
  {
    title: "Outline and soft",
    description:
      "Soft sits on bg-control and shows its edge only on hover and while it has focus.",
    render: () => (
      <Stack gap={4}>
        <TextArea
          label="Roast log"
          defaultValue="Dropped at 9:40, a little dark."
        />
        <TextArea
          label="Roast log, soft"
          variant="soft"
          defaultValue="Dropped at 9:40, a little dark."
        />
      </Stack>
    ),
  },
];
