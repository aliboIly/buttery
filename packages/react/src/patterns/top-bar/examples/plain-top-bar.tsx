import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { TopBar } from "@buttery/react";
import { Bell } from "lucide-react";

/** A top bar with no search: just its actions and the create button. */
export function PlainTopBar(): ReactElement {
  const [roasts, setRoasts] = useState(3);
  const [unread, setUnread] = useState(true);
  return (
    <Stack gap={3}>
      <TopBar
        actions={
          <TopBar.Action
            icon={Bell}
            label="Notifications"
            dot={unread}
            onSelect={() => {
              setUnread(false);
            }}
          />
        }
        create={{
          label: "New roast",
          onSelect: () => {
            setRoasts(roasts + 1);
          },
        }}
      />
      <Text variant="body" tone="secondary">
        {`${String(roasts)} roasts planned today. ${unread ? "One new notification." : "You're all caught up."}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "New roast");
  await see("4 roasts planned today. One new notification.");
  await press("button", "Notifications, new");
  await see("4 roasts planned today. You're all caught up.");
};
