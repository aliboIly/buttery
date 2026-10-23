import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import {
  Button,
  FormDialog,
  SettingRow,
  SettingsSection,
  TextField,
} from "@butteryui/react";

/** A settings section whose row changes its value through a form dialog, the row's state updating once it's saved. */
export function SignInSettings(): ReactElement {
  const [backup, setBackup] = useState<string | undefined>(undefined);
  const [draft, setDraft] = useState("");
  return (
    <SettingsSection
      title="Signing in"
      description="How you get back into the roastery's account."
    >
      <SettingRow
        title="Backup email"
        state={backup ?? "None yet. We'd send sign-in codes here."}
        action={
          <FormDialog
            trigger={
              <Button size="sm">
                {backup === undefined ? "Add" : "Change"}
              </Button>
            }
            onOpenChange={(open) => {
              if (open) setDraft(backup ?? "");
            }}
            title={
              backup === undefined
                ? "Add a backup email"
                : "Change the backup email"
            }
            description="We send sign-in codes there if you lose your main email."
            valid={draft.includes("@") && draft !== backup}
            onSubmit={() => {
              setBackup(draft);
            }}
            submitLabel="Save email"
          >
            <TextField
              label="Backup email"
              type="email"
              value={draft}
              onValueChange={setDraft}
            />
          </FormDialog>
        }
      />
      <SettingRow
        title="Two-step sign-in"
        state="On, with a code from an authenticator app."
      />
    </SettingsSection>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("button", "Add");
  await type("Backup email", "rosa@halfmoon.example");
  await press("button", "Save email");
  await see("rosa@halfmoon.example");
};
