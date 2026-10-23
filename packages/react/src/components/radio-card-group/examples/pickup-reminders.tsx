import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { RadioCardGroup } from "@butteryui/react";

const WHEN = [
  {
    value: "day",
    label: "The day before",
    description: "An email at 9 in the morning.",
  },
  {
    value: "hour",
    label: "An hour before",
    description: "A text message.",
  },
  { value: "none", label: "No reminder" },
] as const;

/** A small group for a narrow panel: 14px radios, 13px names, options 8 apart. */
export function PickupReminders(): ReactElement {
  const [when, setWhen] = useState<(typeof WHEN)[number]["value"]>("day");
  const chosen = WHEN.find((option) => option.value === when);
  return (
    <Stack gap={4}>
      <RadioCardGroup
        label="Pickup reminders"
        size="sm"
        options={WHEN}
        value={when}
        onValueChange={setWhen}
      />
      <Text variant="body-sm" tone="secondary">
        {`Reminder: ${chosen?.label ?? "No reminder"}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Reminder: The day before");
  await press("radio", "An hour before");
  await see("Reminder: An hour before");
};
