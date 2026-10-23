import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, TextField } from "@butteryui/react";

/** A gift card's title with a hint, uncontrolled: the form reads it when it's sent. */
export function GiftCardTitle(): ReactElement {
  const [title, setTitle] = useState("Happy birthday");
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const next = new FormData(event.currentTarget).get("title");
        if (typeof next === "string") setTitle(next);
      }}
    >
      <Stack gap={3}>
        <TextField
          name="title"
          label="Title"
          hint="Shown large on the gift card"
          defaultValue="Happy birthday"
          maxLength={60}
        />
        <Inline gap={3}>
          <Button type="submit">Rename</Button>
          <Text variant="body" tone="secondary" truncate>
            {`The card says ${title}`}
          </Text>
        </Inline>
      </Stack>
    </form>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await type("Title", "{selectall}Thank you");
  await press("button", "Rename");
  await see("The card says Thank you");
};
