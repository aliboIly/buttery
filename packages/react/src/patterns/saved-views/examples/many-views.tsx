import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { SavedViews } from "@butteryui/react";

const VIEWS = [
  { id: "all", label: "Everyone" },
  { id: "subscribers", label: "Subscribers" },
  { id: "lapsed", label: "Lapsed" },
  { id: "wholesale", label: "Wholesale" },
  { id: "local", label: "Picks up in store" },
];

/** More views than room: the last ones fold away and stay in the … menu. */
export function ManyViews(): ReactElement {
  const [shown, setShown] = useState("Everyone");
  return (
    <Stack gap={3} style={{ maxInlineSize: "var(--bt-w-dialog)" }}>
      <SavedViews
        label="Customer views"
        views={VIEWS}
        onValueChange={(id) => {
          setShown(VIEWS.find((view) => view.id === id)?.label ?? id);
        }}
      />
      <Text variant="body" tone="secondary">
        {`View: ${shown}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "More views");
  await press("menuitemradio", "Picks up in store");
  await see("View: Picks up in store");
};
