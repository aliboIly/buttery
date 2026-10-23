import { Copy } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, Inspector, Slider, SplitButton } from "@butteryui/react";

/** An inspector's footer: Copy beside a split Export whose menu holds the other formats. */
export function ExportFooter(): ReactElement {
  const [quality, setQuality] = useState(90);
  const [status, setStatus] = useState("Not exported yet");
  return (
    <Inspector
      label="Slide settings"
      footer={
        <Inspector.Footer>
          <Button
            iconStart={Copy}
            onClick={() => {
              setStatus("Copied the slide");
            }}
          >
            Copy
          </Button>
          <SplitButton
            menuLabel="More export options"
            onClick={() => {
              setStatus(`Exported a PNG at ${String(quality)}%`);
            }}
            items={[
              {
                label: "Export as JPG",
                onSelect: () => {
                  setStatus(`Exported a JPG at ${String(quality)}%`);
                },
              },
              {
                label: "Export as PDF",
                onSelect: () => {
                  setStatus("Exported a PDF");
                },
              },
            ]}
          >
            Export PNG
          </SplitButton>
        </Inspector.Footer>
      }
    >
      <Inspector.Section title="Export">
        <Inspector.Row>
          <Slider
            label="Quality"
            format="%"
            min={10}
            max={100}
            resetValue={90}
            value={quality}
            onValueChange={setQuality}
          />
        </Inspector.Row>
        <Inspector.Row label="Last export">
          <Text tone="secondary" truncate>
            {status}
          </Text>
        </Inspector.Row>
      </Inspector.Section>
    </Inspector>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "More export options");
  await press("menuitem", "Export as JPG");
  await see("Exported a JPG at 90%");
};
