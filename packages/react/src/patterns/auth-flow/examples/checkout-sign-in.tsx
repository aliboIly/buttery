import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { AuthFlow, Callout } from "@butteryui/react";

/** The sign-in step of a checkout, with what's in the bag above it; the demo's code is 135790. */
export function CheckoutSignIn(): ReactElement {
  const [buyer, setBuyer] = useState<string | null>(null);
  return (
    <Surface level="card" pad={6} radius="auto">
      <Stack gap={5}>
        <Callout tone="info" title="Two bags of Morning Fog, $32">
          Sign in to pay; a new email or phone makes your account as you go.
        </Callout>
        {buyer === null ? (
          <AuthFlow
            titleAs="h2"
            hint={
              <Text variant="body-sm" tone="secondary">
                Demo code: 135790
              </Text>
            }
            onRequestCode={() => ({ ok: true, expiresIn: 600 })}
            onVerify={(identifier, code) =>
              code === "135790"
                ? { ok: true, session: identifier }
                : { ok: false, reason: "wrong" }
            }
            onSuccess={setBuyer}
          />
        ) : (
          <Text variant="body">{`Paying as ${buyer}.`}</Text>
        )}
      </Stack>
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ type, press, see }) => {
  await type("Email or phone number", "5035550142");
  await press("button", "Continue");
  await see("Check your texts");
  await type("One-time code", "135790");
  await see("Paying as (503) 555-0142.");
};
