import { useState } from "react";
import type { ReactElement } from "react";
import { Menu, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { AnnouncementDialog, Button } from "@buttery/react";
import { CircleHelp } from "lucide-react";

/** Opened from a Help menu's What's new item, with open and onOpenChange kept in useState. */
export function HelpMenuNews(): ReactElement {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(false);
  return (
    <Stack gap={3} align="start">
      <Menu>
        <Menu.Trigger asChild>
          <Button iconStart={CircleHelp}>Help</Button>
        </Menu.Trigger>
        <Menu.Content align="start">
          <Menu.Item
            onSelect={() => {
              setOpen(true);
            }}
          >
            What's new
          </Menu.Item>
          <Menu.Link href="#keyboard-shortcuts">Keyboard shortcuts</Menu.Link>
        </Menu.Content>
      </Menu>
      <AnnouncementDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setRead(true);
        }}
        title="Gift cards are here"
        sections={[
          {
            title: "Sell them at the counter",
            body: "Any amount from $10, printed on the receipt with its code.",
          },
          {
            title: "Spend them online",
            body: "Customers type the code at checkout, and what's left stays on the card.",
          },
        ]}
      />
      <Text variant="body" tone="secondary">
        {read ? "You're up to date" : "One update to read"}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Help");
  await press("menuitem", "What's new");
  await see("Sell them at the counter");
  await press("button", "Got it");
  await see("You're up to date");
};
