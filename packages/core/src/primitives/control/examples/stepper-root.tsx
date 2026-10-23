import { useState } from "react";
import type { ReactElement } from "react";
import { Control, Icon, Pressable, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Minus, Plus } from "lucide-react";

/** A stepper built from public parts: a raised Control holding two 28px pressable Controls and the count between them. */
export function StepperRoot(): ReactElement {
  const [cups, setCups] = useState(2);
  return (
    <Surface level="raised" radius="full" asChild>
      <Control size="control" role="group" aria-label="Cups">
        <Control size="sm" asChild>
          <Pressable
            aria-label="One cup fewer"
            aria-disabled={cups === 1 || undefined}
            onClick={() => {
              setCups(cups - 1);
            }}
          >
            <Icon icon={Minus} />
          </Pressable>
        </Control>
        <Text variant="label">{`${String(cups)} cups`}</Text>
        <Control size="sm" asChild>
          <Pressable
            aria-label="One cup more"
            onClick={() => {
              setCups(cups + 1);
            }}
          >
            <Icon icon={Plus} />
          </Pressable>
        </Control>
      </Control>
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "One cup more");
  await see("3 cups");
  await press("button", "One cup fewer");
  await see("2 cups");
};
