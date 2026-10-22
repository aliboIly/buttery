import type { DemoSection, DocsPage } from "@buttery/core";
import { Button, FormDialog, TextField } from "@buttery/react";
import { useState } from "react";
import type { ReactElement } from "react";

export const page: DocsPage = {
  section: "components/overlays",
  title: "FormDialog",
  description:
    "A dialog that asks for a value or two, Submit waiting until the form is valid.",
  order: 60,
  status: "new",
  since: "0.7.0",
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

export const demos: readonly DemoSection[] = [
  {
    title: "A backup email",
    description: "Focus lands on the field; Add email waits for an address.",
    render: () => <BackupEmail />,
  },
];
