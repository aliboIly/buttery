import { useState } from "react";
import type { ReactElement } from "react";
import { Button, Inspector, SegmentedControl, Slider } from "@buttery/react";

type Format = "png" | "jpg";

/** A small inspector: one section of rows that resets, and a footer with the main action. */
export function ExportSettings({
  onExport,
}: {
  readonly onExport: (settings: { format: Format; quality: number }) => void;
}): ReactElement {
  const [format, setFormat] = useState<Format>("png");
  const [quality, setQuality] = useState(90);
  return (
    <Inspector
      label="Export settings"
      footer={
        <Inspector.Footer>
          <Button
            variant="primary"
            onClick={() => {
              onExport({ format, quality });
            }}
          >
            Export
          </Button>
        </Inspector.Footer>
      }
    >
      <Inspector.Section
        title="Image"
        resettable={format !== "png" || quality !== 90}
        onReset={() => {
          setFormat("png");
          setQuality(90);
        }}
      >
        <Inspector.Row label="Format">
          <SegmentedControl<Format>
            label="Format"
            options={["png", "jpg"]}
            value={format}
            onValueChange={setFormat}
          />
        </Inspector.Row>
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
      </Inspector.Section>
    </Inspector>
  );
}
