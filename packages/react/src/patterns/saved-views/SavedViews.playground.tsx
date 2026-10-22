import { Menu, demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { SavedViews } from "@buttery/react";
import { Copy, Pencil, Trash2 } from "lucide-react";

export const page: DocsPage = {
  section: "components/navigation",
  title: "SavedViews",
  description:
    "A track of saved views of a list, the chosen one on a sliding raised pill, with every view and its actions in a menu.",
  order: 70,
  status: "new",
  since: "0.8.0",
};

const VIEWS = [
  { id: "all", label: "All orders" },
  { id: "unpaid", label: "Unpaid" },
  { id: "wholesale", label: "Wholesale" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "refunds", label: "Refunds this month" },
  { id: "pickup", label: "Picked up in store" },
];

function viewsOf(count: unknown): typeof VIEWS {
  return VIEWS.slice(0, typeof count === "number" ? count : 4);
}

function chosenOf(value: unknown, count: unknown): string {
  const chosen = demoChoice(value, ["all", "unpaid", "wholesale"]);
  return viewsOf(count).some((view) => view.id === chosen) ? chosen : "all";
}

export const live: LiveDemo = {
  controls: {
    defaultValue: {
      kind: "choice",
      options: ["all", "unpaid", "wholesale"],
      initial: "all",
    },
    views: { kind: "number", initial: 4, min: 2, max: 6 },
  },
  render: ({ defaultValue, views }) => {
    const chosen = chosenOf(defaultValue, views);
    const shown = viewsOf(views);
    return (
      <SavedViews
        key={`${chosen} ${String(shown.length)}`}
        label="Order views"
        views={shown}
        defaultValue={chosen}
      />
    );
  },
  code: ({ defaultValue, views }) =>
    [
      "<SavedViews",
      '  label="Order views"',
      `  defaultValue="${chosenOf(defaultValue, views)}"`,
      "  views={[",
      ...viewsOf(views).map(
        (view) => `    { id: "${view.id}", label: "${view.label}" },`,
      ),
      "  ]}",
      "/>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Saved views",
    description:
      "The pill slides to the view chosen; the … menu lists every view, the actions on the chosen one and Save as a new view.",
    render: () => (
      <SavedViews
        label="Order views"
        views={[
          { id: "all", label: "All orders" },
          { id: "unpaid", label: "Unpaid" },
          { id: "wholesale", label: "Wholesale" },
          { id: "subscriptions", label: "Subscriptions" },
        ]}
        actions={
          <>
            <Menu.Item icon={Pencil}>Rename</Menu.Item>
            <Menu.Item icon={Copy}>Duplicate</Menu.Item>
            <Menu.Item icon={Trash2}>Delete</Menu.Item>
          </>
        }
        onSaveAs={() => undefined}
      />
    ),
  },
];
