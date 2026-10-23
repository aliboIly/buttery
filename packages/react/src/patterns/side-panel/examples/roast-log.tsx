import { useState } from "react";
import type { ReactElement } from "react";
import { Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, SidePanel } from "@butteryui/react";

const BATCHES = [
  "Batch 1, 12 kg of Guji",
  "Batch 2, 15 kg of Huila",
  "Batch 3, 12 kg of Cerrado",
  "Batch 4, 9 kg of decaf",
];

/** A roast log docked where it's placed, open from the start, its body scrolling above a pinned footer. */
export function RoastLog(): ReactElement {
  const [logged, setLogged] = useState(2);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        blockSize: "calc(var(--bt-bento-row) * 2)",
      }}
    >
      <SidePanel
        title="Today's roasts"
        defaultOpen
        footer={
          <Button
            variant="soft"
            aria-disabled={logged === BATCHES.length || undefined}
            onClick={() => {
              setLogged(logged + 1);
            }}
          >
            Log the next batch
          </Button>
        }
      >
        {BATCHES.slice(0, logged).map((batch) => (
          <Text key={batch} variant="body-sm">
            {batch}
          </Text>
        ))}
      </SidePanel>
    </div>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Batch 2, 15 kg of Huila");
  await press("button", "Log the next batch");
  await see("Batch 3, 12 kg of Cerrado");
};
