import type { ReactElement } from "react";
import { Center, Surface, Text } from "@buttery/core";
import { Bento } from "@buttery/react";

/** A tall card two rows high beside two short ones. */
export function TallCard(): ReactElement {
  return (
    <Bento>
      <Bento.Card title="Made for stories" span={4} rows={2}>
        <Center style={{ blockSize: "100%" }}>
          <Surface level="section" padX={4} padY={8}>
            <Text variant="title">9:16</Text>
          </Surface>
        </Center>
      </Bento.Card>
      <Bento.Card title="Wide for talks" span={8}>
        <Center style={{ blockSize: "100%" }}>
          <Text variant="title">16:9</Text>
        </Center>
      </Bento.Card>
      <Bento.Card title="Square for posts" span={8}>
        <Center style={{ blockSize: "100%" }}>
          <Text variant="title">1:1</Text>
        </Center>
      </Bento.Card>
    </Bento>
  );
}
