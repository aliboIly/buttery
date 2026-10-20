import { VisuallyHidden } from "radix-ui";
import { useState } from "react";
import type { ReactElement } from "react";
import { FloatingLanes, Inline, Pressable, Surface, Text } from "@buttery/core";

/** A notice in the bottom-end lane that stays while an export runs, announced from a status region that stays mounted. */
export function ExportProgress(): ReactElement {
  const [exporting, setExporting] = useState(false);
  return (
    <>
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Pressable
          aria-pressed={exporting}
          onClick={() => {
            setExporting((current) => !current);
          }}
        >
          <Text variant="button">
            {exporting ? "Stop the export" : "Export 12 cards"}
          </Text>
        </Pressable>
      </Surface>
      <VisuallyHidden.Root role="status">
        {exporting ? "Exporting 12 cards" : ""}
      </VisuallyHidden.Root>
      {exporting ? (
        <FloatingLanes.Item lane="bottom-end">
          <Surface level="floating" padX={4} padY={3}>
            <Inline gap={4} align="center">
              <Text variant="label">Exporting 12 cards</Text>
              <Surface asChild level="raised" padX={3} padY={1} radius="full">
                <Pressable
                  onClick={() => {
                    setExporting(false);
                  }}
                >
                  <Text variant="button">Cancel</Text>
                </Pressable>
              </Surface>
            </Inline>
          </Surface>
        </FloatingLanes.Item>
      ) : null}
    </>
  );
}
