import { useState } from "react";
import type { ReactElement } from "react";
import { TabNav } from "@buttery/react";

const VIEWS = ["All", "Open", "Shipped", "Refunded"] as const;

/** Order views as pages: each tab is a link, and the page shown is marked. */
export function OrderViews(): ReactElement {
  const [shown, setShown] = useState<string>("All");
  return (
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
  );
}
