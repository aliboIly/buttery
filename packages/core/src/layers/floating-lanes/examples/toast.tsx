import { VisuallyHidden } from "radix-ui";
import { useState } from "react";
import type { ReactElement } from "react";
import { FloatingLanes, Pressable, Surface, Text } from "@buttery/core";

/**
 * A message in the bottom-center lane, where toasts go. Screen readers hear it from a status region that
 * stays mounted, since the toast itself comes and goes.
 */
export function Toast(): ReactElement {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Pressable
          onClick={() => {
            setVisible((current) => !current);
          }}
        >
          <Text variant="button">
            {visible ? "Hide the message" : "Delete the card"}
          </Text>
        </Pressable>
      </Surface>
      <VisuallyHidden.Root role="status">
        {visible ? "Card deleted" : ""}
      </VisuallyHidden.Root>
      {visible ? (
        <FloatingLanes.Item>
          <Surface level="floating" padX={4} padY={2}>
            <Text>Card deleted</Text>
          </Surface>
        </FloatingLanes.Item>
      ) : null}
    </>
  );
}
