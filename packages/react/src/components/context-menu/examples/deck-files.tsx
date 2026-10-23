import { Copy, FolderInput, FolderOpen, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import type { ReactElement } from "react";
import {
  Pressable,
  Stack,
  Surface,
  Text,
  useApplePlatform,
} from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ContextMenu } from "@buttery/react";

const FOLDERS = ["Pitches", "Price lists", "Archive"] as const;

interface Deck {
  readonly id: number;
  readonly name: string;
  readonly folder: string;
}

const FIRST_DECKS: readonly Deck[] = [
  { id: 1, name: "Fall wholesale pitch", folder: "Pitches" },
  { id: 2, name: "Café price list", folder: "Price lists" },
  { id: 3, name: "Tasting day plan", folder: "Pitches" },
];

/** A folder of decks: right-click one, or focus it and press Shift+F10, to open, duplicate, move or delete it; its shortcuts work on the focused deck. */
export function DeckFiles(): ReactElement {
  const apple = useApplePlatform();
  const [decks, setDecks] = useState<readonly Deck[]>(FIRST_DECKS);
  const [opened, setOpened] = useState("No deck open");
  const files = useRef(new Map<number, HTMLButtonElement>());

  const duplicate = (deck: Deck): void => {
    const copy = {
      ...deck,
      id: Math.max(...decks.map(({ id }) => id)) + 1,
      name: `${deck.name} copy`,
    };
    const at = decks.indexOf(deck) + 1;
    setDecks([...decks.slice(0, at), copy, ...decks.slice(at)]);
  };
  const remove = (deck: Deck): void => {
    const at = decks.indexOf(deck);
    const next = decks[at + 1] ?? decks[at - 1];
    setDecks(decks.filter(({ id }) => id !== deck.id));
    if (next) files.current.get(next.id)?.focus();
  };

  return (
    <Stack gap={3}>
      <Text variant="caption">{`${String(decks.length)} decks · ${opened}`}</Text>
      <Stack gap={1} role="list" aria-label="Decks">
        {decks.map((deck) => (
          <Stack key={deck.id} role="listitem">
            <ContextMenu>
              <ContextMenu.Trigger asChild>
                <Surface asChild level="card" padX={3} padY={2} radius="md">
                  <Pressable
                    ref={(element) => {
                      if (element) files.current.set(deck.id, element);
                      return () => {
                        files.current.delete(deck.id);
                      };
                    }}
                    onClick={() => {
                      setOpened(`Opened ${deck.name}`);
                    }}
                  >
                    <Stack gap={1}>
                      <Text variant="label" truncate>
                        {deck.name}
                      </Text>
                      <Text variant="caption">{deck.folder}</Text>
                    </Stack>
                  </Pressable>
                </Surface>
              </ContextMenu.Trigger>
              <ContextMenu.Content aria-label={deck.name}>
                <ContextMenu.Item
                  icon={FolderOpen}
                  onSelect={() => {
                    setOpened(`Opened ${deck.name}`);
                  }}
                >
                  Open
                </ContextMenu.Item>
                <ContextMenu.Item
                  icon={Copy}
                  shortcut="mod+d"
                  onSelect={() => {
                    duplicate(deck);
                  }}
                >
                  Duplicate
                </ContextMenu.Item>
                <ContextMenu.Sub>
                  <ContextMenu.SubTrigger icon={FolderInput}>
                    Move to
                  </ContextMenu.SubTrigger>
                  <ContextMenu.SubContent>
                    <ContextMenu.RadioGroup
                      value={deck.folder}
                      onValueChange={(folder) => {
                        setDecks(
                          decks.map((other) =>
                            other.id === deck.id ? { ...other, folder } : other,
                          ),
                        );
                      }}
                    >
                      {FOLDERS.map((folder) => (
                        <ContextMenu.RadioItem key={folder} value={folder}>
                          {folder}
                        </ContextMenu.RadioItem>
                      ))}
                    </ContextMenu.RadioGroup>
                  </ContextMenu.SubContent>
                </ContextMenu.Sub>
                <ContextMenu.Separator />
                <ContextMenu.Item
                  icon={Trash2}
                  tone="danger"
                  shortcut={apple ? "backspace" : "delete"}
                  onSelect={() => {
                    remove(deck);
                  }}
                >
                  Delete
                </ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ focus, key, press, see }) => {
  await focus("button", /^Fall wholesale pitch\s*Pitches$/);
  await key("ContextMenu");
  await press("menuitem", "Duplicate");
  await see("4 decks · No deck open");
  await see("Fall wholesale pitch copy");
  await focus("button", /^Café price list\s*Price lists$/);
  await key("ContextMenu");
  await key("ArrowDown");
  await key("ArrowDown");
  await key("ArrowRight");
  await key("ArrowDown");
  await key("ArrowDown");
  await key("Enter");
  await see("Archive");
  await focus("button", /^Tasting day plan\s*Pitches$/);
  await key("ContextMenu");
  await press("menuitem", "Open");
  await see("4 decks · Opened Tasting day plan");
};
