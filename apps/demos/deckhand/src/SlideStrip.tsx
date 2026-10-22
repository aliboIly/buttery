import { useEffect, useId, useRef, useState } from "react";
import type {
  CSSProperties,
  KeyboardEvent,
  PointerEvent,
  ReactElement,
} from "react";
import { flushSync } from "react-dom";
import {
  Icon,
  Menu,
  SharedIndicator,
  Surface,
  Text,
  useFloatingObstacle,
} from "@buttery/core";
import { buttery } from "@buttery/react";
import { Hash, List, Plus, Quote, Type } from "lucide-react";
import { LAYOUT_OPTIONS, SLIDE_SIZES } from "./deck.ts";
import type { Deck, Layout, Slide } from "./deck.ts";
import { SlideView } from "./Slide.tsx";

const LAYOUT_ICONS = {
  title: Type,
  points: List,
  numbers: Hash,
  quote: Quote,
} as const satisfies Record<Layout, unknown>;

/** How far a press has to move before it drags a slide instead of picking it. */
const DRAG_FROM = 4;

/** A thumbnail being dragged: where it started, where every slot is, and where it is now. */
interface Drag {
  readonly id: string;
  readonly pointer: number;
  readonly startX: number;
  readonly startIndex: number;
  /** Each slot's left edge, measured as the drag started; every thumbnail is the same width. */
  readonly slots: readonly number[];
  readonly element: HTMLElement;
  started: boolean;
  index: number;
  x: number;
  frame: number;
}

/** What a slide is called in the strip: its number and its words. */
export function slideName(slide: Slide, index: number): string {
  const words = slide.title.trim() === "" ? "Untitled" : slide.title.trim();
  return `Slide ${String(index + 1)}: ${words}`;
}

/** The slot nearest a left edge. */
function nearestSlot(slots: readonly number[], left: number): number {
  let best = 0;
  for (const [index, slot] of slots.entries()) {
    const known = slots[best] ?? slot;
    if (Math.abs(slot - left) < Math.abs(known - left)) best = index;
  }
  return best;
}

/**
 * The strip of slides under the stage: a thumbnail of each, the picked one marked by an indicator that
 * slides to whichever is picked next, and a button that adds a slide of the layout chosen from its menu.
 * Arrow keys pick, Alt with an arrow moves the picked slide, and Delete deletes it; a drag moves it too, the
 * others gliding out of its way.
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
  const list = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [drops, setDrops] = useState(0);
  const { slides } = deck;
  const order = slides.map((slide) => slide.id).join(" ");
  const { width, height } = SLIDE_SIZES[deck.size];
  const ratio: CSSProperties & Readonly<Record<"--bt-deckhand-ratio", string>> =
    { "--bt-deckhand-ratio": String(width / height) };

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
      if (drag.current) cancelAnimationFrame(drag.current.frame);
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
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
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
    const left =
      (current.slots[current.startIndex] ?? 0) + current.x - current.startX;
    const target = nearestSlot(current.slots, left);
    if (target !== current.index) {
      current.index = target;
      flushSync(() => {
        onMove(current.id, target, "drag");
      });
    }
    current.element.style.translate = `${String(left - (current.slots[target] ?? 0))}px 0`;
  };

  const startPress = (
    event: PointerEvent<HTMLDivElement>,
    slide: Slide,
    index: number,
  ): void => {
    if (event.button !== 0) return;
    if (drag.current) cancelAnimationFrame(drag.current.frame);
    const options = list.current?.querySelectorAll<HTMLElement>("[data-slide]");
    drag.current = {
      id: slide.id,
      pointer: event.pointerId,
      startX: event.clientX,
      startIndex: index,
      slots: [...(options ?? [])].map((option) => option.offsetLeft),
      element: event.currentTarget,
      started: false,
      index,
      x: event.clientX,
      frame: 0,
    };
  };

  const movePress = (event: PointerEvent<HTMLDivElement>): void => {
    const current = drag.current;
    if (current?.pointer !== event.pointerId) return;
    current.x = event.clientX;
    if (!current.started) {
      if (Math.abs(current.x - current.startX) < DRAG_FROM) return;
      current.started = true;
      current.element.setPointerCapture(event.pointerId);
      onSelect(current.id);
      setDragging(current.id);
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
    <Surface
      ref={obstacle}
      level="panel"
      className="dh-strip"
      style={ratio}
      data-testid="slide-strip"
    >
      <div className="dh-strip-scroll">
        {slides.length === 0 ? null : (
          <SharedIndicator.Group>
            <div
              ref={list}
              role="listbox"
              aria-label="Slides"
              aria-orientation="horizontal"
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
                        held ? `held ${slide.id}` : `${order} ${String(drops)}`
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
    </Surface>
  );
}
