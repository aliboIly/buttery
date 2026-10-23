import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, Checkbox } from "@buttery/react";

/** An error on a box that has to be ticked, cleared once it is, beside a box that's disabled on this plan. */
export function AgreeToTerms(): ReactElement {
  const [agreed, setAgreed] = useState(false);
  const [tried, setTried] = useState(false);
  const [created, setCreated] = useState(false);
  return (
    <Stack gap={4} align="start">
      <Checkbox
        label="I agree to the terms"
        checked={agreed}
        onCheckedChange={(next) => {
          setAgreed(next === true);
        }}
        error={
          tried && !agreed
            ? "Agree to the terms to make an account."
            : undefined
        }
      />
      <Checkbox
        label="Sync to the cloud"
        hint="Available on the Roaster plan."
        disabled
      />
      <Inline gap={3} align="center">
        <Button
          variant="primary"
          onClick={() => {
            setTried(true);
            setCreated(agreed);
          }}
        >
          Create account
        </Button>
        <Text variant="body-sm" tone="secondary" role="status">
          {created ? "Account created" : ""}
        </Text>
      </Inline>
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Create account");
  await see("Agree to the terms to make an account.");
  await press("checkbox", "I agree to the terms");
  await press("button", "Create account");
  await see("Account created");
};
