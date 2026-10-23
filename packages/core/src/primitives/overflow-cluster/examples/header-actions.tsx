import { useState } from "react";
import type { ReactElement } from "react";
import { CircleHelp, Redo2, Share2, Undo2 } from "lucide-react";
import {
  Center,
  Icon,
  Inline,
  OverflowCluster,
  Pressable,
  Stack,
  Surface,
  Text,
} from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

const ACTIONS = [
  { label: "Undo", icon: Undo2, priority: 3, done: "Undid the last edit" },
  { label: "Redo", icon: Redo2, priority: 3, done: "Redid the last edit" },
  {
    label: "Share",
    icon: Share2,
    priority: 1,
    done: "Copied a link to the deck",
  },
  { label: "Help", icon: CircleHelp, priority: 0, done: "Opened the help" },
] as const;

/** A header's actions, which fold into a More menu as the header narrows, Help first. */
export function HeaderActions(): ReactElement {
  const [status, setStatus] = useState("No changes yet");
  return (
    <Stack gap={3}>
      <Inline gap={3}>
        <Text variant="title-sm" truncate>
          Spring launch
        </Text>
        <OverflowCluster gap={1} justify="end" moreLabel="More actions">
          {ACTIONS.map(({ label, icon, priority, done }) => (
            <OverflowCluster.Item
              key={label}
              priority={priority}
              menuItem={{
                label,
                icon,
                onSelect: () => {
                  setStatus(done);
                },
              }}
            >
              <Surface
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
                    aria-label={label}
                    title={label}
                    onClick={() => {
                      setStatus(done);
                    }}
                  >
                    <Icon icon={icon} />
                  </Pressable>
                </Center>
              </Surface>
            </OverflowCluster.Item>
          ))}
        </OverflowCluster>
      </Inline>
      <Text variant="body-sm">{status}</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Undo");
  await see("Undid the last edit");
  await press("button", "Redo");
  await see("Redid the last edit");
};
