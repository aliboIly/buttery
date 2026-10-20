import { useState } from "react";
import type { ReactElement } from "react";
import {
  FloatingLanes,
  Presence,
  Pressable,
  Surface,
  Text,
} from "@buttery/core";

/** A message in the toast lane that slides up as it arrives and fades as it leaves. */
export function ToastMessage(): ReactElement {
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
            {visible ? "Dismiss the message" : "Export the card"}
          </Text>
        </Pressable>
      </Surface>
      <FloatingLanes.Item>
        <Presence show={visible} preset="toast" role="status">
          <Surface level="floating" padX={4} padY={2}>
            <Text>Card exported</Text>
          </Surface>
        </Presence>
      </FloatingLanes.Item>
    </>
  );
}
