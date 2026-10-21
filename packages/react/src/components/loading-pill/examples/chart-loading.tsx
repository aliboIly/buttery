import type { ReactElement } from "react";
import { Center, Surface } from "@buttery/core";
import { LoadingPill } from "@buttery/react";

/** A pill in the middle of a chart's box while its numbers load. */
export function ChartLoading(): ReactElement {
  return (
    <Surface level="card" pad={4}>
      <Center style={{ blockSize: "var(--bt-bento-row)" }}>
        <LoadingPill label="Loading revenue" />
      </Center>
    </Surface>
  );
}
