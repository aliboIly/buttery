import {
  cx,
  useAnimationTracking,
  useLayoutAnimation,
  useMergedRefs,
} from "@buttery/core";
import { motion } from "motion/react";
import type { MotionStyle } from "motion/react";
import { useRef, useState } from "react";
import type { CssVariables } from "@buttery/core";
import type {
  CSSProperties,
  ComponentPropsWithRef,
  PointerEvent,
  ReactElement,
  ReactNode,
  Ref,
} from "react";

/** A canvas size in output pixels, such as 1600 × 900. */
export interface StageSize {
  /** Width in output pixels. */
  readonly width: number;
  /** Height in output pixels. */
  readonly height: number;
}

/** Which of the crop frame's eight handles is held. */
type Handle = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

const HANDLES: readonly Handle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

/** Props for `Stage`. */
export interface StageProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children"
> {
  /** Names the canvas for screen readers, such as "Card preview". */
  readonly label: string;
  /** The canvas size in output pixels; the canvas shows at this shape, as large as fits. */
  readonly size: StageSize;
  /** The canvas's CSS background: a color, a gradient or an image. It fades out in crop mode. */
  readonly background?: string | undefined;
  /** Crop mode: the background fades, and handles on the canvas's frame resize it. */
  readonly cropping?: boolean | undefined;
  /** Called while a crop handle is dragged, with the new size. */
  readonly onSizeChange?: ((size: StageSize) => void) | undefined;
  /** The smallest side a crop can leave, in output pixels. Defaults to 64. */
  readonly minSize?: number | undefined;
  /** The canvas element, to anchor a `FloatingToolbar` under it. */
  readonly canvasRef?: Ref<HTMLDivElement> | undefined;
  /** What's drawn on the canvas. It may overlap the canvas's edges, which clip it. */
  readonly children?: ReactNode;
}

interface Drag {
  readonly handle: Handle;
  readonly x: number;
  readonly y: number;
  readonly from: StageSize;
  readonly scale: number;
}

/**
 * The canvas an editor works on: the largest box of its shape that fits, at least 32px from the edges,
 * r12 with a card shadow. When its shape changes, it reshapes on `spring.smooth` and stays centered. In
 * crop mode its background fades out and eight handles appear on its frame a beat later; dragging one
 * resizes the canvas, its opposite edge mirroring the one held, and the canvas fits again when it's let go.
 * The width and height can also be typed, such as in a canvas `Select`'s footer.
 *
 * @example
 * <Stage label="Card preview" size={{ width: 1600, height: 900 }} background={gradientCss(lilac)} canvasRef={canvas}>
 *   <TitleCard />
 * </Stage>
 */
export function Stage({
  label,
  size,
  background,
  cropping = false,
  onSizeChange,
  minSize = 64,
  canvasRef,
  className,
  style,
  children,
  ...rest
}: StageProps): ReactElement {
  const canvas = useRef<HTMLDivElement>(null);
  const refs = useMergedRefs(canvasRef, canvas);
  const drag = useRef<Drag | null>(null);
  const frame = useRef(0);
  const [held, setHeld] = useState<{ readonly scale: number } | null>(null);
  const { layout, transition } = useLayoutAnimation("smooth");
  const tracking = useAnimationTracking();
  const ratio = size.width / size.height;

  const startDrag =
    (handle: Handle) =>
    (event: PointerEvent<HTMLSpanElement>): void => {
      const element = canvas.current;
      if (!element || event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      const scale = element.offsetWidth / size.width;
      drag.current = {
        handle,
        x: event.clientX,
        y: event.clientY,
        from: size,
        scale,
      };
      setHeld({ scale });
    };
  const moveDrag = (event: PointerEvent<HTMLSpanElement>): void => {
    const start = drag.current;
    if (!start) return;
    const dx = (event.clientX - start.x) / start.scale;
    const dy = (event.clientY - start.y) / start.scale;
    const across = start.handle.includes("e")
      ? dx
      : start.handle.includes("w")
        ? -dx
        : 0;
    const down = start.handle.includes("s")
      ? dy
      : start.handle.includes("n")
        ? -dy
        : 0;
    const next = {
      width: Math.max(minSize, Math.round(start.from.width + 2 * across)),
      height: Math.max(minSize, Math.round(start.from.height + 2 * down)),
    };
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      onSizeChange?.(next);
    });
  };
  const endDrag = (): void => {
    if (!drag.current) return;
    drag.current = null;
    setHeld(null);
  };

  const stageStyle: CSSProperties & CssVariables = {
    ...style,
    "--bt-stage-ratio": String(ratio),
  };
  const canvasStyle: MotionStyle = held
    ? {
        inlineSize: `${String(size.width * held.scale)}px`,
        blockSize: `${String(size.height * held.scale)}px`,
      }
    : {};

  return (
    <div
      {...rest}
      className={cx("bt-stage", className)}
      style={stageStyle}
      data-bt="Stage"
      data-cropping={cropping ? "" : undefined}
    >
      <motion.div
        {...tracking}
        ref={refs}
        role="img"
        aria-label={label}
        layout={layout}
        layoutDependency={
          held ? "held" : `${String(ratio)} ${String(cropping)}`
        }
        transition={transition}
        style={canvasStyle}
        data-bt-part="canvas"
      >
        <div
          data-bt-part="background"
          style={background === undefined ? undefined : { background }}
        />
        <div data-bt-part="artwork" data-bt-allow-overlap="">
          {children}
        </div>
        {cropping ? (
          <div data-bt-part="crop" data-bt-allow-overlap="" aria-hidden="true">
            {HANDLES.map((handle) => (
              <span
                key={handle}
                data-bt-part="handle"
                data-handle={handle}
                onPointerDown={startDrag(handle)}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onLostPointerCapture={endDrag}
              >
                <span data-bt-part="hit" data-bt-hit="" />
              </span>
            ))}
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
