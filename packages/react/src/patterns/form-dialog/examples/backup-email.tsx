import { Stack, Text } from "@buttery/core";
import type { ExamplePlay } from "@buttery/core";
import { Button, FormDialog, TextField } from "@buttery/react";
import { useState } from "react";
import type { ReactElement } from "react";

/** A form dialog whose Submit waits for an email address, then saves it. */
export function BackupEmail(): ReactElement {
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState<string | undefined>(undefined);
  return (
    <Stack gap={2}>
      <FormDialog
        trigger={<Button>Add a backup email</Button>}
        title="Add a backup email"
        description={
          <>
            We send sign-in codes there if you lose your main email.{" "}
            <a href="/help/backup-email">Why a backup?</a>
          </>
        }
        valid={email.includes("@")}
        onSubmit={() => {
          setSaved(email);
        }}
        submitLabel="Add email"
      >
        <TextField
          label="Backup email"
          type="email"
          value={email}
          onValueChange={setEmail}
        />
      </FormDialog>
      <Text variant="caption">
        {saved === undefined ? "No backup email" : `Backup: ${saved}`}
      </Text>
    </Stack>
  );
}

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("button", "Add a backup email");
  await type("Backup email", "rosa@halfmoon.example");
  await press("button", "Add email");
  await see("Backup: rosa@halfmoon.example");
};
