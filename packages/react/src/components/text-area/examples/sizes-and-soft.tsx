import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { TextArea } from "@butteryui/react";

/** A small soft note for a dense panel over a large message for a page, each line as tall as a field of its size. */
export function SizesAndSoft(): ReactElement {
  const [message, setMessage] = useState("");
  return (
    <Stack gap={4}>
      <TextArea
        label="Batch note"
        size="sm"
        variant="soft"
        rows={2}
        defaultValue="Rested two days."
      />
      <TextArea
        label="Message to the roaster"
        size="lg"
        rows={2}
        value={message}
        onValueChange={setMessage}
      />
      <Text variant="body-sm" tone="secondary">
        {message === ""
          ? "No message yet"
          : `${String(message.length)} characters`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ type, see }) => {
  await see("No message yet");
  await type("Message to the roaster", "A little lighter, please.");
  await see("25 characters");
};
