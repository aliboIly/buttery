import { Bell } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import {
  Avatar,
  IconButton,
  NotificationNudge,
  SearchField,
} from "@buttery/react";

const MESSAGES = [
  "Larkspur Café: Will Tuesday's Guji ship before noon?",
  "Northgate Bakery: Can the house blend come ground for filter?",
];

/** An app's top row: a search, then the bell with its nudge and the account; reading the messages clears the dot. */
export function TopBarBell(): ReactElement {
  const [read, setRead] = useState(false);
  return (
    <Stack gap={4}>
      <Inline gap={3} align="center" justify="between">
        <SearchField label="Search orders" variant="soft" />
        <Inline gap={2} align="center">
          <NotificationNudge
            title="2 customers asked about delivery"
            description="Reply before Tuesday's roast ships."
            action={{
              label: "Read messages",
              onClick: () => {
                setRead(true);
              },
            }}
          >
            <IconButton icon={Bell} label="Notifications" dot={!read} />
          </NotificationNudge>
          <Avatar name="Rosa Alvarez" size="md" />
        </Inline>
      </Inline>
      {read ? (
        <Stack gap={2}>
          {MESSAGES.map((message) => (
            <Text key={message} variant="body-sm">
              {message}
            </Text>
          ))}
        </Stack>
      ) : (
        <Text variant="body-sm" tone="secondary">
          2 unread messages
        </Text>
      )}
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("2 customers asked about delivery");
  await press("button", "Read messages");
  await see("Larkspur Café: Will Tuesday's Guji ship before noon?");
};
