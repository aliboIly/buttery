import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { AuthFlow } from "@butteryui/react";

/** A sign-up with the terms under its button and passkeys offered in its field, in your own words. */
export function WithTerms(): ReactElement {
  return (
    <AuthFlow
      passkey
      labels={{
        title: "Make a Deckhand account",
        description:
          "Use your work email or phone. We'll send a code to check it's you.",
        submit: "Get a code",
      }}
      terms={
        <>
          By going on you agree to Deckhand's <a href="#terms">terms</a> and{" "}
          <a href="#privacy">privacy policy</a>.
        </>
      }
      onRequestCode={() => ({ ok: true })}
      onVerify={() => ({ ok: false, reason: "wrong" })}
    />
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("Make a Deckhand account");
  await see(/By going on you agree to Deckhand's/);
};
