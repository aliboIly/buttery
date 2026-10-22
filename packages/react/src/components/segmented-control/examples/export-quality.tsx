import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Field, SegmentedControl } from "@buttery/react";

type Format = "png" | "jpg" | "webp";
type Quality = "Low" | "High";

/** A disabled option and a disabled control: WebP isn't on this plan, and quality only applies to JPG. */
export function ExportQuality(): ReactElement {
  const [format, setFormat] = useState<Format>("png");
  const [quality, setQuality] = useState<Quality>("High");
  return (
    <Stack gap={4} align="start">
      <Field label="Format" hint="WebP comes with the Studio plan.">
        {(control) => (
          <SegmentedControl<Format>
            {...control}
            label="Format"
            options={[
              { value: "png", label: "PNG" },
              { value: "jpg", label: "JPG" },
              { value: "webp", label: "WebP", disabled: true },
            ]}
            value={format}
            onValueChange={setFormat}
          />
        )}
      </Field>
      <Field label="Quality">
        {(control) => (
          <SegmentedControl<Quality>
            {...control}
            label="Quality"
            options={["Low", "High"]}
            value={quality}
            onValueChange={setQuality}
            disabled={format === "png"}
          />
        )}
      </Field>
      <Text variant="body-sm" tone="secondary">
        {format === "png"
          ? "PNG keeps every pixel, so quality doesn't apply"
          : `JPG at ${quality.toLowerCase()} quality`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("PNG keeps every pixel, so quality doesn't apply");
  await press("radio", "JPG");
  await see("JPG at high quality");
  await press("radio", "Low");
  await see("JPG at low quality");
};
