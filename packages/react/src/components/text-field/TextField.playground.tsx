import { Search } from "lucide-react";
import { Stack } from "@buttery/core";
import { demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { TextField } from "@buttery/react";

export const page: DocsPage = {
  section: "components/inputs",
  title: "TextField",
  description:
    "A labelled box for a line of text, with a hint, an error and optional icons.",
  order: 110,
  status: "stable",
  since: "0.5.0",
};

export const live: LiveDemo = {
  controls: {
    size: { kind: "choice", options: ["md", "lg"], initial: "md" },
    label: { kind: "text", initial: "Shop name" },
    hint: { kind: "text", initial: "Shown on your receipts." },
    error: { kind: "text", initial: "" },
    disabled: { kind: "toggle", initial: false },
  },
  render: ({ size, label, hint, error, disabled }) => (
    <TextField
      size={demoChoice(size, ["md", "lg"])}
      label={String(label)}
      hint={String(hint) === "" ? undefined : String(hint)}
      error={String(error) === "" ? undefined : String(error)}
      disabled={disabled === true}
    />
  ),
  code: ({ size, label, hint, error, disabled }) =>
    [
      "<TextField",
      `  size="${demoChoice(size, ["md", "lg"])}"`,
      `  label="${String(label)}"`,
      ...(String(hint) === "" ? [] : [`  hint="${String(hint)}"`]),
      ...(String(error) === "" ? [] : [`  error="${String(error)}"`]),
      ...(disabled === true ? ["  disabled"] : []),
      "/>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "States",
    description: "Empty, filled with a hint, with an error, and disabled.",
    render: () => (
      <Stack gap={4}>
        <TextField label="Name" placeholder="Your name" autoComplete="name" />
        <TextField
          label="Title"
          hint="Shown large on the first slide"
          defaultValue="Summer launch"
        />
        <TextField
          label="Email"
          defaultValue="sam@"
          error="Enter an email address like name@example.com."
        />
        <TextField label="Workspace" defaultValue="Deckhand" disabled />
      </Stack>
    ),
  },
  {
    title: "Sizes and icons",
    description: "34px for app forms; 48px with 16px text for sign-in pages.",
    render: () => (
      <Stack gap={4}>
        <TextField label="Search decks" type="search" iconStart={Search} />
        <TextField label="Email" size="lg" type="email" autoComplete="email" />
      </Stack>
    ),
  },
];
