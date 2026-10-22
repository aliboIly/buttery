import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Checkbox } from "@buttery/react";

const CARDS = ["Summer launch", "Team offsite", "Spring sale"];

/** A select-all box over a list of cards that shows mixed while only some are picked. */
export function SelectAll(): ReactElement {
  const [picked, setPicked] = useState<readonly string[]>(["Summer launch"]);
  const all = picked.length === CARDS.length;
  return (
    <Stack gap={3}>
      <Checkbox
        label="All cards"
        checked={all ? true : picked.length > 0 ? "indeterminate" : false}
        onCheckedChange={() => {
          setPicked(all ? [] : CARDS);
        }}
      />
      {CARDS.map((card) => (
        <Checkbox
          key={card}
          label={card}
          checked={picked.includes(card)}
          onCheckedChange={(next) => {
            setPicked(
              next === true
                ? [...picked, card]
                : picked.filter((name) => name !== card),
            );
          }}
        />
      ))}
      <Text variant="caption">
        {`${String(picked.length)} of ${String(CARDS.length)} cards picked`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("1 of 3 cards picked");
  await press("checkbox", "All cards");
  await see("3 of 3 cards picked");
  await press("checkbox", "Team offsite");
  await see("2 of 3 cards picked");
};
