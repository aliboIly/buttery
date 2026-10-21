import { useState } from "react";
import type { ReactElement } from "react";
import { ColorPicker } from "@buttery/react";

/** Any color for a backdrop, kept in state as `#rrggbb`. */
export function BackdropColor(): ReactElement {
  const [color, setColor] = useState("#7c9cf5");
  return (
    <ColorPicker label="Backdrop" value={color} onValueChange={setColor} />
  );
}
