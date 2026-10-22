import { demoChoice, Stack } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { Checkbox } from "@buttery/react";

export const page: DocsPage = {
  section: "components/selection",
  title: "Checkbox",
  description:
    "A box to tick for one yes-or-no choice, with its label beside it.",
  order: 20,
  status: "stable",
  since: "0.5.0",
};

const STARTS = ["false", "true", "indeterminate"] as const;

const TICKED = {
  false: false,
  true: true,
  indeterminate: "indeterminate",
} as const;

export const live: LiveDemo = {
  controls: {
    label: { kind: "text", initial: "Keep me signed in" },
    defaultChecked: { kind: "choice", options: STARTS, initial: "false" },
    disabled: { kind: "toggle", initial: false },
    error: { kind: "text", initial: "" },
  },
  render: ({ label, defaultChecked, disabled, error }) => {
    const start = demoChoice(defaultChecked, STARTS);
    return (
      <Checkbox
        key={start}
        label={String(label)}
        defaultChecked={TICKED[start]}
        disabled={disabled === true}
        error={String(error)}
      />
    );
  },
  code: ({ label, defaultChecked, disabled, error }) => {
    const start = demoChoice(defaultChecked, STARTS);
    const ticked =
      start === "true"
        ? " defaultChecked"
        : start === "indeterminate"
          ? ' defaultChecked="indeterminate"'
          : "";
    const parts = [
      `label="${String(label)}"`,
      ...(ticked === "" ? [] : [ticked.trim()]),
      ...(disabled === true ? ["disabled"] : []),
      ...(String(error) === "" ? [] : [`error="${String(error)}"`]),
    ];
    return `<Checkbox ${parts.join(" ")} />`;
  },
};

export const demos: readonly DemoSection[] = [
  {
    title: "States",
    description:
      "Unticked, ticked, mixed, with a hint, with an error, and disabled.",
    render: () => (
      <Stack gap={4}>
        <Checkbox label="Keep me signed in" />
        <Checkbox label="Snap to the grid" defaultChecked />
        <Checkbox
          label="Every card in this folder"
          defaultChecked="indeterminate"
        />
        <Checkbox label="Email me tips" hint="About once a month." />
        <Checkbox
          label="I agree to the terms"
          error="Agree to the terms to make an account."
        />
        <Checkbox label="Sync to the cloud" disabled />
      </Stack>
    ),
  },
];
