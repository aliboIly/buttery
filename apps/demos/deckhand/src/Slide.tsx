import type {
  CSSProperties,
  ComponentPropsWithRef,
  ReactElement,
  Ref,
} from "react";
import { cx } from "@butteryui/core";
import { anchors, buttery, useStageLayout } from "@butteryui/react";
import type { Anchor } from "@butteryui/react";
import { SLIDE_SIZES, hasStat, pointsOf } from "./deck.ts";
import type { Slide, SlideSize } from "./deck.ts";
import { SHADOW, boxLook, emWidth, fillCss } from "./geometry.ts";

/** The slide's own variables, read by its stylesheet. */
type SlideVariables = Readonly<Record<`--bt-deckhand-${string}`, string>>;

/** A slide's look as the variables its stylesheet reads. */
function slideStyle(
  slide: Slide,
  size: SlideSize,
): CSSProperties & SlideVariables {
  const box = boxLook(slide);
  const { width, height } = SLIDE_SIZES[size];
  return {
    "--bt-deckhand-fill": fillCss(slide.fill),
    "--bt-deckhand-box-fill": box.fill,
    "--bt-deckhand-ink": box.ink,
    "--bt-deckhand-depth": String(box.depth),
    "--bt-deckhand-shadow": SHADOW,
    "--bt-deckhand-scale": String(slide.size / 100),
    "--bt-deckhand-ratio": String(width / height),
    "--bt-deckhand-stats": String(
      Math.max(1, slide.stats.filter(hasStat).length),
    ),
  };
}

/** The widest of a slide's numbers in ems, which sizes all of them to fit their columns alike. */
function statsStyle(values: readonly string[]): CSSProperties & SlideVariables {
  return {
    "--bt-deckhand-ems": String(Math.max(1, ...values.map(emWidth))),
  };
}

/** Marks a piece of text on the slide with the inspector field that writes it. */
function field(name: string): { readonly "data-dh-field": string } {
  return { "data-dh-field": name };
}

/**
 * A piece of the slide's text: written into the page, or, on a thumbnail, drawn by the stylesheet from
 * `data-text`, so the strip names each slide once instead of reading every word on it.
 */
function words(
  text: string,
  drawn: boolean,
): { readonly children?: string; readonly "data-text"?: string } {
  return drawn ? { "data-text": text } : { children: text };
}

/** The slide's words, laid out for its layout. */
function SlideWords({
  slide,
  drawn,
}: {
  readonly slide: Slide;
  readonly drawn: boolean;
}): ReactElement {
  const subtitle =
    slide.subtitle.trim() === "" ? null : (
      <p
        className="dh-subtitle"
        data-dh-text=""
        {...field("subtitle")}
        {...words(slide.subtitle, drawn)}
      />
    );
  const title =
    slide.title.trim() === "" ? null : (
      <p
        className="dh-title"
        data-dh-text=""
        {...field("title")}
        {...words(slide.title, drawn)}
      />
    );
  switch (slide.layout) {
    case "title":
      return (
        <>
          {title}
          {subtitle}
        </>
      );
    case "points": {
      const points = pointsOf(slide);
      return (
        <>
          {title}
          {points.length === 0 ? null : (
            <ul className="dh-points" {...field("points")}>
              {points.map((point, index) => (
                <li key={`${String(index)}:${point}`} className="dh-point">
                  <span className="dh-bullet" aria-hidden="true">
                    <span className="dh-dot" data-dh-dot="" />
                  </span>
                  <span data-dh-text="" {...words(point, drawn)} />
                </li>
              ))}
            </ul>
          )}
          {subtitle}
        </>
      );
    }
    case "numbers": {
      const stats = slide.stats
        .map((stat, index) => ({ stat, index }))
        .filter(({ stat }) => hasStat(stat));
      return (
        <>
          {title}
          {stats.length === 0 ? null : (
            <div
              className="dh-stats"
              style={statsStyle(stats.map(({ stat }) => stat.value))}
            >
              {stats.map(({ stat, index }) => (
                <div key={index} className="dh-stat">
                  <p
                    className="dh-stat-value"
                    data-dh-text=""
                    {...field(`stat-${String(index)}-value`)}
                    {...words(stat.value, drawn)}
                  />
                  <p
                    className="dh-stat-label"
                    data-dh-text=""
                    {...field(`stat-${String(index)}-label`)}
                    {...words(stat.label, drawn)}
                  />
                </div>
              ))}
            </div>
          )}
          {subtitle}
        </>
      );
    }
    case "quote":
      return (
        <>
          {slide.title.trim() === "" ? null : (
            <p
              className="dh-quote"
              data-dh-text=""
              {...field("title")}
              {...words(`“${slide.title.trim()}”`, drawn)}
            />
          )}
          {slide.subtitle.trim() === "" ? null : (
            <p
              className="dh-cite"
              data-dh-text=""
              {...field("subtitle")}
              {...words(slide.subtitle, drawn)}
            />
          )}
        </>
      );
    default: {
      const unknown: never = slide.layout;
      return unknown;
    }
  }
}

/** Props for `SlideView`. */
interface SlideViewProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children"
> {
  readonly slide: Slide;
  readonly size: SlideSize;
  /** Draws the words from the stylesheet rather than writing them into the page, for a thumbnail. */
  readonly drawn?: boolean | undefined;
}

/**
 * A slide drawn at whatever size its box is, fill and all, as a thumbnail and a presentation show it. Its
 * sizes follow its box's shorter side, so it reads the same at every size.
 */
export function SlideView({
  slide,
  size,
  drawn = false,
  className,
  style,
  ...rest
}: SlideViewProps): ReactElement {
  return (
    <div
      {...rest}
      className={cx("dh-slide", className)}
      style={{ ...slideStyle(slide, size), ...style }}
      data-painted=""
      data-layout={slide.layout}
      data-align={slide.align}
      data-box={slide.box}
      data-bt-clip=""
    >
      <div className="dh-slide-room" data-position={slide.position}>
        <div className="dh-slide-place">
          <div className="dh-slide-box">
            <SlideWords slide={slide} drawn={drawn} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Props for `StageSlide`. */
interface StageSlideProps {
  readonly slide: Slide;
  readonly size: SlideSize;
  /** While a slider is dragged, the box's shadow follows it at once instead of crossfading. */
  readonly live: boolean;
  /** Arrange mode: the box is framed, and while it's dragged the places it can land show. */
  readonly arranging: boolean;
  /** Counts drags let go, so the box glides from where it was dropped even onto the place it left. */
  readonly drops: number;
  /** The place a drag would drop the box on, which the places shown during a drag mark. */
  readonly target: Anchor;
  /** The wrapper that moves, which a drag offsets and a new place glides. */
  readonly placeRef: Ref<HTMLDivElement>;
  /** The box, which the arrange toolbar sits under. */
  readonly boxRef: Ref<HTMLDivElement>;
  /** Whether the box is being dragged, so the drag's offset isn't cleared under it. */
  readonly dragging: boolean;
  /** What a press on the box does: picks it for arranging, and drags it. */
  readonly boxEvents: Pick<
    ComponentPropsWithRef<"div">,
    "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel"
  >;
}

/**
 * The slide on the stage, where the stage paints its fill. A new place glides the words there on
 * spring.smooth, and they keep their shape while the stage reshapes to a new slide size.
 */
export function StageSlide({
  slide,
  size,
  live,
  arranging,
  drops,
  target,
  placeRef,
  boxRef,
  dragging,
  boxEvents,
}: StageSlideProps): ReactElement {
  const place = useStageLayout(`${slide.position} ${String(drops)}`);
  return (
    <div
      className="dh-slide"
      style={slideStyle(slide, size)}
      data-layout={slide.layout}
      data-align={slide.align}
      data-box={slide.box}
      data-arranging={arranging ? "" : undefined}
      data-bt-clip=""
      data-testid="stage-slide"
    >
      <div className="dh-slide-room" data-position={slide.position}>
        <buttery.div
          key={`${slide.id} ${slide.layout}`}
          ref={placeRef}
          layout
          layoutDependency={place.layoutDependency}
          className="dh-slide-place"
          style={dragging ? {} : { translate: "none" }}
        >
          <div
            ref={boxRef}
            className="dh-slide-box"
            data-dh-box=""
            data-live={live ? "" : undefined}
            {...boxEvents}
          >
            <SlideWords slide={slide} drawn={false} />
          </div>
        </buttery.div>
        {dragging ? (
          <div className="dh-slide-spots" aria-hidden="true">
            {anchors.map((anchor) => (
              <span
                key={anchor}
                className="dh-slide-spot"
                data-current={anchor === target ? "" : undefined}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
