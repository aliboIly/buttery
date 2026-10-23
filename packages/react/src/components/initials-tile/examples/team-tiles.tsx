import type { ReactElement } from "react";
import { Inline } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { InitialsTile } from "@butteryui/react";

/** Teams shown by their tiles alone, each named for screen readers. */
export function TeamTiles(): ReactElement {
  return (
    <Inline gap={2} align="center">
      {["Roastery", "Wholesale", "Cafe Floor"].map((team) => (
        <InitialsTile key={team} name={team} label={team} size="md" />
      ))}
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("R");
  await see("CF");
};
