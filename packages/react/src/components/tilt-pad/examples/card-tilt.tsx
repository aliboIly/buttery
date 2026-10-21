import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Surface, Text } from "@buttery/core";
import { TiltPad } from "@buttery/react";
import type { TiltValue } from "@buttery/react";

/** A lean mapped to a card's 3D transform: ±20° each way at 1200px of perspective. */
export function CardTilt(): ReactElement {
  const [tilt, setTilt] = useState<TiltValue>({ x: 0, y: 0 });
  const transform = `perspective(1200px) rotateY(${String(tilt.x * 20)}deg) rotateX(${String(-tilt.y * 20)}deg)`;
  return (
    <Inline gap={8} align="center">
      <TiltPad label="Lean" value={tilt} onValueChange={setTilt} />
      <Surface level="card" pad={6} asChild style={{ transform }}>
        <output aria-label="Card preview">
          <Text variant="title">Launch card</Text>
        </output>
      </Surface>
    </Inline>
  );
}
