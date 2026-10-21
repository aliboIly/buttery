import { Stack, Text } from "@buttery/core";
import type { ExamplePlay } from "@buttery/core";
import { HoverActions, IconButton } from "@buttery/react";
import { Settings } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";

const TOPICS = ["Orders waiting on payment", "Payouts", "Low green coffee"];

/** Notification rows whose settings gear shows on hover or keyboard focus, each opening its topic. */
export function NotificationRows(): ReactElement {
  const [opened, setOpened] = useState<string | undefined>(undefined);
  return (
    <Stack gap={2}>
      <Stack gap={1}>
        {TOPICS.map((topic) => (
          <HoverActions
            key={topic}
            actions={
              <IconButton
                icon={Settings}
                label={`Settings for ${topic}`}
                size="sm"
                onClick={() => {
                  setOpened(topic);
                }}
              />
            }
          >
            <Text variant="label">{topic}</Text>
          </HoverActions>
        ))}
      </Stack>
      <Text variant="caption">
        {opened === undefined ? "No topic open" : `Editing ${opened}`}
      </Text>
    </Stack>
  );
}

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Settings for Payouts");
  await see("Editing Payouts");
};
