import { Stack, Text, demoChoice } from "@butteryui/core";
import type {
  DemoSection,
  DemoValues,
  DocsPage,
  LiveDemo,
} from "@butteryui/core";
import { Button, FormDialog, TextField } from "@butteryui/react";
import { useState } from "react";
import type { ReactElement } from "react";

export const page: DocsPage = {
  section: "components/overlays",
  title: "FormDialog",
  description:
    "A dialog that asks for a value or two, Submit waiting until the form is valid.",
  order: 60,
  status: "new",
  since: "0.8.0",
};

function BackupEmail(): ReactElement {
  const [email, setEmail] = useState("");
  return (
    <FormDialog
      trigger={<Button>Add a backup email</Button>}
      title="Add a backup email"
      description={
        <>
          We send sign-in codes there if you lose your main email.{" "}
          <a href="#form-dialog">Why a backup?</a>
        </>
      }
      valid={email.includes("@")}
      onSubmit={() => undefined}
      submitLabel="Add email"
    >
      <TextField
        label="Backup email"
        type="email"
        value={email}
        onValueChange={setEmail}
      />
    </FormDialog>
  );
}

function LiveFormDialog({
  title,
  size,
  submitLabel,
}: {
  readonly title: string;
  readonly size: "sm" | "md";
  readonly submitLabel: string;
}): ReactElement {
  const [email, setEmail] = useState("");
  return (
    <Stack gap={2} align="start">
      <FormDialog
        trigger={<Button>{title}</Button>}
        title={title}
        size={size}
        valid={email.includes("@")}
        onSubmit={() => {
          setEmail("");
        }}
        submitLabel={submitLabel}
      >
        <TextField
          label="Backup email"
          type="email"
          value={email}
          onValueChange={setEmail}
        />
      </FormDialog>
      <Text variant="caption">
        {`Opens ${size === "md" ? "560" : "400"}px wide and saves with ${submitLabel}`}
      </Text>
    </Stack>
  );
}

function formDialogCode({ title, size, submitLabel }: DemoValues): string {
  return [
    "<FormDialog",
    `  trigger={<Button>${String(title)}</Button>}`,
    `  title="${String(title)}"`,
    `  size="${String(size)}"`,
    '  valid={email.includes("@")}',
    "  onSubmit={save}",
    `  submitLabel="${String(submitLabel)}"`,
    ">",
    '  <TextField label="Backup email" type="email" value={email} onValueChange={setEmail} />',
    "</FormDialog>",
  ].join("\n");
}

export const live: LiveDemo = {
  controls: {
    title: { kind: "text", initial: "Add a backup email" },
    size: { kind: "choice", options: ["sm", "md"], initial: "sm" },
    submitLabel: { kind: "text", initial: "Add email" },
  },
  render: ({ title, size, submitLabel }) => (
    <LiveFormDialog
      title={String(title)}
      size={demoChoice(size, ["sm", "md"])}
      submitLabel={String(submitLabel)}
    />
  ),
  code: formDialogCode,
};

export const demos: readonly DemoSection[] = [
  {
    title: "A backup email",
    description: "Focus lands on the field; Add email waits for an address.",
    render: () => <BackupEmail />,
  },
];
