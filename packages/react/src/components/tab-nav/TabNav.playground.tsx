import { useState } from "react";
import type { ReactElement } from "react";
import type { DemoSection, DocsPage } from "@buttery/core";
import { TabNav } from "@buttery/react";

export const page: DocsPage = {
  section: "components/navigation",
  title: "TabNav",
  description:
    "Underlined tabs that go to other pages, marking the current one, with the links that don't fit in a menu.",
  order: 120,
  status: "new",
  since: "0.7.0",
};

const VIEWS = ["All", "Open", "Shipped", "Refunded", "Disputed"] as const;

function Views(): ReactElement {
  const [shown, setShown] = useState<string>("Open");
  return (
    <TabNav label="Order views">
      {VIEWS.map((view) => (
        <TabNav.Link
          key={view}
          href={`#views-${view.toLowerCase()}`}
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

export const demos: readonly DemoSection[] = [
  {
    title: "Pages as tabs",
    description: "The underline slides to the page shown, marked aria-current.",
    render: () => <Views />,
  },
];
