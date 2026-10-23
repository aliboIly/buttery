import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { OneTimeCodeField } from "@butteryui/react";

/** A code pasted with its dash keeps only its digits, and the field says when it's whole. */
export function PastedCode(): ReactElement {
  const [code, setCode] = useState("");
  const [whole, setWhole] = useState("");
  return (
    <Stack gap={3}>
      <OneTimeCodeField
        value={code}
        onValueChange={setCode}
        onComplete={setWhole}
        message="Paste the code from your message, dash and all."
      />
      <Text variant="body-sm" tone="secondary">
        {whole === ""
          ? `${String(code.length)} of 6 digits`
          : `Code ${whole} is ready to check`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ type, see }) => {
  await type("One-time code", "480-517");
  await see("Code 480517 is ready to check");
};
