import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, MorphMenu } from "@butteryui/react";

const MENUS = [
  { value: "guides", label: "Guides" },
  { value: "support", label: "Support" },
] as const;

/** The open menu kept in state, so the page can open one too, as Browse the guides does. */
export function MenuFromThePage(): ReactElement {
  const [open, setOpen] = useState("");
  const openLabel = MENUS.find((menu) => menu.value === open)?.label;
  return (
    <Stack gap={4}>
      <MorphMenu label="Help" value={open} onValueChange={setOpen}>
        <MorphMenu.Item label="Guides" value="guides">
          <MorphMenu.Column title="Start here">
            <MorphMenu.Entry
              href="#first-deck"
              title="Your first deck"
              caption="Ten minutes from blank to done"
            />
            <MorphMenu.Entry
              href="#shortcuts"
              title="Shortcuts"
              caption="Every key on one page"
            />
          </MorphMenu.Column>
        </MorphMenu.Item>
        <MorphMenu.Item label="Support" value="support">
          <MorphMenu.Column title="Ask us">
            <MorphMenu.Entry
              href="#contact"
              title="Contact"
              caption="We answer within a day"
            />
          </MorphMenu.Column>
        </MorphMenu.Item>
      </MorphMenu>
      <Inline gap={3} align="center">
        <Text variant="caption">
          {openLabel === undefined ? "No menu open" : `${openLabel} menu open`}
        </Text>
        <Button
          variant="soft"
          onClick={() => {
            setOpen("guides");
          }}
        >
          Browse the guides
        </Button>
      </Inline>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("No menu open");
  await press("button", "Browse the guides");
  await see("Guides menu open");
  await see("Ten minutes from blank to done");
};
