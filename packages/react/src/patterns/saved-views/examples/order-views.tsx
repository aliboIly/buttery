import { useState } from "react";
import type { ReactElement } from "react";
import { Menu } from "@buttery/core";
import { SavedViews } from "@buttery/react";
import { Copy, Pencil, Trash2 } from "lucide-react";

/** Saved views over an orders table, with actions on the chosen one. */
export function OrderViews(): ReactElement {
  const [view, setView] = useState("all");
  return (
    <SavedViews
      label="Order views"
      views={[
        { id: "all", label: "All orders" },
        { id: "unpaid", label: "Unpaid" },
        { id: "wholesale", label: "Wholesale" },
      ]}
      value={view}
      onValueChange={setView}
      actions={
        <>
          <Menu.Item icon={Pencil}>Rename</Menu.Item>
          <Menu.Item icon={Copy}>Duplicate</Menu.Item>
          <Menu.Item icon={Trash2}>Delete</Menu.Item>
        </>
      }
      onSaveAs={() => undefined}
    />
  );
}
