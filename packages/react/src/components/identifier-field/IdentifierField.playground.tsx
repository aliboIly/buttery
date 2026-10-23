import { Stack, demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { IdentifierField } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/inputs",
  title: "IdentifierField",
  description:
    "One field for an email address or a phone number, which tells them apart as they're typed and formats a phone number as it goes.",
  order: 125,
  status: "new",
  since: "0.10.0",
};

const VARIANTS = ["outline", "soft"] as const;

export const live: LiveDemo = {
  controls: {
    label: { kind: "text", initial: "Email or phone number" },
    variant: { kind: "choice", options: [...VARIANTS], initial: "outline" },
    error: { kind: "text", initial: "" },
    passkey: { kind: "toggle", initial: false },
  },
  render: ({ label, variant, error, passkey }) => (
    <IdentifierField
      label={String(label)}
      variant={demoChoice(variant, VARIANTS)}
      error={String(error) === "" ? undefined : String(error)}
      passkey={passkey === true}
    />
  ),
  code: ({ label, variant, error, passkey }) =>
    [
      "<IdentifierField",
      ...(String(label) === "Email or phone number"
        ? []
        : [`  label="${String(label)}"`]),
      ...(variant === "outline" ? [] : [`  variant="${String(variant)}"`]),
      ...(String(error) === "" ? [] : [`  error="${String(error)}"`]),
      ...(passkey === true ? ["  passkey"] : []),
      "/>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "As it's typed",
    description:
      "A phone number formatted as it goes, an email address left as written, and one that couldn't be used.",
    render: () => (
      <Stack gap={4}>
        <IdentifierField label="A phone number" defaultValue="(503) 555-0142" />
        <IdentifierField
          label="An email address"
          defaultValue="rosa@halfmoon.coffee"
        />
        <IdentifierField
          label="One a code couldn't go to"
          defaultValue="(503) 555-0142"
          error="Too many codes sent. Try again in a minute."
        />
      </Stack>
    ),
  },
];
