import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import { InitialsTile } from "@buttery/react";

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
