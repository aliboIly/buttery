import { useState } from "react";
import type { ReactElement } from "react";
import { ColorDot } from "@buttery/react";

/** One color, kept in state as `#rrggbb`. */
export function SolidFill(): ReactElement {
  const [fill, setFill] = useState("#a5b4fc");
  return <ColorDot label="Fill" value={fill} onValueChange={setFill} />;
}
