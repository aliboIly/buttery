import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, Checkbox } from "@buttery/react";

/** An uncontrolled box with a hint, read by its form on Save: a ticked box submits its name with "on". */
export function EmailTips(): ReactElement {
  const [saved, setSaved] = useState<string | undefined>(undefined);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const tips = new FormData(event.currentTarget).get("tips");
        setSaved(
          tips === "on" ? "You'll get tips by email" : "No tips by email",
        );
      }}
    >
      <Stack gap={3} align="start">
        <Checkbox
          label="Email me tips"
          hint="About once a month."
          name="tips"
        />
        <Button type="submit">Save</Button>
        <Text variant="body-sm" tone="secondary" role="status">
          {saved ?? ""}
        </Text>
      </Stack>
    </form>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("checkbox", "Email me tips");
  await press("button", "Save");
  await see("You'll get tips by email");
};
