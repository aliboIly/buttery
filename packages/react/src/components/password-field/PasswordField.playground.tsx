import { Stack } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { PasswordField } from "@buttery/react";

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
