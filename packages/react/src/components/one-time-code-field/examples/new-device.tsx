import { useState } from "react";
import type { ReactElement } from "react";
import { Stack } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { OneTimeCodeField } from "@butteryui/react";

/** Both looks: an outlined code field on a page, and a soft one in a settings panel that confirms a new device. */
export function NewDevice(): ReactElement {
  const [code, setCode] = useState("");
  return (
    <Stack gap={6}>
      <OneTimeCodeField
        label="Code from your email"
        message="The code works for 10 minutes."
      />
      <OneTimeCodeField
        variant="soft"
        label="Code shown on your new device"
        value={code}
        onValueChange={setCode}
        message={
          code.length === 6
            ? `Code ${code} is ready to check.`
            : "Type the six digits it shows."
        }
      />
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ type, see }) => {
  await type("Code shown on your new device", "135792");
  await see("Code 135792 is ready to check.");
};
