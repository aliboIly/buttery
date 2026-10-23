import { Stack } from "@butteryui/core";
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

export const live: LiveDemo = {
  controls: {
    label: { kind: "text", initial: "Email or phone number" },
    error: { kind: "text", initial: "" },
    passkey: { kind: "toggle", initial: false },
  },
  render: ({ label, error, passkey }) => (
    <IdentifierField
      label={String(label)}
      error={String(error) === "" ? undefined : String(error)}
      passkey={passkey === true}
    />
  ),
  code: ({ label, error, passkey }) =>
    [
      "<IdentifierField",
      ...(String(label) === "Email or phone number"
        ? []
        : [`  label="${String(label)}"`]),
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
        <IdentifierField label="A phone number" defaultValue="(215) 555-0134" />
        <IdentifierField
          label="An email address"
          defaultValue="rosa@halfmoon.coffee"
        />
        <IdentifierField
          label="One a code couldn't go to"
          defaultValue="(215) 555-0134"
          error="Too many codes asked for. Wait a minute, then try again."
        />
      </Stack>
    ),
  },
];
