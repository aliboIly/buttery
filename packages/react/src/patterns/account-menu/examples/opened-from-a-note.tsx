import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { AccountMenu, Button } from "@butteryui/react";

const WORKSPACES = [
  { id: "northside", name: "Northside Roasters" },
  { id: "harbor", name: "Harbor Beans" },
];

/** The menu opened from a note on the page, with open and onOpenChange kept in useState. */
export function OpenedFromANote(): ReactElement {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("northside");
  const name =
    WORKSPACES.find((workspace) => workspace.id === current)?.name ??
    "Northside Roasters";
  return (
    <Stack gap={3} align="start">
      <div style={{ inlineSize: "var(--bt-w-sidebar)", maxInlineSize: "100%" }}>
        <AccountMenu workspace={name} open={open} onOpenChange={setOpen}>
          <AccountMenu.Workspaces
            workspaces={WORKSPACES}
            current={current}
            onSwitch={setCurrent}
          />
        </AccountMenu>
      </div>
      <Text variant="body" tone="secondary">
        {current === "harbor"
          ? "Working in Harbor Beans"
          : "Harbor Beans added you to their workspace"}
      </Text>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        Show my workspaces
      </Button>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Show my workspaces");
  await press("menuitem", "Switch workspace");
  await press("menuitemradio", "Harbor Beans");
  await see("Working in Harbor Beans");
};
