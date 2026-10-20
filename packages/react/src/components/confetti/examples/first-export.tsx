import { useState } from "react";
import type { ReactElement } from "react";
import { Pressable, Surface, Text } from "@buttery/core";
import { celebrate } from "@buttery/react";

/** Celebrates the first export and none after it. */
export function FirstExport(): ReactElement {
  const [exports, setExports] = useState(0);
  return (
    <Surface asChild level="raised" padX={4} padY={2} radius="full">
      <Pressable
        onClick={(event) => {
          if (exports === 0) celebrate(event.currentTarget);
          setExports((count) => count + 1);
        }}
      >
        <Text variant="button">
          {exports === 0 ? "Export the card" : `Exported ${String(exports)}×`}
        </Text>
      </Pressable>
    </Surface>
  );
}
