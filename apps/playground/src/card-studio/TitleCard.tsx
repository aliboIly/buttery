import type { CSSProperties, ReactElement } from "react";
import {
  spring,
  useAnimationTracking,
  useLayoutAnimation,
  useMotionPreference,
} from "@buttery/core";
import { motion } from "motion/react";
import { EDGE_COLORS, TILT_DEGREES, cardShadow } from "./geometry.ts";
import type { Card } from "./state.ts";

/** The studio's own variables, read by its stylesheet. */
type StudioVariables = Readonly<Record<`--cs-${string}`, string>>;

/**
 * The title card on the canvas. Drags move it at once; other changes, such as a reset, glide on
 * spring.smooth, and a new anchor glides it there.
 */
export function TitleCard({
  card,
  live,
}: {
  readonly card: Card;
  readonly live: boolean;
}): ReactElement {
  const reduced = useMotionPreference() === "reduced";
  const position = useLayoutAnimation("smooth", "position");
  const tracking = useAnimationTracking();
  const placeTracking = useAnimationTracking();
  const colors = EDGE_COLORS[card.edge];
  const look: CSSProperties & StudioVariables = {
    "--cs-canvas-width": String(card.width),
    "--cs-radius": String(card.roundness),
    "--cs-padding": String(card.padding),
    "--cs-shadow": String(card.edge === "none" ? 0 : card.shadow / 100),
    "--cs-shadow-color": cardShadow(card).color,
    "--cs-fill": colors.fill ?? "transparent",
    "--cs-ink": colors.ink,
  };
  return (
    <div className="cs-artwork">
      <div className="cs-room" style={look}>
        <motion.div
          {...placeTracking}
          className="cs-slot"
          data-anchor={card.anchor}
          layout={position.layout}
          layoutDependency={card.anchor}
          transition={position.transition}
        >
          <motion.div
            {...tracking}
            className="cs-card"
            data-edge={card.edge}
            data-testid="title-card"
            initial={false}
            animate={{
              scale: card.scale / 100,
              rotate: card.rotation,
              rotateY: card.tilt.x * TILT_DEGREES,
              rotateX: -card.tilt.y * TILT_DEGREES,
            }}
            transition={live || reduced ? spring.instant : spring.smooth}
          >
            <span className="cs-title">{card.title}</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
