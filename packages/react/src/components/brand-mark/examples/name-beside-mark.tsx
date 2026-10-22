import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { BrandMark } from "@buttery/react";

/** The mark beside buttery's written name, which says what it shows, so the mark itself stays hidden from screen readers. */
export function NameBesideMark(): ReactElement {
  return (
    <Inline gap={2} align="center">
      <BrandMark size={24} />
      <Text variant="title">buttery</Text>
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("buttery");
};
