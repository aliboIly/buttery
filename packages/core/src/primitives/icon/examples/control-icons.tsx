import type { ReactElement } from "react";
import { CircleHelp, Redo2, Undo2 } from "lucide-react";
import { Icon, Inline } from "@buttery/core";

/** Header icons at the control size. */
export function ControlIcons(): ReactElement {
  return (
    <Inline gap={4}>
      <Icon icon={Undo2} label="Undo" />
      <Icon icon={Redo2} label="Redo" />
      <Icon icon={CircleHelp} label="Help" />
    </Inline>
  );
}
