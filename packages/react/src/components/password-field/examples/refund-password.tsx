import { useState } from "react";
import type { ReactElement, SubmitEvent } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, PasswordField, Switch } from "@butteryui/react";

/** A refund password that's disabled until the shop asks for one, with an error under it when it's too short to save. */
export function RefundPassword(): ReactElement {
  const [asked, setAsked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  const save = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (asked && password.length < 6) {
      setError("Use at least 6 characters.");
      return;
    }
    setError(undefined);
    setSaved(true);
  };
  return (
    <form onSubmit={save}>
      <Stack gap={4}>
        <Switch
          label="Ask for a password before a refund"
          checked={asked}
          onCheckedChange={(next) => {
            setAsked(next);
            setError(undefined);
            setSaved(false);
          }}
        />
        <PasswordField
          label="Refund password"
          autoComplete="new-password"
          disabled={!asked}
          value={password}
          onValueChange={(next) => {
            setPassword(next);
            setSaved(false);
          }}
          error={error}
        />
        <Inline gap={3} align="center">
          <Button type="submit" variant="primary">
            Save
          </Button>
          <Text variant="body-sm" tone="secondary">
            {saved ? "Saved" : "Not saved yet"}
          </Text>
        </Inline>
      </Stack>
    </form>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("switch", "Ask for a password before a refund");
  await type("Refund password", "1234");
  await press("button", "Save");
  await see("Use at least 6 characters.");
  await type("Refund password", "56");
  await press("button", "Save");
  await see("Saved");
};
