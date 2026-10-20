import { Grid3x3 } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { IconButton } from "@buttery/react";

/** A toggle that stays tinted while it's on. */
export function GridToggle(): ReactElement {
  const [visible, setVisible] = useState(true);
  return (
    <IconButton
      icon={Grid3x3}
      label={visible ? "Hide the grid" : "Show the grid"}
      aria-pressed={visible}
      onClick={() => {
        setVisible(!visible);
      }}
    />
  );
}
