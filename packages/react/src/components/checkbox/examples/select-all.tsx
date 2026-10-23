import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Checkbox } from "@buttery/react";

const CAFES = ["Blue Door Café", "Little Fern Coffee", "The Reading Room"];

/** A select-all box over a list of cafés that shows mixed while only some are picked. */
export function SelectAll(): ReactElement {
  const [picked, setPicked] = useState<readonly string[]>(["Blue Door Café"]);
  const all = picked.length === CAFES.length;
  return (
    <Stack gap={3}>
      <Checkbox
        label="All cafés"
        checked={all ? true : picked.length > 0 ? "indeterminate" : false}
        onCheckedChange={() => {
          setPicked(all ? [] : CAFES);
        }}
      />
      {CAFES.map((cafe) => (
        <Checkbox
          key={cafe}
          label={cafe}
          checked={picked.includes(cafe)}
          onCheckedChange={(next) => {
            setPicked(
              next === true
                ? [...picked, cafe]
                : picked.filter((name) => name !== cafe),
            );
          }}
        />
      ))}
      <Text variant="caption">
        {`${String(picked.length)} of ${String(CAFES.length)} cafés picked`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("1 of 3 cafés picked");
  await press("checkbox", "All cafés");
  await see("3 of 3 cafés picked");
  await press("checkbox", "Little Fern Coffee");
  await see("2 of 3 cafés picked");
};
