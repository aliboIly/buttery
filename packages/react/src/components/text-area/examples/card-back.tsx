import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { TextArea } from "@buttery/react";

/** The message for the back of a card, typed beside a preview of the card that shows it as it's written. */
export function CardBack(): ReactElement {
  const [message, setMessage] = useState("Thanks for shopping with us.");
  return (
    <Grid columns={{ base: 1, md: 2 }} gap={6}>
      <TextArea
        label="Back of the card"
        rows={4}
        value={message}
        onValueChange={setMessage}
      />
      <Surface level="card" pad={6} asChild>
        <output aria-label="Card preview">
          <Text variant="body">{message}</Text>
        </output>
      </Surface>
    </Grid>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ type, see }) => {
  await type(
    "Back of the card",
    "{selectall}See you at the market on Saturday.",
  );
  await see("See you at the market on Saturday.");
};
