import { useRef, useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, Dialog } from "@butteryui/react";

const ROASTS = ["Lantern Hill", "Harbor Fog", "Ironwood Night"];

/** One dialog for a whole list, opened from state: deleting a roast hands focus to the next roast's Delete. */
export function DeleteFromList(): ReactElement {
  const [roasts, setRoasts] = useState(ROASTS);
  const [target, setTarget] = useState("");
  const [open, setOpen] = useState(false);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const heading = useRef<HTMLHeadingElement>(null);
  const handoff = useRef<{ readonly to: string | null } | null>(null);

  const remove = (): void => {
    const at = roasts.indexOf(target);
    handoff.current = { to: roasts[at + 1] ?? roasts[at - 1] ?? null };
    setRoasts(roasts.filter((roast) => roast !== target));
  };

  return (
    <Stack gap={3}>
      <Text variant="title-sm" asChild>
        <h3 ref={heading} tabIndex={-1}>
          {`${String(roasts.length)} roasts on the shelf`}
        </h3>
      </Text>
      <Stack gap={2} asChild>
        <ul role="list">
          {roasts.map((roast) => (
            <li key={roast}>
              <Inline gap={3} align="center" justify="between">
                <Text variant="body">{roast}</Text>
                <Button
                  ref={(element) => {
                    if (element) buttons.current.set(roast, element);
                    else buttons.current.delete(roast);
                  }}
                  variant="soft"
                  size="sm"
                  aria-label={`Delete ${roast}`}
                  onClick={() => {
                    setTarget(roast);
                    setOpen(true);
                  }}
                >
                  Delete
                </Button>
              </Inline>
            </li>
          ))}
        </ul>
      </Stack>
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content
          onCloseAutoFocus={(event) => {
            const pending = handoff.current;
            if (!pending) return;
            handoff.current = null;
            event.preventDefault();
            const button =
              pending.to === null ? undefined : buttons.current.get(pending.to);
            (button ?? heading.current)?.focus();
          }}
        >
          <Dialog.Text
            title="Delete this roast?"
            body={`${target} comes off the shelf for good.`}
          />
          <Dialog.Actions>
            <Dialog.Close asChild>
              <Button variant="soft" size="cta" shape="rounded">
                Keep it
              </Button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Button
                variant="primary"
                size="cta"
                shape="rounded"
                onClick={remove}
              >
                Delete
              </Button>
            </Dialog.Close>
          </Dialog.Actions>
        </Dialog.Content>
      </Dialog>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Delete Harbor Fog");
  await see("Harbor Fog comes off the shelf for good.");
  await press("button", "Keep it");
  await see("3 roasts on the shelf");
  await press("button", "Delete Harbor Fog");
  await press("button", "Delete");
  await see("2 roasts on the shelf");
};
