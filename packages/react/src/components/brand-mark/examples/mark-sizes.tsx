import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { BrandMark, SegmentedControl } from "@buttery/react";
import type { BrandMarkSize } from "@buttery/react";

const SIZES = ["16", "24", "32", "64", "128"] as const;

type SizeName = (typeof SIZES)[number];

const PIXELS: Readonly<Record<SizeName, BrandMarkSize>> = {
  "16": 16,
  "24": 24,
  "32": 32,
  "64": 64,
  "128": 128,
};

const NOTES: Readonly<Record<SizeName, string>> = {
  "16": "16px, the favicon's drawing: three flat faces.",
  "24": "24px, in a header beside the name.",
  "32": "32px, the default.",
  "64": "64px, on a page about buttery.",
  "128": "128px, a hero's mark.",
};

/** The mark at the size picked, with the simpler drawing it switches to at 16px. */
export function MarkSizes(): ReactElement {
  const [size, setSize] = useState<SizeName>("32");
  return (
    <Stack gap={4} align="start">
      <SegmentedControl
        label="Size"
        options={SIZES}
        value={size}
        onValueChange={setSize}
      />
      <BrandMark size={PIXELS[size]} label="buttery" />
      <Text variant="body-sm" tone="secondary">
        {NOTES[size]}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "16");
  await see("16px, the favicon's drawing: three flat faces.");
  await press("radio", "128");
  await see("128px, a hero's mark.");
};
