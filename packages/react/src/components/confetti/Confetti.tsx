import { motion } from "motion/react";
import { useEffect, useSyncExternalStore } from "react";
import type { ReactElement } from "react";
import {
  Layer,
  timing,
  trackAnimation,
  useMotionPreference,
  warnOnce,
} from "@buttery/core";
import { gradients } from "@buttery/core/palettes";
import {
  addBurst,
  getBursts,
  getServerBursts,
  hostState,
  registerHost,
  subscribe,
} from "./confetti-store.ts";
import type { Burst, Piece } from "./confetti-store.ts";

const FRESH = new Set(["honey", "apricot", "rose", "violet", "sky", "sea"]);
const COLORS = gradients
  .filter((preset) => FRESH.has(preset.id))
  .flatMap((preset) => [preset.fromHex, preset.toHex]);

const LIFE = timing.celebration / 1000;
const GRAVITY = 900;
const DRAG = 3;
const CONE = Math.PI / 3;
const STEPS = 12;

/** Distance travelled after `t` seconds from speed `v`, with drag pulling toward `terminal` speed. */
function travelled(v: number, terminal: number, t: number): number {
  return terminal * t + ((v - terminal) * (1 - Math.exp(-DRAG * t))) / DRAG;
}

function throwPieces(): readonly Piece[] {
  const count = 28 + Math.floor(Math.random() * 13);
  const times = Array.from(
    { length: STEPS + 1 },
    (_, step) => (step / STEPS) * LIFE,
  );
  return Array.from({ length: count }, (_, index): Piece => {
    const angle = -Math.PI / 2 + (Math.random() * 2 - 1) * CONE;
    const speed = 360 + Math.random() * 300;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    return {
      color: COLORS[index % COLORS.length] ?? "currentColor",
      x: times.map((t) => travelled(vx, 0, t)),
      y: times.map((t) => travelled(vy, GRAVITY / DRAG, t)),
      rotate: (Math.random() * 2 - 1) * 360,
      flip: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 540),
    };
  });
}

function BurstPieces({ burst }: { readonly burst: Burst }): ReactElement {
  useEffect(() => trackAnimation(), [burst.id]);

  return (
    <div
      className="bt-confetti"
      data-bt="Confetti"
      data-bt-part="burst"
      aria-hidden="true"
      style={{ left: `${String(burst.x)}px`, top: `${String(burst.y)}px` }}
    >
      {burst.pieces.map((piece, index) => (
        <motion.span
          key={index}
          data-bt-part="piece"
          style={{ backgroundColor: piece.color }}
          initial={{ x: 0, y: 0, rotate: 0, rotateX: 0, opacity: 1 }}
          animate={{
            x: [...piece.x],
            y: [...piece.y],
            rotate: piece.rotate,
            rotateX: piece.flip,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: LIFE,
            ease: "linear",
            opacity: { duration: LIFE, times: [0, 0.7, 1] },
          }}
        />
      ))}
    </div>
  );
}

/**
 * The host for `celebrate()` bursts, in the toast layer above dialogs. `ButteryProvider` mounts it once;
 * it renders nothing between bursts and never bursts with reduced motion.
 */
export function Confetti(): ReactElement | null {
  const bursts = useSyncExternalStore(subscribe, getBursts, getServerBursts);
  const reduced = useMotionPreference() === "reduced";
  useEffect(() => registerHost({ reduced }), [reduced]);
  if (reduced || bursts.length === 0) return null;
  return (
    <Layer band="toast">
      {bursts.map((burst) => (
        <BurstPieces key={burst.id} burst={burst} />
      ))}
    </Layer>
  );
}

/**
 * Bursts confetti from the middle of `from` (the viewport's middle without it): 28–40 small pieces in the
 * palette's fresh colors, thrown up in a ±60° cone, slowed by the air and fluttering down for 900ms. Save it
 * for a genuine finish, such as the last onboarding step or a first export, never routine actions. Does
 * nothing with reduced motion, and nothing (with a development warning) when no `Confetti` host is
 * mounted; `ButteryProvider` mounts one.
 *
 * @example
 * <Button onClick={(event) => { finish(); celebrate(event.currentTarget); }}>Finish</Button>
 */
export function celebrate(from?: Element | null): void {
  if (typeof window === "undefined") return;
  const state = hostState();
  if (state === "missing") {
    warnOnce(
      "Confetti",
      "celebrate() ran with no <Confetti /> host mounted, so nothing showed. Fix: wrap the app in <ButteryProvider>, which mounts one, or render <Confetti /> once near the root.",
    );
    return;
  }
  if (state === "reduced") return;
  const rect = from?.getBoundingClientRect();
  addBurst(
    rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
    rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
    throwPieces(),
    timing.celebration,
  );
}
