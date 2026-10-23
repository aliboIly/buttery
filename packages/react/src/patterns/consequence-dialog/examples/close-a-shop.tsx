import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, ConsequenceDialog } from "@butteryui/react";
import { PackageX, Users } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";

/** Closing a shop for good, opened from code, the confirm taking a moment while it saves. */
export function CloseAShop(): ReactElement {
  const [open, setOpen] = useState(false);
  const [closed, setClosed] = useState(false);
  return (
    <Stack gap={2}>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        Close the Pier Street shop
      </Button>
      <ConsequenceDialog
        open={open}
        onOpenChange={setOpen}
        title="Close the Pier Street shop?"
        items={[
          {
            icon: PackageX,
            title: "Its open orders are cancelled",
            body: "Customers are refunded and told by email.",
          },
          {
            icon: Users,
            title: "Its team keeps their accounts",
            body: "They move to the roastery's other shops.",
          },
        ]}
        confirmLabel="Close the shop"
        onConfirm={() =>
          new Promise<void>((resolve) => {
            window.setTimeout(() => {
              setClosed(true);
              resolve();
            }, 300);
          })
        }
      />
      <Text variant="caption">
        {closed ? "Pier Street is closed" : "Pier Street is open"}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Close the Pier Street shop");
  await press("button", "Close the shop");
  await see("Pier Street is closed");
};
