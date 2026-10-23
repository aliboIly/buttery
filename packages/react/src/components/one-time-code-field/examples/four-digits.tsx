import type { ReactElement } from "react";
import { Stack } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { OneTimeCodeField } from "@butteryui/react";

/** A shorter code for a pickup locker, and the field's look while a code is checked and once it's accepted. */
export function FourDigits(): ReactElement {
  return (
    <Stack gap={5}>
      <OneTimeCodeField label="Locker code" length={4} />
      <OneTimeCodeField
        label="Checking a code"
        length={4}
        defaultValue="4821"
        status="verifying"
        labels={{ verifying: "Opening locker 12…" }}
      />
      <OneTimeCodeField
        label="An accepted code"
        length={4}
        defaultValue="4821"
        status="success"
        labels={{ success: "Locker 12 is open" }}
      />
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ see }) => {
  await see("Opening locker 12…");
  await see("Locker 12 is open");
};
