import { useState } from "react";
import type { ReactElement } from "react";
import {
  OverflowCluster,
  Pressable,
  Stack,
  Surface,
  Text,
} from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

const TOOLS = [
  "Crop",
  "Rotate",
  "Flip",
  "Straighten",
  "Resize",
  "Remove background",
] as const;

/** Photo tools that keep their full labels and fold into the More menu from the end when the row runs out of room. */
export function TextToolbar(): ReactElement {
  const [last, setLast] = useState("None yet");
  return (
    <Stack gap={3} style={{ maxInlineSize: "var(--bt-w-dialog)" }}>
      <OverflowCluster gap={2} moreLabel="More tools">
        {TOOLS.map((tool, index) => (
          <OverflowCluster.Item
            key={tool}
            priority={TOOLS.length - index}
            menuItem={{
              label: tool,
              onSelect: () => {
                setLast(tool);
              },
            }}
          >
            <Surface asChild level="raised" padX={4} padY={2} radius="full">
              <Pressable
                onClick={() => {
                  setLast(tool);
                }}
              >
                <Text variant="button">{tool}</Text>
              </Pressable>
            </Surface>
          </OverflowCluster.Item>
        ))}
      </OverflowCluster>
      <Text variant="caption">Last tool: {last}</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Crop");
  await see("Last tool: Crop");
  await press("button", "More tools");
  await press("menuitem", "Remove background");
  await see("Last tool: Remove background");
};
