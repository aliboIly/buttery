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
} from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

interface Card {
  readonly id: number;
  readonly name: string;
}

const FIRST_CARDS: readonly Card[] = [
  { id: 1, name: "Spring launch" },
  { id: 2, name: "Weekend tasting" },
  { id: 3, name: "Autumn blend" },
];

/** A list of cards, each with an actions menu at the end of its row that duplicates or deletes it. */
export function CardList(): ReactElement {
  const [cards, setCards] = useState<readonly Card[]>(FIRST_CARDS);
  return (
    <Stack gap={3}>
      <Text variant="caption">{`${String(cards.length)} cards`}</Text>
      <Stack gap={3}>
        {cards.map((card, index) => (
          <Surface key={card.id} level="card" padX={3} padY={2} radius="md">
            <Inline gap={3} align="center" justify="between">
              <Text variant="body" truncate>
                {card.name}
              </Text>
              <Menu>
                <Surface asChild level="app" radius="full">
                  <Control size="sm" asChild>
                    <Menu.Trigger asChild>
                      <Pressable aria-label={`Actions for ${card.name}`}>
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
                        id: Math.max(...cards.map(({ id }) => id)) + 1,
                        name: `${card.name} copy`,
                      };
                      setCards([
                        ...cards.slice(0, index + 1),
                        copy,
                        ...cards.slice(index + 1),
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
                      setCards(cards.filter(({ id }) => id !== card.id));
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
  await press("button", "Actions for Spring launch");
  await press("menuitem", "Duplicate");
  await see("Spring launch copy");
  await see("4 cards");
  await press("button", "Actions for Weekend tasting");
  await press("menuitem", "Delete");
  await see("3 cards");
};
