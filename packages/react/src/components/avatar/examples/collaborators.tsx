import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import { Avatar } from "@buttery/react";

/** Who's working on an order, by avatar alone: each is named for screen readers, initials standing in for pictures. */
export function Collaborators(): ReactElement {
  return (
    <Inline gap={1} align="center">
      <Avatar name="Mira Okafor" label="Mira Okafor" />
      <Avatar name="Tomas Reyes" label="Tomas Reyes" />
      <Avatar name="Ines Vale" label="Ines Vale" />
    </Inline>
  );
}
