import { useState } from "react";
import type { ReactElement } from "react";
import { FloatingLanes, Pressable, Surface, Text } from "@buttery/core";

/** A message in the bottom-center lane, where toasts go. */
export function Toast(): ReactElement {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Pressable
        onClick={() => {
          setVisible((current) => !current);
        }}
      >
        <Text variant="button">
          {visible ? "Hide the message" : "Delete the card"}
        </Text>
      </Pressable>
      {visible ? (
        <FloatingLanes.Item>
          <Surface level="floating" padX={4} padY={2} role="status">
            <Text>Card deleted</Text>
          </Surface>
        </FloatingLanes.Item>
      ) : null}
    </>
  );
}
