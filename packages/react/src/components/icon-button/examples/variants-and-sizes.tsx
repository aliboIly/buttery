import {
  Bell,
  Copy,
  HelpCircle,
  ImagePlus,
  Plus,
  Share,
  X,
} from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { IconButton } from "@butteryui/react";

/** Ghost at 36 and 28px with a dot for something new, soft and outline at rest, a 48px soft one and a primary create button. */
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
      </Inline>
      <Inline gap={2} align="center">
        <IconButton
          icon={Copy}
          label="Duplicate the slide"
          variant="soft"
          onClick={() => {
            setLast("Duplicated the slide");
          }}
        />
        <IconButton
          icon={Share}
          label="Share the deck"
          variant="outline"
          onClick={() => {
            setLast("Shared the deck");
          }}
        />
        <IconButton
          icon={ImagePlus}
          label="Add a photo"
          variant="soft"
          size="lg"
          onClick={() => {
            setLast("Added a photo");
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
  await press("button", "Share the deck");
  await see("Last action: Shared the deck");
  await press("button", "Add a photo");
  await see("Last action: Added a photo");
};
