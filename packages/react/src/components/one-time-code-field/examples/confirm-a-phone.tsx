import { useState } from "react";
import type { ReactElement } from "react";
import { Stack } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, OneTimeCodeField, SettingsSection } from "@butteryui/react";
import type { OneTimeCodeStatus } from "@butteryui/react";

/** Confirming a new phone number in account settings with the code texted to it; 112233 confirms it. */
export function ConfirmAPhone(): ReactElement {
  const [status, setStatus] = useState<OneTimeCodeStatus>("idle");
  return (
    <SettingsSection
      title="Phone number"
      description="We texted a code to (215) 555-0134 to check it's yours."
    >
      <Stack gap={3}>
        <OneTimeCodeField
          label="Code from the text"
          status={status}
          labels={{ success: "Phone number confirmed" }}
          message={
            status === "error"
              ? "That code isn't right. Try it again."
              : undefined
          }
          onValueChange={() => {
            if (status === "error") setStatus("idle");
          }}
          onComplete={(code) => {
            setStatus(code === "112233" ? "success" : "error");
          }}
        />
        <Button variant="ghost">Text me a new code</Button>
      </Stack>
    </SettingsSection>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ type, see }) => {
  await type("Code from the text", "112233");
  await see("Phone number confirmed");
};
