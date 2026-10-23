import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, Inspector, SegmentedControl, Slider } from "@butteryui/react";

const FORMATS = [
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPG" },
] as const;

type Format = (typeof FORMATS)[number]["value"];

/** A small inspector: one section of rows that resets to its defaults, and a footer with the main action. */
export function ExportSettings(): ReactElement {
  const [format, setFormat] = useState<Format>("png");
  const [quality, setQuality] = useState(90);
  const [exported, setExported] = useState<string | undefined>(undefined);
  return (
    <Stack gap={3} align="start">
      <Inspector
        label="Export settings"
        footer={
          <Inspector.Footer>
            <Button
              variant="primary"
              onClick={() => {
                setExported(
                  `Exported a ${format.toUpperCase()} at ${String(quality)}%`,
                );
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
            <SegmentedControl
              label="Format"
              options={FORMATS}
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
      <Text variant="caption">{exported ?? "Nothing exported yet"}</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "JPG");
  await press("button", "Export");
  await see("Exported a JPG at 90%");
  await press("button", "Reset Image");
  await press("button", "Export");
  await see("Exported a PNG at 90%");
};
