import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import { Button, toast } from "@buttery/react";

/** A delete that confirms itself with a toast and offers Undo for five seconds. */
export function UndoToast(): ReactElement {
  const [cards, setCards] = useState(3);
  return (
    <Inline gap={3} align="center">
      <Button
        disabled={cards === 0}
        onClick={() => {
          setCards((count) => count - 1);
          toast("Card deleted", {
            action: {
              label: "Undo",
              onAction: () => {
                setCards((count) => count + 1);
              },
              altText: "Undo with Command Z",
            },
          });
        }}
      >
        Delete a card
      </Button>
      <Text variant="caption">
        {cards === 1 ? "1 card" : `${String(cards)} cards`}
      </Text>
    </Inline>
  );
}
