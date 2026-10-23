import { Copy, Ellipsis, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import {
  Control,
  Icon,
  Inline,
  Menu,
  Pressable,
  Stack,
  Surface,
  Text,
} from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

interface PriceList {
  readonly id: number;
  readonly name: string;
}

const FIRST_LISTS: readonly PriceList[] = [
  { id: 1, name: "Café prices" },
  { id: 2, name: "Office prices" },
  { id: 3, name: "Holiday prices" },
];

/** Wholesale price lists, each with an actions menu at the end of its row that duplicates or deletes it. */
export function PriceLists(): ReactElement {
  const [lists, setLists] = useState<readonly PriceList[]>(FIRST_LISTS);
  return (
    <Stack gap={3}>
      <Text variant="caption">{`${String(lists.length)} price lists`}</Text>
      <Stack gap={3}>
        {lists.map((list, index) => (
          <Surface key={list.id} level="card" padX={3} padY={2} radius="md">
            <Inline gap={3} align="center" justify="between">
              <Text variant="body" truncate>
                {list.name}
              </Text>
              <Menu>
                <Surface asChild level="app" radius="full">
                  <Control size="sm" asChild>
                    <Menu.Trigger asChild>
                      <Pressable aria-label={`Actions for ${list.name}`}>
                        <Icon icon={Ellipsis} />
                      </Pressable>
                    </Menu.Trigger>
                  </Control>
                </Surface>
                <Menu.Content>
                  <Menu.Item
                    icon={Copy}
                    onSelect={() => {
                      const copy = {
                        id: Math.max(...lists.map(({ id }) => id)) + 1,
                        name: `${list.name} copy`,
                      };
                      setLists([
                        ...lists.slice(0, index + 1),
                        copy,
                        ...lists.slice(index + 1),
                      ]);
                    }}
                  >
                    Duplicate
                  </Menu.Item>
                  <Menu.Separator />
                  <Menu.Item
                    icon={Trash2}
                    tone="danger"
                    onSelect={() => {
                      setLists(lists.filter(({ id }) => id !== list.id));
                    }}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Content>
              </Menu>
            </Inline>
          </Surface>
        ))}
      </Stack>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Actions for Café prices");
  await press("menuitem", "Duplicate");
  await see("Café prices copy");
  await see("4 price lists");
  await press("button", "Actions for Office prices");
  await press("menuitem", "Delete");
  await see("3 price lists");
};
