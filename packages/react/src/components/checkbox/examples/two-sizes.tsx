import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Checkbox } from "@butteryui/react";

const EXTRAS = [
  { key: "note", label: "A handwritten note" },
  { key: "sample", label: "A sample of next month's coffee" },
  { key: "card", label: "A brewing card" },
] as const;

type Extra = (typeof EXTRAS)[number]["key"];

/** A checkbox at md over small ones for what goes in the box, which wait for the order to be packed. */
export function TwoSizes(): ReactElement {
  const [extras, setExtras] = useState<readonly Extra[]>(["card"]);
  return (
    <Stack gap={4}>
      <Checkbox label="Pack as a gift" defaultChecked />
      <Stack gap={3}>
        {EXTRAS.map((extra) => (
          <Checkbox
            key={extra.key}
            label={extra.label}
            size="sm"
            checked={extras.includes(extra.key)}
            onCheckedChange={(checked) => {
              setExtras(
                checked === true
                  ? [...extras, extra.key]
                  : extras.filter((key) => key !== extra.key),
              );
            }}
          />
        ))}
      </Stack>
      <Text variant="body-sm" tone="secondary">
        {extras.length === 1
          ? "1 extra in the box"
          : `${String(extras.length)} extras in the box`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("1 extra in the box");
  await press("checkbox", "A handwritten note");
  await see("2 extras in the box");
};
