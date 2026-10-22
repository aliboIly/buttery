import { Stack } from "@buttery/core";
import { demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { PasswordField } from "@buttery/react";

export const page: DocsPage = {
  section: "components/inputs",
  title: "PasswordField",
  description:
    "A labelled password box with a button that shows or hides what's typed, and optional requirements.",
  order: 70,
  status: "stable",
  since: "0.5.0",
};

export const live: LiveDemo = {
  controls: {
    label: { kind: "text", initial: "Password" },
    size: { kind: "choice", options: ["md", "lg"], initial: "md" },
    error: { kind: "text", initial: "" },
    disabled: { kind: "toggle", initial: false },
  },
  render: ({ label, size, error, disabled }) => (
    <PasswordField
      label={String(label)}
      size={demoChoice(size, ["md", "lg"])}
      error={String(error)}
      disabled={disabled === true}
      defaultValue="butter-2026"
    />
  ),
  code: ({ label, size, error, disabled }) => {
    const props = [
      `label="${String(label)}"`,
      `size="${String(size)}"`,
      ...(error === "" ? [] : [`error="${String(error)}"`]),
      ...(disabled === true ? ["disabled"] : []),
      `defaultValue="butter-2026"`,
    ];
    return `<PasswordField ${props.join(" ")} />`;
  },
};

export const demos: readonly DemoSection[] = [
  {
    title: "Show and hide",
    description:
      "The eye button shows what's typed; it's a toggle with one name, \"Show password\".",
    render: () => (
      <Stack gap={4}>
        <PasswordField label="Password" defaultValue="butter-2026" />
        <PasswordField
          label="Password"
          defaultValue="hunter"
          error="That password doesn't match this email."
        />
      </Stack>
    ),
  },
  {
    title: "Requirements",
    description: "Rules listed under the field, each ticked once it's met.",
    render: () => (
      <PasswordField
        label="Choose a password"
        autoComplete="new-password"
        defaultValue="butter"
        requirements={[
          { label: "At least 8 characters", met: false },
          { label: "A number", met: false },
          { label: "Not your email address", met: true },
        ]}
      />
    ),
  },
];
