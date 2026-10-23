import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
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

/** An anchor mapped to where a title sits on its slide, through CSS `place-items`, gliding there on `spring.smooth`. */
export function TitlePlacement(): ReactElement {
  const [anchor, setAnchor] = useState<Anchor>("center");
  return (
    <Inline gap={8} align="center">
      <AnchorGrid label="Anchor" value={anchor} onValueChange={setAnchor} />
      <Stack gap={2}>
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
          <output aria-label="Title placement">
            <buttery.span
              surface="section"
              pad={2}
              layout
              layoutDependency={anchor}
            >
              <Text variant="badge">Quarterly review</Text>
            </buttery.span>
          </output>
        </Surface>
        <Text variant="caption">{`Anchored ${anchor.replace("-", " ")}`}</Text>
      </Stack>
    </Inline>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await press("radio", "Top left");
  await see("Anchored top left");
  await key("ArrowRight");
  await see("Anchored top");
};
