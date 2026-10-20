import { Grid3x3 } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { IconButton } from "@buttery/react";

/** A toggle that stays tinted while it's on; its name stays put and aria-pressed says whether it's on. */
export function GridToggle(): ReactElement {
  const [visible, setVisible] = useState(true);
  return (
    <IconButton
      icon={Grid3x3}
      label="Grid"
      aria-pressed={visible}
      onClick={() => {
        setVisible(!visible);
      }}
    />
  );
}
