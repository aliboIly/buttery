import { useState } from "react";
import type { ReactElement } from "react";
import { Center, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import {
  Bento,
  ExpandableCard,
  Page,
  SegmentedControl,
  Section,
} from "@buttery/react";

type Lean = "flat" | "toward";

/** A features section whose large card opens into a dialog with a setting to try, beside a plain card. */
export function FeaturesSection(): ReactElement {
  const [lean, setLean] = useState<Lean>("flat");
  return (
    <Page>
      <Section size="sm" title="Made to be shared">
        <Bento>
          <ExpandableCard
            title="Lean it in 3D"
            span={8}
            detail={
              <Stack gap={4}>
                <Text variant="body-lg">
                  Steer the card toward you, up to 20 degrees each way. The
                  export draws the same turn, shadow and all.
                </Text>
                <SegmentedControl<Lean>
                  label="Lean"
                  options={[
                    { value: "flat", label: "Flat" },
                    { value: "toward", label: "Toward you" },
                  ]}
                  value={lean}
                  onValueChange={setLean}
                />
                <Text variant="body" tone="secondary">
                  {lean === "flat" ? "Lying flat" : "Leaning 12° toward you"}
                </Text>
              </Stack>
            }
          >
            <Center style={{ blockSize: "100%" }}>
              <Surface level="section" padX={6} padY={4}>
                <Text variant="title">Launch card</Text>
              </Surface>
            </Center>
          </ExpandableCard>
          <Bento.Card title="Any size" span={4}>
            <Center style={{ blockSize: "100%" }}>
              <Text variant="title">16:9</Text>
            </Center>
          </Bento.Card>
        </Bento>
      </Section>
    </Page>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Open Lean it in 3D");
  await press("radio", "Toward you");
  await see("Leaning 12° toward you");
  await press("button", "Close");
};
