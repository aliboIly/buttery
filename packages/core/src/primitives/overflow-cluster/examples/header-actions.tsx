import type { ReactElement } from "react";
import { CircleHelp, Redo2, Share2, Undo2 } from "lucide-react";
import {
  Center,
  Icon,
  Inline,
  OverflowCluster,
  Pressable,
  Surface,
  Text,
} from "@buttery/core";

const ACTIONS = [
  { label: "Undo", icon: Undo2, priority: 3 },
  { label: "Redo", icon: Redo2, priority: 3 },
  { label: "Share", icon: Share2, priority: 1 },
  { label: "Help", icon: CircleHelp, priority: 0 },
] as const;

function run(label: string): void {
  document.title = `${label} · Card Studio`;
}

/** Header actions that collapse into a More menu, Help first, as the header narrows. */
export function HeaderActions(): ReactElement {
  return (
    <Inline gap={3}>
      <Text variant="title-sm" truncate>
        Spring launch
      </Text>
      <OverflowCluster gap={1} justify="end" moreLabel="More actions">
        {ACTIONS.map(({ label, icon, priority }) => (
          <OverflowCluster.Item
            key={label}
            priority={priority}
            menuItem={{
              label,
              icon,
              onSelect: () => {
                run(label);
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
                    run(label);
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
  );
}
