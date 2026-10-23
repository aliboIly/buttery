import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, TextArea } from "@buttery/react";

/** A larger feedback box that starts at five lines and stops growing at twelve, read once the form is sent. */
export function Feedback(): ReactElement {
  const [sent, setSent] = useState("");
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const feedback = new FormData(event.currentTarget).get("feedback");
        setSent(typeof feedback === "string" ? feedback : "");
      }}
    >
      <Stack gap={3}>
        <TextArea
          name="feedback"
          label="What could be better?"
          rows={5}
          maxRows={12}
        />
        <Inline gap={3}>
          <Button type="submit" variant="primary">
            Send
          </Button>
          {sent === "" ? null : (
            <Text variant="body" tone="secondary" truncate>
              {`Sent: ${sent}`}
            </Text>
          )}
        </Inline>
      </Stack>
    </form>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await type("What could be better?", "More decaf, please");
  await press("button", "Send");
  await see("Sent: More decaf, please");
};
