import type { ReactElement } from "react";
import { Center, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Bento } from "@butteryui/react";
import type { BentoCardVariant } from "@butteryui/react";

const CARDS: readonly {
  readonly title: string;
  readonly variant: BentoCardVariant;
  readonly span: 4 | 6;
}[] = [
  { title: "Roasted to order", variant: "elevated", span: 4 },
  { title: "Ships the same week", variant: "outline", span: 4 },
  { title: "Pause any time", variant: "soft", span: 4 },
  { title: "Gift a subscription", variant: "tinted", span: 6 },
  { title: "Brew guides inside", variant: "plain", span: 6 },
];

/** The five card variants in one bento: elevated, outline, soft, tinted and plain. */
export function CardVariants(): ReactElement {
  return (
    <Bento>
      {CARDS.map((card) => (
        <Bento.Card
          key={card.variant}
          title={card.title}
          span={card.span}
          variant={card.variant}
        >
          <Center style={{ blockSize: "100%" }}>
            <Surface level="card" padX={6} padY={4}>
              <Text variant="title">{card.variant}</Text>
            </Surface>
          </Center>
        </Bento.Card>
      ))}
    </Bento>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("Gift a subscription");
  await see("tinted");
  await see("Brew guides inside");
};
