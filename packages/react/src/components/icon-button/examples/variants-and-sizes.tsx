import { Bell, HelpCircle, Plus, X } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { IconButton } from "@buttery/react";

/** Ghost at 36 and 28px, a dot for something new, and the round primary create button of a top bar. */
export function VariantsAndSizes(): ReactElement {
  const [last, setLast] = useState("Nothing yet");
  return (
    <Stack gap={3} align="start">
      <Inline gap={2} align="center">
        <IconButton
          icon={HelpCircle}
          label="Help"
          onClick={() => {
            setLast("Opened help");
          }}
        />
        <IconButton
          icon={Bell}
          label="Notifications"
          dot
          onClick={() => {
            setLast("Opened notifications");
          }}
        />
        <IconButton
          icon={X}
          label="Close the panel"
          size="sm"
          onClick={() => {
            setLast("Closed the panel");
          }}
        />
        <IconButton
          icon={Plus}
          label="New deck"
          variant="primary"
          size="sm"
          onClick={() => {
            setLast("Started a new deck");
          }}
        />
      </Inline>
      <Text variant="body" tone="secondary">
        Last action: {last}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "New deck");
  await see("Last action: Started a new deck");
  await press("button", "Notifications, new");
  await see("Last action: Opened notifications");
};
