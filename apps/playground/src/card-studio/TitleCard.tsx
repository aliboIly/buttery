import { use, useLayoutEffect } from "react";
import type { CSSProperties, ReactElement } from "react";
import {
  AnimationTrackingContext,
  spring,
  trackAnimation,
  useAnimationTracking,
  useMotionPreference,
} from "@buttery/core";
import { useStageLayout } from "@buttery/react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import {
  FINISH_COLORS,
  LEAN_DEGREES,
  anchorShift,
  cardShadow,
} from "./geometry.ts";
import type { Card } from "./state.ts";

/** The studio's own variables, read by its stylesheet. */
type StudioVariables = Readonly<Record<`--cs-${string}`, string>>;

/**
 * The title card on the canvas. While a control is dragged it follows in the same frame; other changes,
 * such as a reset, glide on spring.smooth, and a new anchor glides it there. At a smaller scale it still
 * meets the margin on its anchored side, and it keeps its shape while the canvas reshapes.
 */
export function TitleCard({
  card,
  live,
}: {
  readonly card: Card;
  readonly live: boolean;
}): ReactElement {
  const reduced = useMotionPreference() === "reduced";
  const tracked = use(AnimationTrackingContext);
  const place = useStageLayout(card.anchor);
  const placeTracking = useAnimationTracking();
  const colors = FINISH_COLORS[card.finish];
  const shift = anchorShift(card);
  const toX = shift.x * 100;
  const toY = shift.y * 100;
  const toScale = card.scale / 100;
  const toTurn = card.turn;
  const toLeanX = card.lean.x * LEAN_DEGREES;
  const toLeanY = -card.lean.y * LEAN_DEGREES;
  const shiftX = useMotionValue(toX);
  const shiftY = useMotionValue(toY);
  const scale = useMotionValue(toScale);
  const rotate = useMotionValue(toTurn);
  const rotateY = useMotionValue(toLeanX);
  const rotateX = useMotionValue(toLeanY);
  const x = useTransform(shiftX, (share) => `${String(share)}%`);
  const y = useTransform(shiftY, (share) => `${String(share)}%`);

  useLayoutEffect(() => {
    const moves = [
      [shiftX, toX],
      [shiftY, toY],
      [scale, toScale],
      [rotate, toTurn],
      [rotateY, toLeanX],
      [rotateX, toLeanY],
    ] as const;
    if (live || reduced) {
      for (const [value, to] of moves) value.jump(to);
      return undefined;
    }
    const glides = moves.flatMap(([value, to]) =>
      value.get() === to ? [] : [animate(value, to, spring.smooth)],
    );
    if (glides.length === 0) return undefined;
    const release = tracked ? trackAnimation() : undefined;
    void Promise.all(glides).then(() => release?.());
    return () => {
      for (const glide of glides) glide.stop();
      release?.();
    };
  }, [
    live,
    reduced,
    tracked,
    toX,
    toY,
    toScale,
    toTurn,
    toLeanX,
    toLeanY,
    shiftX,
    shiftY,
    scale,
    rotate,
    rotateY,
    rotateX,
  ]);

  const look: CSSProperties & StudioVariables = {
    "--cs-canvas-width": String(card.width),
    "--cs-corners": String(card.corners),
    "--cs-spacing": String(card.spacing),
    "--cs-depth": String(card.finish === "clear" ? 0 : card.depth / 100),
    "--cs-shadow-color": cardShadow(card).color,
    "--cs-fill": colors.fill ?? "transparent",
    "--cs-ink": colors.ink,
  };
  return (
    <div className="cs-artwork">
      <div className="cs-room" style={look}>
        <motion.div
          {...placeTracking}
          {...place}
          className="cs-slot"
          data-anchor={card.anchor}
        >
          <motion.div
            className="cs-card"
            style={{ x, y, scale, rotate, rotateX, rotateY }}
            data-finish={card.finish}
            data-live={live ? "" : undefined}
            data-bt-clip=""
            data-testid="title-card"
          >
            <span className="cs-title">{card.title}</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
