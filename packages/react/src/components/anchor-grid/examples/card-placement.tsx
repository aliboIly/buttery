import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Surface, Text } from "@buttery/core";
import { AnchorGrid, buttery } from "@buttery/react";
import type { Anchor } from "@buttery/react";

const PLACE: Readonly<Record<Anchor, string>> = {
  "top-left": "start start",
  top: "start center",
  "top-right": "start end",
  left: "center start",
  center: "center center",
  right: "center end",
  "bottom-left": "end start",
  bottom: "end center",
  "bottom-right": "end end",
};

/** An anchor mapped to where a card sits in its frame, through CSS `place-items`, gliding there on `spring.smooth`. */
export function CardPlacement(): ReactElement {
  const [anchor, setAnchor] = useState<Anchor>("center");
  return (
    <Inline gap={8} align="center">
      <AnchorGrid label="Anchor" value={anchor} onValueChange={setAnchor} />
      <Surface
        level="card"
        pad={3}
        asChild
        style={{
          display: "grid",
          placeItems: PLACE[anchor],
          inlineSize: "var(--bt-w-row-control)",
          aspectRatio: "16 / 9",
        }}
      >
        <output aria-label="Card placement">
          <buttery.span
            surface="section"
            pad={2}
            layout
            layoutDependency={anchor}
          >
            <Text variant="badge">Launch card</Text>
          </buttery.span>
        </output>
      </Surface>
    </Inline>
  );
}
