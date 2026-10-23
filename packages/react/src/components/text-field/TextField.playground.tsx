import { Search } from "lucide-react";
import { Stack } from "@butteryui/core";
import { demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { TextField } from "@butteryui/react";

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
    size: { kind: "choice", options: ["md", "sm", "lg"], initial: "md" },
    variant: {
      kind: "choice",
      options: ["outline", "soft"],
      initial: "outline",
    },
    label: { kind: "text", initial: "Shop name" },
    hint: { kind: "text", initial: "Shown on your receipts." },
    error: { kind: "text", initial: "" },
    disabled: { kind: "toggle", initial: false },
  },
  render: ({ size, variant, label, hint, error, disabled }) => (
    <TextField
      size={demoChoice(size, ["md", "sm", "lg"])}
      variant={demoChoice(variant, ["outline", "soft"])}
      label={String(label)}
      hint={String(hint) === "" ? undefined : String(hint)}
      error={String(error) === "" ? undefined : String(error)}
      disabled={disabled === true}
    />
  ),
  code: ({ size, variant, label, hint, error, disabled }) =>
    [
      "<TextField",
      `  size="${demoChoice(size, ["md", "sm", "lg"])}"`,
      ...(variant === "soft" ? ['  variant="soft"'] : []),
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
          hint="Shown large on the gift card"
          defaultValue="Happy birthday"
        />
        <TextField
          label="Email"
          defaultValue="sam@"
          error="Enter an email address like name@example.com."
        />
        <TextField
          label="Workspace"
          defaultValue="Halfmoon Roastery"
          disabled
        />
      </Stack>
    ),
  },
  {
    title: "Sizes and icons",
    description:
      "28px for a toolbar or a dense panel; 34px for app forms; 48px with 16px text for sign-in pages.",
    render: () => (
      <Stack gap={4}>
        <TextField label="Batch code" size="sm" defaultValue="HM-0412" />
        <TextField label="Search coffees" type="search" iconStart={Search} />
        <TextField label="Email" size="lg" type="email" autoComplete="email" />
      </Stack>
    ),
  },
  {
    title: "Outline and soft",
    description:
      "Outline, the default, has a 1px edge; soft sits on bg-control and shows its edge only on hover and while it has focus. An error's edge shows in both.",
    render: () => (
      <Stack gap={4}>
        <TextField label="Roast name" defaultValue="Morning blend" />
        <TextField
          label="Roast name, soft"
          variant="soft"
          defaultValue="Morning blend"
        />
        <TextField
          label="Tasting notes"
          variant="soft"
          defaultValue="Too short"
          error="Write at least three notes."
        />
        <TextField label="Roaster" variant="soft" defaultValue="Ana" disabled />
      </Stack>
    ),
  },
];
