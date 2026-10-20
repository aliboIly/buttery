import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import { Button, toast } from "@buttery/react";

/** A delete that confirms itself with a toast, with Undo in the toast and on Command or Control Z. */
export function UndoToast(): ReactElement {
  const [cards, setCards] = useState(3);
  const [deleted, setDeleted] = useState(0);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      const undo =
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        event.key.toLowerCase() === "z";
      if (!undo || deleted === 0) return;
      event.preventDefault();
      setDeleted(deleted - 1);
      setCards((count) => count + 1);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [deleted]);

  return (
    <Inline gap={3} align="center">
      <Button
        aria-disabled={cards === 0}
        onClick={() => {
          const key = /Mac|iPhone|iPad/.test(navigator.userAgent)
            ? "Command"
            : "Control";
          setCards((count) => count - 1);
          setDeleted((count) => count + 1);
          toast("Card deleted", {
            action: {
              label: "Undo",
              onAction: () => {
                setDeleted((count) => Math.max(0, count - 1));
                setCards((count) => count + 1);
              },
              altText: `Undo with ${key} Z`,
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
