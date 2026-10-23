import { demoChoice, Stack } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { Checkbox } from "@butteryui/react";

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
    size: { kind: "choice", options: ["md", "sm"], initial: "md" },
    disabled: { kind: "toggle", initial: false },
    error: { kind: "text", initial: "" },
  },
  render: ({ label, defaultChecked, size, disabled, error }) => {
    const start = demoChoice(defaultChecked, STARTS);
    return (
      <Checkbox
        key={start}
        label={String(label)}
        defaultChecked={TICKED[start]}
        size={demoChoice(size, ["md", "sm"])}
        disabled={disabled === true}
        error={String(error)}
      />
    );
  },
  code: ({ label, defaultChecked, size, disabled, error }) => {
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
      ...(size === "sm" ? ['size="sm"'] : []),
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
        <Checkbox label="Print packing slips" defaultChecked />
        <Checkbox
          label="Every order this week"
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
  {
    title: "Sizes",
    description:
      "md, the default, is an 18px box beside a label-role label; sm is a 14px box beside 13px words, for a dense list. Both keep a 24px target.",
    render: () => (
      <Stack gap={4}>
        <Checkbox label="Print packing slips" defaultChecked />
        <Checkbox
          label="Print gift notes"
          hint="On the slip, under the order."
          size="sm"
          defaultChecked
        />
        <Checkbox label="Print return labels" size="sm" />
        <Checkbox
          label="Print customs forms"
          size="sm"
          error="Add a customs number in Shipping first."
        />
      </Stack>
    ),
  },
];
