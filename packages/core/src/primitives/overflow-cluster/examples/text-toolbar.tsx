import { useState } from "react";
import type { ReactElement } from "react";
import { OverflowCluster, Pressable, Stack, Text } from "@buttery/core";

const TOOLS = [
  "Crop",
  "Rotate",
  "Flip",
  "Straighten",
  "Resize",
  "Remove background",
] as const;

/** Text actions that keep their full labels and fold into the menu from the end. */
export function TextToolbar(): ReactElement {
  const [last, setLast] = useState("None yet");
  return (
    <Stack gap={2}>
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
            <Pressable
              onClick={() => {
                setLast(tool);
              }}
            >
              <Text variant="button">{tool}</Text>
            </Pressable>
          </OverflowCluster.Item>
        ))}
      </OverflowCluster>
      <Text variant="caption">Last tool: {last}</Text>
    </Stack>
  );
}
