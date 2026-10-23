import { useState } from "react";
import type { ReactElement } from "react";
import { CircleHelp, Redo2, Undo2 } from "lucide-react";
import {
  Center,
  Icon,
  Inline,
  Pressable,
  Stack,
  Surface,
  Text,
} from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

const ACTIONS = [
  { label: "Undo", icon: Undo2, done: "Undid the color change" },
  { label: "Redo", icon: Redo2, done: "Redid the color change" },
  { label: "Help", icon: CircleHelp, done: "Opened the help panel" },
] as const;

/** Header buttons that show only an icon at the control size, each icon labelled so it names its button. */
export function ControlIcons(): ReactElement {
  const [last, setLast] = useState("Nothing yet");
  return (
    <Stack gap={3} align="start">
      <Inline gap={1}>
        {ACTIONS.map(({ label, icon, done }) => (
          <Surface
            key={label}
            asChild
            level="raised"
            radius="full"
            style={{
              inlineSize: "var(--bt-h-button)",
              blockSize: "var(--bt-h-button)",
            }}
          >
            <Center asChild>
              <Pressable
                title={label}
                onClick={() => {
                  setLast(done);
                }}
              >
                <Icon icon={icon} label={label} />
              </Pressable>
            </Center>
          </Surface>
        ))}
      </Inline>
      <Text variant="body-sm">{last}</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Undo");
  await see("Undid the color change");
  await press("button", "Help");
  await see("Opened the help panel");
};
