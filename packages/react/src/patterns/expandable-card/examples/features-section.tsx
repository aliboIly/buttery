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

type Tilt = "flat" | "toward";

/** A features section whose large card opens into a dialog with a setting to try, beside a plain card. */
export function FeaturesSection(): ReactElement {
  const [tilt, setTilt] = useState<Tilt>("flat");
  return (
    <Page>
      <Section size="sm" title="Made to be presented">
        <Bento>
          <ExpandableCard
            title="Tilt it in 3D"
            span={8}
            detail={
              <Stack gap={4}>
                <Text variant="body-lg">
                  Tip the picture toward you, up to 20 degrees each way. The PDF
                  draws the same turn, shadow and all.
                </Text>
                <SegmentedControl<Tilt>
                  label="Tilt"
                  options={[
                    { value: "flat", label: "Flat" },
                    { value: "toward", label: "Toward you" },
                  ]}
                  value={tilt}
                  onValueChange={setTilt}
                />
                <Text variant="body" tone="secondary">
                  {tilt === "flat" ? "Lying flat" : "Tilted 12° toward you"}
                </Text>
              </Stack>
            }
          >
            <Center style={{ blockSize: "100%" }}>
              <Surface level="section" padX={6} padY={4}>
                <Text variant="title">Product shot</Text>
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
  await press("button", "Open Tilt it in 3D");
  await press("radio", "Toward you");
  await see("Tilted 12° toward you");
  await press("button", "Close");
};
