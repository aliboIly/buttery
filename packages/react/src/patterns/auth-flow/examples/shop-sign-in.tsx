import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { AuthFlow, Button } from "@butteryui/react";

/** Signing in to a coffee shop with a code instead of a password; the demo's code is 246810. */
export function ShopSignIn(): ReactElement {
  const [signedIn, setSignedIn] = useState<string | null>(null);
  if (signedIn !== null) {
    return (
      <Stack gap={3} align="center">
        <Text variant="body">{`Signed in as ${signedIn}.`}</Text>
        <Button
          onClick={() => {
            setSignedIn(null);
          }}
        >
          Sign out
        </Button>
      </Stack>
    );
  }
  return (
    <AuthFlow
      logo={
        <Text variant="title-lg" asChild>
          <span>Halfmoon</span>
        </Text>
      }
      hint={
        <Text variant="body-sm" tone="secondary">
          Demo code: 246810
        </Text>
      }
      onRequestCode={async () => {
        await new Promise((resolve) => {
          window.setTimeout(resolve, 500);
        });
        return { ok: true, expiresIn: 600 };
      }}
      onVerify={(identifier, code) =>
        code === "246810"
          ? { ok: true, session: identifier }
          : { ok: false, reason: "wrong" }
      }
      onSuccess={setSignedIn}
    />
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ type, press, see }) => {
  await type("Email or phone number", "rosa@halfmoon.coffee");
  await press("button", "Continue");
  await see("Check your email");
  await type("One-time code", "246810");
  await see("You're signed in");
};
