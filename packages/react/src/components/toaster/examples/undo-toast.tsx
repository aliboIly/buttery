import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, toast } from "@butteryui/react";

/** A delete that confirms itself with a toast, with Undo in the toast and on Command or Control Z. */
export function UndoToast(): ReactElement {
  const [slides, setSlides] = useState(3);
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
      setSlides((count) => count + 1);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [deleted]);

  return (
    <Inline gap={3} align="center">
      <Button
        aria-disabled={slides === 0}
        onClick={() => {
          const key = /Mac|iPhone|iPad/.test(navigator.userAgent)
            ? "Command"
            : "Control";
          setSlides((count) => count - 1);
          setDeleted((count) => count + 1);
          toast("Slide deleted", {
            action: {
              label: "Undo",
              onAction: () => {
                setDeleted((count) => Math.max(0, count - 1));
                setSlides((count) => count + 1);
              },
              altText: `Undo with ${key} Z`,
            },
          });
        }}
      >
        Delete a slide
      </Button>
      <Text variant="caption">
        {slides === 1 ? "1 slide" : `${String(slides)} slides`}
      </Text>
    </Inline>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Delete a slide");
  await see("2 slides");
  await press("button", "Undo");
  await see("3 slides");
};
