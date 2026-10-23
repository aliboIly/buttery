import { useState } from "react";
import type { ReactElement } from "react";
import { CircleHelp, Copy, Download, Redo2, Share2, Undo2 } from "lucide-react";
import {
  Center,
  Icon,
  OverflowCluster,
  Pressable,
  Stack,
  Surface,
  Text,
} from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

const SIZES = [
  { size: "sm", height: "28px" },
  { size: "control", height: "34px" },
  { size: "button", height: "36px" },
] as const;

const ACTIONS = [
  { label: "Undo", icon: Undo2 },
  { label: "Redo", icon: Redo2 },
  { label: "Copy", icon: Copy },
  { label: "Download", icon: Download },
  { label: "Share", icon: Share2 },
  { label: "Help", icon: CircleHelp },
] as const;

/** The More button at each size, matching the items beside it, in rows too narrow for all six actions. */
export function Sizes(): ReactElement {
  const [last, setLast] = useState("Nothing yet");
  return (
    <Stack gap={5}>
      {SIZES.map(({ size, height }) => (
        <Stack key={size} gap={2}>
          <Text variant="caption">{`${size}, ${height}`}</Text>
          <Surface
            level="card"
            pad={2}
            style={{ inlineSize: "var(--bt-w-row-control)" }}
          >
            <OverflowCluster
              size={size}
              gap={1}
              moreLabel={`More actions (${size})`}
            >
              {ACTIONS.map(({ label, icon }, index) => (
                <OverflowCluster.Item
                  key={label}
                  priority={ACTIONS.length - index}
                  menuItem={{
                    label,
                    icon,
                    onSelect: () => {
                      setLast(label);
                    },
                  }}
                >
                  <Surface
                    asChild
                    level="raised"
                    radius="full"
                    style={{
                      inlineSize: `var(--bt-h-${size})`,
                      blockSize: `var(--bt-h-${size})`,
                    }}
                  >
                    <Center asChild>
                      <Pressable
                        aria-label={label}
                        title={label}
                        onClick={() => {
                          setLast(label);
                        }}
                      >
                        <Icon icon={icon} />
                      </Pressable>
                    </Center>
                  </Surface>
                </OverflowCluster.Item>
              ))}
            </OverflowCluster>
          </Surface>
        </Stack>
      ))}
      <Text variant="body-sm">Last action: {last}</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "More actions (sm)");
  await press("menuitem", "Help");
  await see("Last action: Help");
};
