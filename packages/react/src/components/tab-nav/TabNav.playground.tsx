import { useState } from "react";
import type { ReactElement } from "react";
import { demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { TabNav } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/navigation",
  title: "TabNav",
  description:
    "Underlined tabs that go to other pages, marking the current one, with the links that don't fit in a menu.",
  order: 120,
  status: "new",
  since: "0.8.0",
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

const PAGES: readonly string[] = [
  "All",
  "Open",
  "Shipped",
  "Refunded",
  "Disputed",
  "On hold",
  "Archived",
  "Drafts",
];

function LivePages({
  count,
  first,
}: {
  readonly count: number;
  readonly first: string;
}): ReactElement {
  const [shown, setShown] = useState(first);
  return (
    <TabNav label="Order views">
      {PAGES.slice(0, count).map((name) => (
        <TabNav.Link
          key={name}
          href={`#orders-${name.toLowerCase().replace(" ", "-")}`}
          current={name === shown}
          onClick={(event) => {
            event.preventDefault();
            setShown(name);
          }}
        >
          {name}
        </TabNav.Link>
      ))}
    </TabNav>
  );
}

export const live: LiveDemo = {
  controls: {
    current: {
      kind: "choice",
      options: ["All", "Open", "Shipped", "Refunded"],
      initial: "All",
    },
    links: { kind: "number", initial: 4, min: 4, max: 8, step: 1 },
  },
  render: ({ current, links }) => (
    <LivePages
      key={String(current)}
      count={typeof links === "number" ? links : 4}
      first={demoChoice(current, ["All", "Open", "Shipped", "Refunded"])}
    />
  ),
  code: ({ current, links }) =>
    [
      '<TabNav label="Order views">',
      ...PAGES.slice(0, typeof links === "number" ? links : 4).map(
        (name) =>
          `  <TabNav.Link href="/orders/${name.toLowerCase().replace(" ", "-")}"${name === current ? " current" : ""}>${name}</TabNav.Link>`,
      ),
      "</TabNav>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Pages as tabs",
    description: "The underline slides to the page shown, marked aria-current.",
    render: () => <Views />,
  },
];
