import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent, ReactElement } from "react";
import {
  Divider,
  FitBox,
  Inline,
  Layer,
  Presence,
  Scrim,
  Surface,
  Text,
  tabbables,
  timing,
} from "@butteryui/core";
import {
  Button,
  ButteryProvider,
  IconButton,
  useButtery,
} from "@butteryui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SLIDE_SIZES } from "./deck.ts";
import type { Deck } from "./deck.ts";
import { SCREEN } from "./geometry.ts";
import { SlideView } from "./Slide.tsx";

const SCREEN_STYLE: CSSProperties &
  Readonly<Record<"--bt-deckhand-screen", string>> = {
  "--bt-deckhand-screen": SCREEN,
};

/** Keys that move through the slides, and how far. */
const STEPS: Readonly<Partial<Record<string, number>>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  PageDown: 1,
  Enter: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
  PageUp: -1,
  Backspace: -1,
};

/** Keeps Tab inside the presentation, going round from its last control to its first. */
function keepTab(event: KeyboardEvent, dialog: HTMLElement): void {
  const stops = tabbables(dialog);
  const first = stops[0];
  const last = stops.at(-1);
  if (!first || !last) return;
  const at = document.activeElement;
  if (event.shiftKey && (at === first || at === dialog)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (at === last || at === dialog)) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * The deck playing full-window over a dark room, from slide `start`. The arrow keys, Page Up and Down and a
 * press on the slide move through it, Home and End jump to its ends, and Escape leaves. Each slide arrives
 * on buttery's motion: the old one fades out as the new one grows in, or a plain fade with reduced motion.
 * The controls fade away, and the pointer hides, while the pointer rests; moving it or tabbing to them
 * brings them back.
 */
export function Presenter({
  deck,
  start,
  onClose,
}: {
  readonly deck: Deck;
  readonly start: number;
  readonly onClose: () => void;
}): ReactElement {
  const outer = useButtery();
  const [index, setIndex] = useState(start);
  const [idle, setIdle] = useState(false);
  const idleTimer = useRef(0);
  const count = deck.slides.length;
  const { width, height } = SLIDE_SIZES[deck.size];
  const go = (next: number): void => {
    setIndex(Math.min(Math.max(next, 0), count - 1));
  };
  const onKeyDown = (event: KeyboardEvent, dialog: HTMLElement): void => {
    if (event.key === "Tab") {
      keepTab(event, dialog);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    const onControl = event.target !== dialog;
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      go(event.key === "Home" ? 0 : count - 1);
      return;
    }
    const step =
      event.key === " " && !onControl
        ? 1
        : (event.key === "Enter" || event.key === "Backspace") && onControl
          ? undefined
          : STEPS[event.key];
    if (step === undefined) return;
    event.preventDefault();
    go(index + step);
  };
  const keys = useRef(onKeyDown);
  useEffect(() => {
    keys.current = onKeyDown;
  });
  useEffect(() => {
    idleTimer.current = window.setTimeout(() => {
      setIdle(true);
    }, timing["toast-life"]);
    return () => {
      window.clearTimeout(idleTimer.current);
    };
  }, []);
  const wake = (): void => {
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      setIdle(true);
    }, timing["toast-life"]);
    if (idle) setIdle(false);
  };
  const dialog = useCallback((element: HTMLDivElement | null) => {
    if (!element) return undefined;
    element.focus({ preventScroll: true });
    const listen = (event: KeyboardEvent): void => {
      keys.current(event, element);
    };
    element.addEventListener("keydown", listen);
    return () => {
      element.removeEventListener("keydown", listen);
    };
  }, []);

  return (
    <Layer band="modal">
      <Presence show preset="fade" className="dh-present">
        <Scrim className="dh-present-screen" style={SCREEN_STYLE} />
        <ButteryProvider
          colorScheme="dark"
          density={outer.density}
          platform={outer.platform}
          reducedMotion={outer.reducedMotion ? "always" : "never"}
        >
          <div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-label={`Presenting ${deck.name}`}
            tabIndex={-1}
            className="dh-present-dialog"
            data-idle={idle ? "" : undefined}
            data-testid="presenter"
            onPointerMove={wake}
          >
            <div
              className="dh-present-slides"
              onPointerUp={(event: PointerEvent<HTMLDivElement>) => {
                if (event.button === 0) go(index + 1);
              }}
            >
              <FitBox ratio={width / height}>
                {deck.slides.map((slide, at) => (
                  <Presence
                    key={slide.id}
                    show={at === index}
                    preset="pop"
                    className="dh-present-slide"
                    data-bt-allow-overlap=""
                  >
                    <SlideView slide={slide} size={deck.size} />
                  </Presence>
                ))}
              </FitBox>
            </div>
            <Surface
              level="floating"
              radius="full"
              pad={1}
              className="dh-present-bar"
            >
              <Inline gap={1} align="center">
                <IconButton
                  icon={ChevronLeft}
                  label="Previous slide"
                  aria-disabled={index === 0 || undefined}
                  onClick={() => {
                    go(index - 1);
                  }}
                />
                <Text
                  variant="control"
                  tabular
                  role="status"
                  className="dh-present-count"
                >
                  {`${String(index + 1)} of ${String(count)}`}
                </Text>
                <IconButton
                  icon={ChevronRight}
                  label="Next slide"
                  aria-disabled={index === count - 1 || undefined}
                  onClick={() => {
                    go(index + 1);
                  }}
                />
                <Divider orientation="vertical" length={6} decorative />
                <Button variant="ghost" onClick={onClose}>
                  End show
                </Button>
              </Inline>
            </Surface>
          </div>
        </ButteryProvider>
      </Presence>
    </Layer>
  );
}
