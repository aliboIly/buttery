import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { TabNav } from "@buttery/react";

type View = "All" | "Open" | "Shipped" | "Refunded";

const VIEWS: readonly View[] = ["All", "Open", "Shipped", "Refunded"];

const SHOWING: Readonly<Record<View, string>> = {
  All: "Showing all 128 orders",
  Open: "Showing 12 open orders",
  Shipped: "Showing 97 shipped orders",
  Refunded: "Showing 19 refunded orders",
};

/** Order views as pages: each tab is a link, and the page shown is marked. */
export function OrderViews(): ReactElement {
  const [shown, setShown] = useState<View>("All");
  return (
    <Stack gap={4}>
      <TabNav label="Order views">
        {VIEWS.map((view) => (
          <TabNav.Link
            key={view}
            href={`#orders-${view.toLowerCase()}`}
            current={view === shown}
            onClick={(event) => {
              event.preventDefault();
              setShown(view);
            }}
          >
            {view}
          </TabNav.Link>
        ))}
      </TabNav>
      <Text variant="body" tone="secondary">
        {SHOWING[shown]}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Showing all 128 orders");
  await press("link", "Shipped");
  await see("Showing 97 shipped orders");
};
