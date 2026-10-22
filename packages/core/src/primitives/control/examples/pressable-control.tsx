import { useState } from "react";
import type { ReactElement } from "react";
import { Control, Inline, Pressable, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** A pill button of your own at the button height: Surface for the look, Control for the height, Pressable for the press. */
export function PressableControl(): ReactElement {
  const [roasts, setRoasts] = useState(0);
  return (
    <Inline gap={3}>
      <Surface level="raised" radius="full" asChild>
        <Control size="button" asChild>
          <Pressable
            onClick={() => {
              setRoasts(roasts + 1);
            }}
          >
            <Text variant="button">Add a roast</Text>
          </Pressable>
        </Control>
      </Surface>
      <Text variant="body-sm">
        {roasts === 1
          ? "1 roast in the order"
          : `${String(roasts)} roasts in the order`}
      </Text>
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Add a roast");
  await see("1 roast in the order");
  await press("button", "Add a roast");
  await see("2 roasts in the order");
};
