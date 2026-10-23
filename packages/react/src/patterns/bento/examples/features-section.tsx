import { useState } from "react";
import type { ReactElement } from "react";
import { Center, Stack, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Bento, Page, SegmentedControl, Section } from "@butteryui/react";

type Shape = "wide" | "square" | "tall";

const RATIOS: Readonly<Record<Shape, string>> = {
  wide: "16:9",
  square: "1:1",
  tall: "9:16",
};

/** A features section on a marketing page, one card with a preview the visitor can switch. */
export function FeaturesSection(): ReactElement {
  const [shape, setShape] = useState<Shape>("wide");
  return (
    <Page>
      <Section
        size="sm"
        title="Everything a deck needs"
        body="Pick a shape, tilt a picture, and take it with you."
      >
        <Bento>
          <Bento.Card title="Any size" span={6}>
            <Center style={{ blockSize: "100%" }}>
              <Stack gap={4} align="center">
                <SegmentedControl<Shape>
                  label="Slide shape"
                  options={[
                    { value: "wide", label: "Wide" },
                    { value: "square", label: "Square" },
                    { value: "tall", label: "Tall" },
                  ]}
                  value={shape}
                  onValueChange={setShape}
                />
                <Surface level="section" padX={6} padY={4}>
                  <Text variant="title">{RATIOS[shape]}</Text>
                </Surface>
              </Stack>
            </Center>
          </Bento.Card>
          <Bento.Card title="Tilt it in 3D" span={6}>
            <Center style={{ blockSize: "100%" }}>
              <Surface level="section" padX={6} padY={4}>
                <Text variant="title">Product shot</Text>
              </Surface>
            </Center>
          </Bento.Card>
        </Bento>
      </Section>
    </Page>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "Square");
  await see("1:1");
  await press("radio", "Tall");
  await see("9:16");
};
