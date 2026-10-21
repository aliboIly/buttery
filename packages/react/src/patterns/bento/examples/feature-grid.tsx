import type { ReactElement } from "react";
import { Center, Surface, Text } from "@buttery/core";
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

/** Two wide cards over two narrow ones, lined up on the page's columns. */
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
