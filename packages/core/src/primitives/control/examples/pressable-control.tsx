import type { ReactElement } from "react";
import { Control, Pressable, Surface } from "@buttery/core";

/** A pill button of your own at the button height: Surface for the look, Control for the height, Pressable for the press. */
export function PressableControl(): ReactElement {
  return (
    <Surface level="raised" radius="full" asChild>
      <Control size="button" asChild>
        <Pressable>Add a roast</Pressable>
      </Control>
    </Surface>
  );
}
