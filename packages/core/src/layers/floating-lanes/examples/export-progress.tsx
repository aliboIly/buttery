import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import {
  FloatingLanes,
  Inline,
  Pressable,
  Surface,
  Text,
} from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

type ExportState = "idle" | "running" | "done" | "canceled";

const STATUS: Readonly<Record<ExportState, string>> = {
  idle: "Nothing exporting",
  running: "Exporting 12 orders",
  done: "Exported 12 orders",
  canceled: "Export canceled",
};

/** A notice in the bottom-end lane that stays while an export runs and can cancel it, beside a status line in the page. */
export function ExportProgress(): ReactElement {
  const [state, setState] = useState<ExportState>("idle");
  useEffect(() => {
    if (state !== "running") return undefined;
    const timer = window.setTimeout(() => {
      setState("done");
    }, 2000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [state]);
  return (
    <>
      <Inline gap={3} align="center">
        <Surface asChild level="raised" padX={4} padY={2} radius="full">
          <Pressable
            aria-disabled={state === "running"}
            onClick={() => {
              setState("running");
            }}
          >
            <Text variant="button">Export 12 orders</Text>
          </Pressable>
        </Surface>
        <Text variant="body" tone="secondary" role="status">
          {STATUS[state]}
        </Text>
      </Inline>
      {state === "running" ? (
        <FloatingLanes.Item lane="bottom-end">
          <Surface level="floating" padX={4} padY={3}>
            <Inline gap={4} align="center">
              <Text variant="label">Exporting 12 orders</Text>
              <Surface asChild level="raised" padX={3} padY={1} radius="full">
                <Pressable
                  onClick={() => {
                    setState("canceled");
                  }}
                >
                  <Text variant="button">Cancel</Text>
                </Pressable>
              </Surface>
            </Inline>
          </Surface>
        </FloatingLanes.Item>
      ) : null}
    </>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Nothing exporting");
  await press("button", "Export 12 orders");
  await see("Exporting 12 orders");
  await see("Exported 12 orders");
};
