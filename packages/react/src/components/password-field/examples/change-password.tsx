import { useState } from "react";
import type { ReactElement, SubmitEvent } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, PasswordField } from "@butteryui/react";

/** An account's password section: the current password, a new one with its rules, and Change password, held back until both are ready. */
export function ChangePassword(): ReactElement {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [status, setStatus] = useState("Last changed in March");
  const requirements = [
    { label: "At least 10 characters", met: next.length >= 10 },
    { label: "Different from the current one", met: next !== current },
  ];
  const ready =
    current !== "" && requirements.every((requirement) => requirement.met);
  const save = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!ready) return;
    setCurrent("");
    setNext("");
    setStatus("Password changed just now");
  };
  return (
    <form onSubmit={save}>
      <Stack gap={5}>
        <Stack gap={2}>
          <Text variant="title-sm">Password</Text>
          <Text variant="body-sm" tone="secondary">
            {status}
          </Text>
        </Stack>
        <PasswordField
          label="Current password"
          revealLabel="Show current password"
          value={current}
          onValueChange={setCurrent}
        />
        <PasswordField
          label="New password"
          revealLabel="Show new password"
          autoComplete="new-password"
          value={next}
          onValueChange={setNext}
          requirements={requirements}
        />
        <Inline gap={2}>
          <Button type="submit" variant="primary" aria-disabled={!ready}>
            Change password
          </Button>
        </Inline>
      </Stack>
    </form>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await type("Current password", "spring-roast");
  await type("New password", "harvest-2026");
  await press("button", "Change password");
  await see("Password changed just now");
};
