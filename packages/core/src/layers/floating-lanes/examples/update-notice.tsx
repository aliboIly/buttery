import { useState } from "react";
import type { ReactElement } from "react";
import {
  FloatingLanes,
  Pressable,
  Stack,
  Surface,
  Text,
} from "@buttery/core";

/** A notice in the top-end lane that the user can put away. */
export function UpdateNotice(): ReactElement {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Pressable
          aria-pressed={visible}
          onClick={() => {
            setVisible((current) => !current);
          }}
        >
          <Text variant="button">
            {visible ? "Hide the update notice" : "Show the update notice"}
          </Text>
        </Pressable>
      </Surface>
      {visible ? (
        <FloatingLanes.Item lane="top-end">
          <Surface level="floating" pad={4} role="status">
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
    </>
  );
}
