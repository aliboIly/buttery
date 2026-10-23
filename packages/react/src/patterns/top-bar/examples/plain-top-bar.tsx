import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { TopBar, toast } from "@butteryui/react";
import { Bell } from "lucide-react";

/** A top bar with no search: just its actions and the create button. */
export function PlainTopBar(): ReactElement {
  const [roasts, setRoasts] = useState(3);
  const [unread, setUnread] = useState(true);
  return (
    <TopBar
      actions={
        <TopBar.Action
          icon={Bell}
          label="Notifications"
          dot={unread}
          onSelect={() => {
            setUnread(false);
            toast(unread ? "Batch 3 is out of the roaster." : "Nothing new.");
          }}
        />
      }
      create={{
        label: "New roast",
        onSelect: () => {
          setRoasts(roasts + 1);
          toast(`Roast ${String(roasts + 1)} is on today's plan.`);
        },
      }}
    />
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "New roast");
  await see("Roast 4 is on today's plan.");
  await press("button", "Notifications, new");
  await see("Batch 3 is out of the roaster.");
};
