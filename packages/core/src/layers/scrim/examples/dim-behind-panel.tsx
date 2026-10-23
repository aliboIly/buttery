import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import {
  Center,
  Inline,
  Layer,
  Pressable,
  Scrim,
  Surface,
  Text,
} from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

/** A dim scrim first inside a modal layer, under a panel that holds the page while a price list applies. */
export function DimBehindPanel(): ReactElement {
  const [state, setState] = useState<"idle" | "applying" | "applied">("idle");
  useEffect(() => {
    if (state !== "applying") return undefined;
    const timer = window.setTimeout(() => {
      setState("applied");
    }, 1500);
    return () => {
      window.clearTimeout(timer);
    };
  }, [state]);
  return (
    <>
      <Inline gap={3} align="center">
        <Surface asChild level="raised" padX={4} padY={2} radius="full">
          <Pressable
            aria-disabled={state === "applying"}
            onClick={() => {
              setState("applying");
            }}
          >
            <Text variant="button">Apply the holiday prices</Text>
          </Pressable>
        </Surface>
        <Text variant="body" tone="secondary">
          {state === "applied"
            ? "Holiday prices applied to 8 cafés"
            : "8 cafés on this price list"}
        </Text>
      </Inline>
      {state === "applying" ? (
        <Layer band="modal">
          <Scrim />
          <Center pad={4} style={{ blockSize: "100%" }}>
            <Surface level="dialog" padX={6} padY={4} role="status">
              <Text variant="label">
                Applying the holiday prices to 8 cafés…
              </Text>
            </Surface>
          </Center>
        </Layer>
      ) : null}
    </>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Apply the holiday prices");
  await see("Applying the holiday prices to 8 cafés…");
  await see("Holiday prices applied to 8 cafés");
};
