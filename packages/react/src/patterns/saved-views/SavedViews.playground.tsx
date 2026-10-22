import type { DemoSection, DocsPage } from "@buttery/core";
import { Menu } from "@buttery/core";
import { SavedViews } from "@buttery/react";
import { Copy, Pencil, Trash2 } from "lucide-react";

export const page: DocsPage = {
  section: "components/navigation",
  title: "SavedViews",
  description:
    "A track of saved views of a list, the chosen one on a sliding raised pill, with every view and its actions in a menu.",
  order: 70,
  status: "new",
  since: "0.7.0",
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
