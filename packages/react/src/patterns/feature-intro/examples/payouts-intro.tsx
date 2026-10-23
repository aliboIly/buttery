import { useState } from "react";
import type { ReactElement } from "react";
import { Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { FeatureIntro, FormDialog, TextField } from "@buttery/react";

/** The payouts page before a bank account is added: its action opens the first step in a dialog, in place. */
export function PayoutsIntro(): ReactElement {
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState("");
  const [account, setAccount] = useState<string | undefined>(undefined);
  const digits = number.replaceAll(/\D/g, "");
  return (
    <>
      {account === undefined ? (
        <FeatureIntro
          title="Pay out to your bank every Friday"
          description="Move the week's sales to your account on a set day."
          action={{
            label: "Add a bank account",
            onClick: () => {
              setOpen(true);
            },
          }}
        />
      ) : (
        <Text variant="body">
          {`Payouts go to the account ending ${account.slice(-4)} every Friday.`}
        </Text>
      )}
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Add a bank account"
        description="Payouts start the Friday after you add it."
        valid={digits.length >= 8}
        onSubmit={() => {
          setAccount(digits);
        }}
        submitLabel="Add account"
      >
        <TextField
          label="Account number"
          inputMode="numeric"
          value={number}
          onValueChange={setNumber}
        />
      </FormDialog>
    </>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("button", "Add a bank account");
  await type("Account number", "40118421");
  await press("button", "Add account");
  await see("Payouts go to the account ending 8421 every Friday.");
};
