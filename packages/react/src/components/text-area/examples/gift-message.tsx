import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { TextArea } from "@butteryui/react";

const LIMIT = 60;

/** An error under the box once the message runs past its limit, read out as it appears. */
export function GiftMessage(): ReactElement {
  const [message, setMessage] = useState("");
  const over = message.length - LIMIT;
  return (
    <TextArea
      label="Gift message"
      hint={`Printed on the card in the box, up to ${String(LIMIT)} characters.`}
      value={message}
      onValueChange={setMessage}
      error={
        over > 0
          ? `That's ${String(over)} ${over === 1 ? "character" : "characters"} too many.`
          : undefined
      }
    />
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ type, see }) => {
  await type(
    "Gift message",
    "Happy birthday, Sam! Enjoy the beans and the new mug from all of us here.",
  );
  await see("That's 13 characters too many.");
};
