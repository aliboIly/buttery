import type { ReactElement } from "react";
import { Center, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Bento } from "@buttery/react";

function Picture({ label }: { readonly label: string }): ReactElement {
  return (
    <Center style={{ blockSize: "100%" }}>
      <Surface level="section" padX={6} padY={4}>
        <Text variant="title">{label}</Text>
      </Surface>
    </Center>
  );
}

/** A wide card beside a narrow one, lined up on the page's 12 columns. */
export function FeatureGrid(): ReactElement {
  return (
    <Bento>
      <Bento.Card title="Lean it in 3D" span={8}>
        <Picture label="Launch card" />
      </Bento.Card>
      <Bento.Card title="Any size" span={4}>
        <Picture label="16:9" />
      </Bento.Card>
    </Bento>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Lean it in 3D");
  await see("16:9");
};
