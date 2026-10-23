import { useState } from "react";
import type { ReactElement } from "react";
import { Menu, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { SavedViews } from "@butteryui/react";
import type { SavedView } from "@butteryui/react";
import { Copy, Trash2 } from "lucide-react";

/** Saved views over an orders table, kept in state with the chosen one, and actions on it in the … menu. */
export function OrderViews(): ReactElement {
  const [views, setViews] = useState<readonly SavedView[]>([
    { id: "all", label: "All orders" },
    { id: "unpaid", label: "Unpaid" },
    { id: "wholesale", label: "Wholesale" },
  ]);
  const [view, setView] = useState("all");
  const [made, setMade] = useState(0);
  const chosen = views.find((candidate) => candidate.id === view);
  const add = (label: string): void => {
    const id = `view-${String(made + 1)}`;
    setViews([...views, { id, label }]);
    setMade(made + 1);
    setView(id);
  };
  return (
    <Stack gap={3}>
      <SavedViews
        label="Order views"
        views={views}
        value={view}
        onValueChange={setView}
        actions={
          <>
            <Menu.Item
              icon={Copy}
              onSelect={() => {
                add(`${chosen?.label ?? "View"} copy`);
              }}
            >
              Duplicate
            </Menu.Item>
            <Menu.Item
              icon={Trash2}
              tone="danger"
              disabled={views.length === 1}
              onSelect={() => {
                const rest = views.filter((candidate) => candidate.id !== view);
                setViews(rest);
                setView(rest[0]?.id ?? "");
              }}
            >
              Delete
            </Menu.Item>
          </>
        }
        onSaveAs={() => {
          add(`My view ${String(made + 1)}`);
        }}
      />
      <Text variant="body" tone="secondary">
        {`Showing ${chosen?.label ?? "no view"}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "Unpaid");
  await see("Showing Unpaid");
  await press("button", "More views");
  await press("menuitem", "Duplicate");
  await see("Showing Unpaid copy");
};
