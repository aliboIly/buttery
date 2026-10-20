import { useState } from "react";
import type { ReactElement } from "react";
import { Stack } from "@buttery/core";
import { Checkbox } from "@buttery/react";

const CARDS = ["Summer launch", "Team offsite", "Spring sale"];

/** A select-all box that shows mixed while only some cards are picked. */
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
    </Stack>
  );
}
