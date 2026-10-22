import type { DemoSection, DocsPage } from "@buttery/core";
import { PageHeader } from "@buttery/react";
import { Download, Plus, Upload } from "lucide-react";

export const page: DocsPage = {
  section: "patterns",
  title: "PageHeader",
  description:
    "An app page's title with an optional value and its explanation, and the page's actions at the end, folding into a menu.",
  order: 230,
  status: "new",
  since: "0.7.0",
};

export const demos: readonly DemoSection[] = [
  {
    title: "Title, value and actions",
    description:
      "Narrow the page: the actions fold into … before the title truncates, the primary one last.",
    render: () => (
      <PageHeader
        title="Orders"
        value="1,284"
        valueInfo="Orders placed in the last 30 days."
        actions={
          <>
            <PageHeader.Action
              icon={Upload}
              label="Import"
              onSelect={() => undefined}
            />
            <PageHeader.Action
              icon={Download}
              label="Export"
              onSelect={() => undefined}
            />
            <PageHeader.Action
              variant="primary"
              icon={Plus}
              label="New order"
              shortcut="n"
              priority={1}
              onSelect={() => undefined}
            />
          </>
        }
      />
    ),
  },
];
