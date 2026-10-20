import type { ReactElement, RefObject } from "react";
import { FloatingToolbar } from "@buttery/react";

/** Crop mode's bar under the crop frame: the size, then Reset, Cancel and Apply. */
export function CropBar({
  frame,
  width,
  height,
  changed,
  onReset,
  onCancel,
  onApply,
}: {
  readonly frame: RefObject<HTMLElement | null>;
  readonly width: number;
  readonly height: number;
  readonly changed: boolean;
  readonly onReset: () => void;
  readonly onCancel: () => void;
  readonly onApply: () => void;
}): ReactElement {
  return (
    <FloatingToolbar
      anchor={frame}
      label="Crop"
      meta={`${String(width)} × ${String(height)}`}
      delayed
    >
      <FloatingToolbar.Button
        variant="ghost"
        aria-disabled={!changed}
        onClick={onReset}
      >
        Reset
      </FloatingToolbar.Button>
      <FloatingToolbar.Button onClick={onCancel}>Cancel</FloatingToolbar.Button>
      <FloatingToolbar.Button variant="primary" onClick={onApply}>
        Apply crop
      </FloatingToolbar.Button>
    </FloatingToolbar>
  );
}
