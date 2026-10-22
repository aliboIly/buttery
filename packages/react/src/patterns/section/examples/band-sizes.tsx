import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Section, SegmentedControl } from "@buttery/react";

type Size = "sm" | "md" | "lg";
type Tone = "default" | "muted";

const ROOM: Readonly<Record<Size, string>> = {
  sm: "64px above and below",
  md: "96px above and below",
  lg: "128px above and below",
};

const GROUND: Readonly<Record<Tone, string>> = {
  default: "on the page's surface",
  muted: "on the app background",
};

/** The three sizes and two tones of a band: pick one of each and the band's room and background follow. */
export function BandSizes(): ReactElement {
  const [size, setSize] = useState<Size>("md");
  const [tone, setTone] = useState<Tone>("default");
  return (
    <Stack gap={4}>
      <Inline gap={2} wrap>
        <SegmentedControl<Size>
          label="Size"
          options={[
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
          ]}
          value={size}
          onValueChange={setSize}
        />
        <SegmentedControl<Tone>
          label="Tone"
          options={[
            { value: "default", label: "Default" },
            { value: "muted", label: "Muted" },
          ]}
          value={tone}
          onValueChange={setTone}
        />
      </Inline>
      <Section
        size={size}
        tone={tone}
        title="Roasted on Mondays"
        body={`${ROOM[size]}, ${GROUND[tone]}.`}
      />
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("96px above and below, on the page's surface.");
  await press("radio", "Large");
  await see("128px above and below, on the page's surface.");
  await press("radio", "Muted");
  await see("128px above and below, on the app background.");
};
