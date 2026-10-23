import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent, ReactElement } from "react";
import { flushSync } from "react-dom";
import {
  Icon,
  Menu,
  SharedIndicator,
  Surface,
  Text,
  space,
  timing,
  useFloatingObstacle,
} from "@buttery/core";
import { buttery } from "@buttery/react";
import { Hash, List, Plus, Quote, Type } from "lucide-react";
import { LAYOUT_OPTIONS } from "./deck.ts";
import type { Deck, Layout, Slide } from "./deck.ts";
import { SlideView } from "./Slide.tsx";

const LAYOUT_ICONS = {
  title: Type,
  points: List,
  numbers: Hash,
  quote: Quote,
} as const satisfies Record<Layout, unknown>;

/** How far a mouse or pen press moves before it drags a slide instead of picking it. */
const DRAG_FROM = space["1"];
/** How far a finger may wander while it holds a thumbnail before the hold counts as a scroll. */
const HOLD_SLOP = space["2"];

/** Where a thumbnail sits in the list: its slot's top left corner. */
interface Slot {
  readonly left: number;
  readonly top: number;
}

/** A thumbnail being dragged: where it started, where every slot is, and where it is now. */
interface Drag {
  readonly id: string;
  readonly pointer: number;
  /** A finger drags after holding still a moment, so a swipe still scrolls the list. */
  readonly touch: boolean;
  readonly startX: number;
  readonly startY: number;
  readonly startIndex: number;
  /** Each slot, measured as the drag started; every thumbnail is the same size. */
  readonly slots: readonly Slot[];
  /** Whether every slot is on one row, as in the strip, so the thumbnail only moves along it. */
  readonly row: boolean;
  readonly element: HTMLElement;
  started: boolean;
  index: number;
  x: number;
  y: number;
  frame: number;
  hold: number;
}

/** What a slide is called in the strip: its number and its words. */
export function slideName(slide: Slide, index: number): string {
  const words = slide.title.trim() === "" ? "Untitled" : slide.title.trim();
  return `Slide ${String(index + 1)}: ${words}`;
}

/** The slot nearest a thumbnail's top left corner. */
function nearestSlot(
  slots: readonly Slot[],
  left: number,
  top: number,
): number {
  let best = 0;
  let shortest = Number.POSITIVE_INFINITY;
  for (const [index, slot] of slots.entries()) {
    const distance = Math.hypot(slot.left - left, slot.top - top);
    if (distance < shortest) {
      shortest = distance;
      best = index;
    }
  }
  return best;
}

/** How many thumbnails share the first one's row: all of them in the strip, a row's worth in the grid. */
function perRow(options: readonly HTMLElement[]): number {
  const first = options[0];
  if (!first) return 1;
  return options.filter((option) => option.offsetTop === first.offsetTop)
    .length;
}

/**
 * The deck's slides: a thumbnail of each, the picked one marked by an indicator that slides to whichever is
 * picked next, and a button that adds a slide of the layout chosen from its menu. On a wide work area they
 * run in a strip under the stage; on a tall one, a grid under it that scrolls on its own. Arrow keys pick (up
 * and down by a row in the grid), Alt with an arrow moves the picked slide, and Delete deletes it; a drag
 * moves it too, the others gliding out of its way, and a finger drags once it has held a thumbnail a moment.
 */
export function SlideStrip({
  deck,
  selected,
  onSelect,
  onMove,
  onMoveEnd,
  onDelete,
  onAdd,
}: {
  readonly deck: Deck;
  readonly selected: string | null;
  readonly onSelect: (id: string) => void;
  /** Moves a slide; moves with the same key, as one drag makes, are one undo step. */
  readonly onMove: (id: string, to: number, key: string) => void;
  /** Ends a move, sealing its undo step. */
  readonly onMoveEnd: () => void;
  readonly onDelete: (id: string) => void;
  readonly onAdd: (layout: Layout) => void;
}): ReactElement {
  const obstacle = useFloatingObstacle();
  const ids = useId();
  const list = useRef<HTMLDivElement | null>(null);
  const drag = useRef<Drag | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [drops, setDrops] = useState(0);
  const { slides } = deck;
  const order = slides.map((slide) => slide.id).join(" ");

  // A finger that has started dragging a thumbnail mustn't scroll the list under it.
  const listbox = useCallback((element: HTMLDivElement | null) => {
    list.current = element;
    if (!element) return undefined;
    const keepStill = (event: TouchEvent): void => {
      if (drag.current?.started === true) event.preventDefault();
    };
    element.addEventListener("touchmove", keepStill, { passive: false });
    return () => {
      element.removeEventListener("touchmove", keepStill);
      list.current = null;
    };
  }, []);

  const options = (): HTMLElement[] => [
    ...(list.current?.querySelectorAll<HTMLElement>("[data-slide]") ?? []),
  ];

  const optionOf = (id: string | null): HTMLElement | null =>
    id === null
      ? null
      : (list.current?.querySelector<HTMLElement>(
          `[data-slide="${CSS.escape(id)}"]`,
        ) ?? null);

  useEffect(() => {
    optionOf(selected)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [selected]);

  useEffect(
    () => () => {
      if (!drag.current) return;
      cancelAnimationFrame(drag.current.frame);
      window.clearTimeout(drag.current.hold);
    },
    [],
  );

  const pick = (index: number): void => {
    const slide = slides[Math.min(Math.max(index, 0), slides.length - 1)];
    if (slide) onSelect(slide.id);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const index = slides.findIndex((slide) => slide.id === selected);
    const slide = slides[index];
    if (!slide) return;
    const columns = perRow(options());
    const row = columns < slides.length ? columns : 1;
    const step =
      event.key === "ArrowRight"
        ? 1
        : event.key === "ArrowLeft"
          ? -1
          : event.key === "ArrowDown"
            ? row
            : event.key === "ArrowUp"
              ? -row
              : 0;
    if (step !== 0 && event.altKey) {
      event.preventDefault();
      onMove(slide.id, index + step, "move");
      onMoveEnd();
    } else if (step !== 0) {
      event.preventDefault();
      pick(index + step);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      pick(event.key === "Home" ? 0 : slides.length - 1);
    } else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      onDelete(slide.id);
    }
  };

  const follow = (current: Drag): void => {
    const start = current.slots[current.startIndex] ?? { left: 0, top: 0 };
    const left = start.left + current.x - current.startX;
    const top = current.row
      ? start.top
      : start.top + current.y - current.startY;
    const target = nearestSlot(current.slots, left, top);
    if (target !== current.index) {
      current.index = target;
      flushSync(() => {
        onMove(current.id, target, "drag");
      });
    }
    const slot = current.slots[target] ?? start;
    current.element.style.translate = `${String(left - slot.left)}px ${String(top - slot.top)}px`;
  };

  const begin = (current: Drag): void => {
    current.started = true;
    current.element.setPointerCapture(current.pointer);
    onSelect(current.id);
    setDragging(current.id);
  };

  const startPress = (
    event: PointerEvent<HTMLDivElement>,
    slide: Slide,
    index: number,
  ): void => {
    if (event.button !== 0) return;
    if (drag.current) {
      cancelAnimationFrame(drag.current.frame);
      window.clearTimeout(drag.current.hold);
    }
    const slots = options().map((option) => ({
      left: option.offsetLeft,
      top: option.offsetTop,
    }));
    const current: Drag = {
      id: slide.id,
      pointer: event.pointerId,
      touch: event.pointerType === "touch",
      startX: event.clientX,
      startY: event.clientY,
      startIndex: index,
      slots,
      row: slots.every((slot) => slot.top === slots[0]?.top),
      element: event.currentTarget,
      started: false,
      index,
      x: event.clientX,
      y: event.clientY,
      frame: 0,
      hold: 0,
    };
    drag.current = current;
    if (current.touch) {
      current.hold = window.setTimeout(() => {
        if (drag.current === current && !current.started) begin(current);
      }, timing["delay-tooltip"]);
    }
  };

  const movePress = (event: PointerEvent<HTMLDivElement>): void => {
    const current = drag.current;
    if (current?.pointer !== event.pointerId) return;
    current.x = event.clientX;
    current.y = event.clientY;
    if (!current.started) {
      const moved = Math.hypot(
        current.x - current.startX,
        current.y - current.startY,
      );
      if (current.touch) {
        if (moved > HOLD_SLOP) {
          window.clearTimeout(current.hold);
          drag.current = null;
        }
        return;
      }
      if (moved < DRAG_FROM) return;
      begin(current);
    }
    cancelAnimationFrame(current.frame);
    current.frame = requestAnimationFrame(() => {
      follow(current);
    });
  };

  const endPress = (event: PointerEvent<HTMLDivElement>): void => {
    const current = drag.current;
    if (current?.pointer !== event.pointerId) return;
    drag.current = null;
    cancelAnimationFrame(current.frame);
    window.clearTimeout(current.hold);
    if (!current.started) {
      if (event.type === "pointerup") onSelect(current.id);
      return;
    }
    follow(current);
    setDragging(null);
    setDrops((count) => count + 1);
    onMoveEnd();
  };

  return (
    <div ref={obstacle} className="dh-strip-frame">
      <Surface level="panel" className="dh-strip" data-testid="slide-strip">
        <div className="dh-strip-scroll">
          {slides.length === 0 ? null : (
            <SharedIndicator.Group>
              <div
                ref={listbox}
                role="listbox"
                aria-label="Slides"
                aria-activedescendant={
                  selected === null ? undefined : `${ids}-${selected}`
                }
                tabIndex={0}
                className="dh-strip-list"
                onKeyDown={onKeyDown}
              >
                {slides.map((slide, index) => {
                  const picked = slide.id === selected;
                  const held = slide.id === dragging;
                  return (
                    <SharedIndicator key={slide.id} active={picked} asChild>
                      <buttery.div
                        layout
                        layoutDependency={
                          held
                            ? `held ${slide.id}`
                            : `${order} ${String(drops)}`
                        }
                        id={`${ids}-${slide.id}`}
                        role="option"
                        aria-selected={picked}
                        aria-label={slideName(slide, index)}
                        className="dh-thumb"
                        style={held ? {} : { translate: "none" }}
                        data-slide={slide.id}
                        data-dragging={held ? "" : undefined}
                        onPointerDown={(event) => {
                          startPress(event, slide, index);
                        }}
                        onPointerMove={movePress}
                        onPointerUp={endPress}
                        onPointerCancel={endPress}
                      >
                        <Text
                          variant="badge"
                          tabular
                          className="dh-thumb-number"
                          aria-hidden="true"
                        >
                          {String(index + 1)}
                        </Text>
                        <span
                          className="dh-thumb-frame"
                          data-bt-allow-overlap=""
                          aria-hidden="true"
                        >
                          <SlideView slide={slide} size={deck.size} drawn />
                        </span>
                      </buttery.div>
                    </SharedIndicator>
                  );
                })}
              </div>
            </SharedIndicator.Group>
          )}
          <div className="dh-add-row">
            <div className="dh-add-cell">
              <Text
                variant="badge"
                className="dh-add-gutter"
                aria-hidden="true"
              />
              <Menu>
                <Menu.Trigger asChild>
                  <button type="button" className="dh-add bt-press">
                    <Icon icon={Plus} />
                    <Text variant="control">New slide</Text>
                  </button>
                </Menu.Trigger>
                <Menu.Content align="end">
                  {LAYOUT_OPTIONS.map((option) => (
                    <Menu.Item
                      key={option.value}
                      icon={LAYOUT_ICONS[option.value]}
                      onSelect={() => {
                        onAdd(option.value);
                      }}
                    >
                      {option.label}
                    </Menu.Item>
                  ))}
                </Menu.Content>
              </Menu>
            </div>
          </div>
        </div>
      </Surface>
    </div>
  );
}
