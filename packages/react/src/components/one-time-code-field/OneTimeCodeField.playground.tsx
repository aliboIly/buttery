import { Stack, demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { OneTimeCodeField } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/inputs",
  title: "OneTimeCodeField",
  description:
    "One input for a one-time code, drawn as a slot per digit, that takes a pasted or autofilled code whole.",
  order: 130,
  status: "new",
  since: "0.10.0",
};

const STATUSES = ["idle", "verifying", "success", "error"] as const;
const VARIANTS = ["outline", "soft"] as const;

export const live: LiveDemo = {
  controls: {
    status: { kind: "choice", options: [...STATUSES], initial: "idle" },
    variant: { kind: "choice", options: [...VARIANTS], initial: "outline" },
    length: { kind: "number", initial: 6, min: 4, max: 8 },
    message: { kind: "text", initial: "The code works for 10 minutes." },
    hideLabel: { kind: "toggle", initial: false },
  },
  render: ({ status, variant, length, message, hideLabel }) => (
    <OneTimeCodeField
      status={demoChoice(status, STATUSES)}
      variant={demoChoice(variant, VARIANTS)}
      length={Number(length)}
      message={String(message)}
      hideLabel={hideLabel === true}
    />
  ),
  code: ({ status, variant, length, message, hideLabel }) =>
    [
      "<OneTimeCodeField",
      ...(status === "idle" ? [] : [`  status="${String(status)}"`]),
      ...(variant === "outline" ? [] : [`  variant="${String(variant)}"`]),
      ...(Number(length) === 6 ? [] : [`  length={${String(length)}}`]),
      ...(String(message) === "" ? [] : [`  message="${String(message)}"`]),
      ...(hideLabel === true ? ["  hideLabel"] : []),
      "/>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "States",
    description:
      "Waiting for a code with a note, checking one, accepted, and turned down with what to do next.",
    render: () => (
      <Stack gap={5}>
        <OneTimeCodeField
          label="Waiting"
          message="The code works for 10 minutes."
        />
        <OneTimeCodeField
          label="Checking"
          defaultValue="480517"
          status="verifying"
        />
        <OneTimeCodeField
          label="Accepted"
          defaultValue="480517"
          status="success"
        />
        <OneTimeCodeField
          label="Turned down"
          status="error"
          message="That code isn't right. Check it and try again."
        />
      </Stack>
    ),
  },
  {
    title: "Lengths",
    description:
      "A slot for each digit, from a 4-digit locker code to an 8-digit one.",
    render: () => (
      <Stack gap={5}>
        <OneTimeCodeField label="Locker code" length={4} />
        <OneTimeCodeField label="Backup code" length={8} />
      </Stack>
    ),
  },
];
