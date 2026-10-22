import { useState } from "react";
import type { FocusEvent, ReactElement } from "react";
import {
  Control,
  Kbd,
  Pressable,
  Stack,
  Surface,
  Text,
  ariaKeyShortcuts,
  shortcutKeys,
  useApplePlatform,
  useShortcut,
} from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** Commands with their shortcuts at the end of each row, as in a menu; the keys work while focus is in the list. */
export function MenuShortcut(): ReactElement {
  const apple = useApplePlatform();
  const [copies, setCopies] = useState(1);
  const [focused, setFocused] = useState(false);
  const duplicate = (): void => {
    setCopies((count) => count + 1);
  };
  const remove = (): void => {
    setCopies((count) => Math.max(count - 1, 1));
  };
  useShortcut("mod+d", duplicate, { enabled: focused });
  useShortcut("mod+backspace", remove, { enabled: focused });
  const commands = [
    { label: "Duplicate card", shortcut: "mod+d", run: duplicate },
    { label: "Remove a copy", shortcut: "mod+backspace", run: remove },
  ];
  return (
    <Stack gap={3} align="start">
      <Surface
        level="floating"
        role="group"
        aria-label="Card commands"
        style={{ minInlineSize: "var(--bt-w-menu-min)" }}
        onFocus={() => {
          setFocused(true);
        }}
        onBlur={(event: FocusEvent<HTMLDivElement>) => {
          const next = event.relatedTarget;
          if (!(next instanceof Node && event.currentTarget.contains(next)))
            setFocused(false);
        }}
      >
        <Stack gap={0.5}>
          {commands.map(({ label, shortcut, run }) => (
            <Control key={label} size="button" asChild>
              <Pressable
                className="bt-hover-tint"
                aria-keyshortcuts={ariaKeyShortcuts(shortcut, apple)}
                onClick={run}
                style={{
                  justifyContent: "space-between",
                  gap: "var(--bt-space-6)",
                  borderRadius: "var(--bt-r-md)",
                }}
              >
                <Text variant="menu">{label}</Text>
                <Kbd keys={shortcutKeys(shortcut)} aria-hidden="true" />
              </Pressable>
            </Control>
          ))}
        </Stack>
      </Surface>
      <Text variant="body-sm" role="status">
        {copies === 1
          ? "1 copy of the card"
          : `${String(copies)} copies of the card`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Duplicate card");
  await see("2 copies of the card");
  await press("button", "Remove a copy");
  await see("1 copy of the card");
};
