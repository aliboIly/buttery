import { useState } from "react";
import type { ReactElement } from "react";
import { TiltPad } from "@buttery/react";
import type { TiltValue } from "@buttery/react";

/** A lean mapped to a 3D transform: ±20° each way at 1200px of perspective. */
export function CardTilt(): ReactElement {
  const [tilt, setTilt] = useState<TiltValue>({ x: 0, y: 0 });
  const transform = `perspective(1200px) rotateY(${String(tilt.x * 20)}deg) rotateX(${String(-tilt.y * 20)}deg)`;
  return (
    <>
      <TiltPad label="Lean" value={tilt} onValueChange={setTilt} />
      <output style={{ transform }}>Launch card</output>
    </>
  );
}
