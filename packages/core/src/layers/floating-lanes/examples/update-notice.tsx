import { useState } from "react";
import type { ReactElement } from "react";
import { FloatingLanes, Pressable, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** A notice in the top-end lane that the user can put away, with a status line in the page that says the same. */
export function UpdateNotice(): ReactElement {
  const [visible, setVisible] = useState(false);
  return (
    <Stack gap={3} align="start">
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Pressable
          onClick={() => {
            setVisible(!visible);
          }}
        >
          <Text variant="button">
            {visible ? "Hide the update notice" : "Show the update notice"}
          </Text>
        </Pressable>
      </Surface>
      <Text variant="body" tone="secondary" role="status">
        {visible ? "An update is ready to install" : "No update waiting"}
      </Text>
      {visible ? (
        <FloatingLanes.Item lane="top-end">
          <Surface level="floating" pad={4}>
            <Stack gap={3} align="start">
              <Stack gap={1}>
                <Text variant="label">Update ready</Text>
                <Text variant="caption">
                  Restart to get the new export options.
                </Text>
              </Stack>
              <Surface asChild level="raised" padX={4} padY={2} radius="full">
                <Pressable
                  onClick={() => {
                    setVisible(false);
                  }}
                >
                  <Text variant="button">Later</Text>
                </Pressable>
              </Surface>
            </Stack>
          </Surface>
        </FloatingLanes.Item>
      ) : null}
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Show the update notice");
  await see("An update is ready to install");
  await press("button", "Hide the update notice");
  await see("No update waiting");
};
