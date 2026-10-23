import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import type { CSSProperties, PointerEvent, ReactElement } from "react";
import { flushSync } from "react-dom";
import { isApplePlatform, lastInput, useShortcut } from "@butteryui/core";
import {
  AppShell,
  Button,
  ContextMenu,
  EmptyState,
  FloatingToolbar,
  FormDialog,
  Stage,
  TextField,
  toast,
} from "@butteryui/react";
import type { Anchor } from "@butteryui/react";
import {
  LayoutTemplate,
  Move,
  Palette,
  PenLine,
  Plus,
  Presentation,
  RotateCcw,
} from "lucide-react";
import { DeckHeader } from "./DeckHeader.tsx";
import {
  DeckInspector,
  EmptyDeckInspector,
  switchFill,
} from "./DeckInspector.tsx";
import type { ChangeSlide } from "./DeckInspector.tsx";
import { DeckTour, tourIsNew } from "./DeckTour.tsx";
import {
  LAYOUT_DEFAULTS,
  LAYOUT_OPTIONS,
  LOOK_DEFAULTS,
  SLIDE_SIZES,
  lookChanged,
  withLayout,
} from "./deck.ts";
import type { Box, Fill, Layout, SlideSize } from "./deck.ts";
import { fileName, slideBlob } from "./export.ts";
import { ANCHOR_NAMES, fillCss, nearestAnchor } from "./geometry.ts";
import { Presenter } from "./Presenter.tsx";
import { StageSlide } from "./Slide.tsx";
import { LAYOUT_ICONS, SlideStrip, slideName } from "./SlideStrip.tsx";
import {
  SAMPLE_EDITOR,
  changeSlide,
  historyReducer,
  startHistory,
} from "./state.ts";
import { loadEditor, saveEditor } from "./storage.ts";
import "./deckhand.css";

/** Changes that run on, like typing or a slider's drag, and join one undo step until they're sealed. */
const RUNNING = /^(?:text|size|depth|angle):/;

/** How far a press on the words has to move before it drags them. */
const DRAG_FROM = 4;

/** Arrange mode: the slide whose words are picked, where they were, and whether the keyboard opened it. */
interface Arranging {
  readonly id: string;
  readonly from: Anchor;
  readonly keyboard: boolean;
}

/** A drag of the words: where it started, the boxes it moves in, and where it is now. */
interface WordsDrag {
  readonly pointer: number;
  readonly startX: number;
  readonly startY: number;
  readonly place: DOMRect;
  readonly room: DOMRect;
  started: boolean;
  x: number;
  y: number;
  frame: number;
}

function share(offset: number, room: number): number {
  return room <= 0 ? 0.5 : Math.min(Math.max(offset / room, 0), 1);
}

const BOXES = [
  { value: "none", label: "No box" },
  { value: "light", label: "Light box" },
  { value: "dark", label: "Dark box" },
] as const satisfies readonly { readonly value: Box; readonly label: string }[];

const FILLS = [
  { value: "solid", label: "Color" },
  { value: "gradient", label: "Gradient" },
] as const satisfies readonly {
  readonly value: Fill["kind"];
  readonly label: string;
}[];

function isLayout(value: string): value is Layout {
  return LAYOUT_OPTIONS.some((option) => option.value === value);
}

function isBox(value: string): value is Box {
  return BOXES.some((option) => option.value === value);
}

function isFillKind(value: string): value is Fill["kind"] {
  return FILLS.some((option) => option.value === value);
}

/** The inspector field that writes a piece of the slide, the last one when two crossfade. */
function inputFor(field: string): HTMLElement | null {
  const found = document.querySelectorAll<HTMLElement>(
    `[data-dh-input="${CSS.escape(field)}"]`,
  );
  return found.item(found.length - 1);
}

/** Deckhand: write a deck, lay out and style each slide, then present it. */
export function Deckhand(): ReactElement {
  const [history, dispatch] = useReducer(historyReducer, null, () =>
    startHistory(loadEditor() ?? SAMPLE_EDITOR),
  );
  const { deck, selected } = history.present;
  const index = deck.slides.findIndex((candidate) => candidate.id === selected);
  const slide = deck.slides[index] ?? null;
  const [tourOpen, setTourOpen] = useState(tourIsNew);
  const [live, setLive] = useState(false);
  const liveRef = useRef(false);
  const [presenting, setPresenting] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const pendingField = useRef<string | null>(null);
  const [arrange, setArrange] = useState<Arranging | null>(null);
  const [dragging, setDragging] = useState(false);
  const [target, setTarget] = useState<Anchor | null>(null);
  const [drops, setDrops] = useState(0);
  const wordsDrag = useRef<WordsDrag | null>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const place = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const newSlideButton = useRef<HTMLButtonElement>(null);
  const focusNewSlide = useRef(false);
  const pointedField = useRef<string | null>(null);

  if (arrange && arrange.id !== selected) setArrange(null);
  const arranging = arrange !== null && slide !== null;

  useEffect(() => {
    saveEditor(history.present);
  }, [history.present]);

  useLayoutEffect(() => {
    if (slide !== null || !focusNewSlide.current) return;
    focusNewSlide.current = false;
    newSlideButton.current?.focus();
  }, [slide]);

  useEffect(() => {
    if (!sheetOpen || pendingField.current === null) return undefined;
    const field = pendingField.current;
    const frame = requestAnimationFrame(() => {
      pendingField.current = null;
      inputFor(field)?.focus();
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [sheetOpen]);

  useEffect(
    () => () => {
      if (wordsDrag.current) cancelAnimationFrame(wordsDrag.current.frame);
    },
    [],
  );

  const seal = (): void => {
    dispatch({ type: "seal" });
  };
  const onLive = (next: boolean): void => {
    liveRef.current = next;
    setLive(next);
    if (!next) seal();
  };
  const change: ChangeSlide = (key, update) => {
    if (!slide) return;
    const id = slide.id;
    dispatch({
      type: "change",
      key,
      change: (current) => changeSlide(current, id, update),
    });
    if (!liveRef.current && !RUNNING.test(key)) seal();
  };
  const undo = (): void => {
    dispatch({ type: "undo" });
  };
  const redo = (): void => {
    dispatch({ type: "redo" });
  };
  const duplicate = (): void => {
    if (slide) dispatch({ type: "duplicate", id: slide.id });
  };
  const shortcuts = { enabled: presenting === null };
  useShortcut("mod+z", undo, shortcuts);
  useShortcut("mod+shift+z", redo, shortcuts);
  useShortcut("mod+d", duplicate, shortcuts);

  const endArrange = (keep: boolean): void => {
    if (!arrange) return;
    if (!keep && slide && slide.position !== arrange.from) {
      const from = arrange.from;
      change(`position:${slide.id}`, (current) => ({
        ...current,
        position: from,
      }));
    }
    setArrange(null);
  };
  useShortcut(
    "escape",
    () => {
      endArrange(true);
    },
    { enabled: arranging && presenting === null },
  );

  const startArrange = (keyboard: boolean): void => {
    if (!slide || arranging) return;
    setArrange({ id: slide.id, from: slide.position, keyboard });
  };

  const remove = (id: string): void => {
    const at = deck.slides.findIndex((candidate) => candidate.id === id);
    const removed = deck.slides[at];
    if (!removed) return;
    if (deck.slides.length === 1) focusNewSlide.current = true;
    dispatch({ type: "remove", id });
    toast(`Deleted slide ${String(at + 1)}`, {
      id: "slide-deleted",
      action: {
        label: "Undo",
        altText: `Undo with ${isApplePlatform() ? "Command" : "Control"} Z`,
        onAction: () => {
          dispatch({ type: "restore", slide: removed, index: at });
        },
      },
    });
  };

  const exportSlide = (): void => {
    const drawn = canvas.current?.querySelector<HTMLElement>(".dh-slide");
    if (!slide || !drawn) return;
    const name = fileName(deck.name, index + 1);
    void slideBlob(drawn, slide.fill, deck.size)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        link.click();
        window.setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
        toast(`Exported ${name}`, { id: "export" });
      })
      .catch(() => {
        toast("Couldn't export the slide", { id: "export" });
      });
  };

  const copySlide = (): void => {
    const drawn = canvas.current?.querySelector<HTMLElement>(".dh-slide");
    if (!slide || !drawn) return;
    const number = index + 1;
    void Promise.resolve()
      .then(() =>
        navigator.clipboard.write([
          new ClipboardItem({
            "image/png": slideBlob(drawn, slide.fill, deck.size),
          }),
        ]),
      )
      .then(() => {
        toast(`Copied slide ${String(number)} as an image`, { id: "copy" });
      })
      .catch(() => {
        toast("Couldn't copy here. Export it instead.", { id: "copy" });
      });
  };

  const present = (trigger?: HTMLElement): void => {
    if (!slide) return;
    opener.current =
      trigger ??
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);
    setArrange(null);
    setPresenting(Math.max(index, 0));
  };
  const stopPresenting = (): void => {
    flushSync(() => {
      setPresenting(null);
    });
    const back = opener.current?.isConnected
      ? opener.current
      : document.querySelector<HTMLElement>(
          '[data-bt="HeaderBar"] button[aria-label="More actions"]',
        );
    back?.focus();
  };

  const focusField = (field: string): void => {
    const input = inputFor(field);
    if (input) {
      input.focus();
      return;
    }
    pendingField.current = field;
    setSheetOpen(true);
  };

  const addFromSheet = (): void => {
    flushSync(() => {
      dispatch({ type: "add", layout: "title" });
    });
    const title = inputFor("title");
    title?.focus();
    if (title instanceof HTMLInputElement) title.select();
  };

  const editAt = (event: MouseEvent): void => {
    const field =
      event.target instanceof Element
        ? event.target.closest("[data-dh-field]")?.getAttribute("data-dh-field")
        : undefined;
    if (field === undefined || field === null) return;
    setArrange(null);
    focusField(field);
  };
  const edits = useRef(editAt);
  useEffect(() => {
    edits.current = editAt;
  });
  const stageArea = useCallback((element: HTMLDivElement | null) => {
    if (!element) return undefined;
    const listen = (event: MouseEvent): void => {
      edits.current(event);
    };
    element.addEventListener("dblclick", listen);
    return () => {
      element.removeEventListener("dblclick", listen);
    };
  }, []);

  const leaveWords = (event: PointerEvent<HTMLDivElement>): void => {
    if (
      arranging &&
      event.target instanceof Node &&
      !box.current?.contains(event.target)
    )
      endArrange(true);
  };

  const followWords = (): void => {
    const current = wordsDrag.current;
    const element = place.current;
    if (!current || !element) return;
    const dx = current.x - current.startX;
    const dy = current.y - current.startY;
    element.style.translate = `${String(dx)}px ${String(dy)}px`;
    const spot = nearestAnchor(
      share(
        current.place.left + dx - current.room.left,
        current.room.width - current.place.width,
      ),
      share(
        current.place.top + dy - current.room.top,
        current.room.height - current.place.height,
      ),
    );
    setTarget(spot);
  };

  const boxEvents = {
    onPointerDown: (event: PointerEvent<HTMLDivElement>): void => {
      const room = place.current?.parentElement;
      if (event.button !== 0 || !slide || !place.current || !room) return;
      startArrange(false);
      const style = getComputedStyle(room);
      const bounds = room.getBoundingClientRect();
      const padX = Number.parseFloat(style.paddingLeft);
      const padY = Number.parseFloat(style.paddingTop);
      wordsDrag.current = {
        pointer: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        place: place.current.getBoundingClientRect(),
        room: new DOMRect(
          bounds.left + padX,
          bounds.top + padY,
          bounds.width - 2 * padX,
          bounds.height - 2 * padY,
        ),
        started: false,
        x: event.clientX,
        y: event.clientY,
        frame: 0,
      };
    },
    onPointerMove: (event: PointerEvent<HTMLDivElement>): void => {
      const current = wordsDrag.current;
      if (current?.pointer !== event.pointerId) return;
      current.x = event.clientX;
      current.y = event.clientY;
      if (!current.started) {
        if (
          Math.hypot(current.x - current.startX, current.y - current.startY) <
          DRAG_FROM
        )
          return;
        current.started = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
      }
      cancelAnimationFrame(current.frame);
      current.frame = requestAnimationFrame(followWords);
    },
    onPointerUp: (event: PointerEvent<HTMLDivElement>): void => {
      const current = wordsDrag.current;
      if (current?.pointer !== event.pointerId) return;
      wordsDrag.current = null;
      cancelAnimationFrame(current.frame);
      if (!current.started || !slide) return;
      const dx = current.x - current.startX;
      const dy = current.y - current.startY;
      const spot = nearestAnchor(
        share(
          current.place.left + dx - current.room.left,
          current.room.width - current.place.width,
        ),
        share(
          current.place.top + dy - current.room.top,
          current.room.height - current.place.height,
        ),
      );
      setDragging(false);
      setTarget(null);
      setDrops((count) => count + 1);
      change(`position:${slide.id}`, (currentSlide) => ({
        ...currentSlide,
        position: spot,
      }));
    },
    onPointerCancel: (event: PointerEvent<HTMLDivElement>): void => {
      const current = wordsDrag.current;
      if (current?.pointer !== event.pointerId) return;
      wordsDrag.current = null;
      cancelAnimationFrame(current.frame);
      if (!current.started) return;
      setDragging(false);
      setTarget(null);
      setDrops((count) => count + 1);
    },
  };

  const { width, height } = SLIDE_SIZES[deck.size];
  const workStyle: CSSProperties &
    Readonly<Record<"--bt-deckhand-ratio", string>> = {
    "--bt-deckhand-ratio": String(width / height),
  };

  const atDefault =
    slide !== null && slide.position === LAYOUT_DEFAULTS[slide.layout].position;
  const resetPosition = (): void => {
    if (!slide || atDefault) return;
    change(`position:${slide.id}`, (current) => ({
      ...current,
      position: LAYOUT_DEFAULTS[current.layout].position,
    }));
  };

  return (
    <div className="dh-root" data-testid="deckhand" inert={presenting !== null}>
      <AppShell
        inspectorLabel="Slide settings"
        openInspectorLabel="Edit slide"
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        header={
          <DeckHeader
            name={deck.name}
            size={deck.size}
            hasSlide={slide !== null}
            arranging={arranging}
            canUndo={history.past.length > 0}
            canRedo={history.future.length > 0}
            onPresent={present}
            onSize={(size: SlideSize) => {
              dispatch({
                type: "change",
                key: "slide-size",
                change: (current) => ({ ...current, size }),
              });
              seal();
            }}
            onArrange={() => {
              if (arranging) endArrange(true);
              else startArrange(true);
            }}
            onExport={exportSlide}
            onCopy={copySlide}
            onDuplicate={duplicate}
            onDelete={() => {
              if (slide) remove(slide.id);
            }}
            onRename={() => {
              setDraftName(deck.name);
              setRenaming(true);
            }}
            onUndo={undo}
            onRedo={redo}
            onHelp={() => {
              setTourOpen(true);
            }}
          />
        }
        inspector={
          slide ? (
            <DeckInspector
              slide={slide}
              onChange={change}
              onSeal={seal}
              onLive={onLive}
              onLayout={(layout: Layout) => {
                change(`layout:${slide.id}`, (current) =>
                  withLayout(current, layout),
                );
              }}
            />
          ) : (
            <EmptyDeckInspector onAdd={sheetOpen ? addFromSheet : undefined} />
          )
        }
      >
        <div className="dh-work" style={workStyle}>
          <div
            ref={stageArea}
            className="dh-stage"
            data-empty={slide ? undefined : ""}
            onPointerDown={leaveWords}
          >
            {slide ? (
              <ContextMenu>
                <ContextMenu.Trigger asChild>
                  <Stage
                    label={`${slideName(slide, index)}, ${String(index + 1)} of ${String(deck.slides.length)}`}
                    size={SLIDE_SIZES[deck.size]}
                    background={fillCss(slide.fill)}
                    canvasRef={canvas}
                    role="region"
                    aria-label="Current slide"
                    tabIndex={0}
                    className="dh-stage-region bt-focus"
                    onContextMenu={(event) => {
                      pointedField.current =
                        event.target instanceof Element
                          ? (event.target
                              .closest("[data-dh-field]")
                              ?.getAttribute("data-dh-field") ?? null)
                          : null;
                    }}
                  >
                    <StageSlide
                      slide={slide}
                      size={deck.size}
                      live={live}
                      arranging={arranging}
                      drops={drops}
                      target={target ?? slide.position}
                      placeRef={place}
                      boxRef={box}
                      dragging={dragging}
                      boxEvents={boxEvents}
                    />
                  </Stage>
                </ContextMenu.Trigger>
                <ContextMenu.Content aria-label="Current slide">
                  <ContextMenu.Item
                    icon={PenLine}
                    onSelect={() => {
                      const field = pointedField.current ?? "title";
                      setArrange(null);
                      focusField(field);
                    }}
                  >
                    Edit text
                  </ContextMenu.Item>
                  <ContextMenu.CheckboxItem
                    icon={Move}
                    checked={arranging}
                    onCheckedChange={(on) => {
                      if (on) startArrange(lastInput() === "keyboard");
                      else endArrange(true);
                    }}
                  >
                    Arrange
                  </ContextMenu.CheckboxItem>
                  <ContextMenu.Item
                    icon={RotateCcw}
                    disabled={atDefault}
                    onSelect={resetPosition}
                  >
                    Reset position
                  </ContextMenu.Item>
                  <ContextMenu.Separator />
                  <ContextMenu.Sub>
                    <ContextMenu.SubTrigger icon={LayoutTemplate}>
                      Layout
                    </ContextMenu.SubTrigger>
                    <ContextMenu.SubContent>
                      <ContextMenu.RadioGroup
                        value={slide.layout}
                        onValueChange={(layout) => {
                          if (!isLayout(layout)) return;
                          change(`layout:${slide.id}`, (current) =>
                            withLayout(current, layout),
                          );
                        }}
                      >
                        {LAYOUT_OPTIONS.map((option) => (
                          <ContextMenu.RadioItem
                            key={option.value}
                            value={option.value}
                            icon={LAYOUT_ICONS[option.value]}
                          >
                            {option.label}
                          </ContextMenu.RadioItem>
                        ))}
                      </ContextMenu.RadioGroup>
                    </ContextMenu.SubContent>
                  </ContextMenu.Sub>
                  <ContextMenu.Sub>
                    <ContextMenu.SubTrigger icon={Palette}>
                      Look
                    </ContextMenu.SubTrigger>
                    <ContextMenu.SubContent>
                      <ContextMenu.RadioGroup
                        label="Fill"
                        value={slide.fill.kind}
                        onValueChange={(kind) => {
                          if (!isFillKind(kind)) return;
                          change(`fill:${slide.id}`, (current) => ({
                            ...current,
                            fill: switchFill(current.fill, kind),
                          }));
                        }}
                      >
                        {FILLS.map((option) => (
                          <ContextMenu.RadioItem
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </ContextMenu.RadioItem>
                        ))}
                      </ContextMenu.RadioGroup>
                      <ContextMenu.Separator />
                      <ContextMenu.RadioGroup
                        label="Box"
                        value={slide.box}
                        onValueChange={(next) => {
                          if (!isBox(next)) return;
                          change(`box:${slide.id}`, (current) => ({
                            ...current,
                            box: next,
                          }));
                        }}
                      >
                        {BOXES.map((option) => (
                          <ContextMenu.RadioItem
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </ContextMenu.RadioItem>
                        ))}
                      </ContextMenu.RadioGroup>
                      <ContextMenu.Separator />
                      <ContextMenu.Item
                        disabled={!lookChanged(slide)}
                        onSelect={() => {
                          change(`reset-look:${slide.id}`, (current) => ({
                            ...current,
                            ...LOOK_DEFAULTS,
                          }));
                        }}
                      >
                        Reset the look
                      </ContextMenu.Item>
                    </ContextMenu.SubContent>
                  </ContextMenu.Sub>
                </ContextMenu.Content>
              </ContextMenu>
            ) : (
              <EmptyState
                icon={Presentation}
                title="No slides yet"
                description="Add a slide to start the deck again, or undo to bring back the last one."
                actions={
                  <Button
                    ref={newSlideButton}
                    variant="primary"
                    iconStart={Plus}
                    onClick={() => {
                      dispatch({ type: "add", layout: "title" });
                    }}
                  >
                    New slide
                  </Button>
                }
              />
            )}
          </div>
          <SlideStrip
            deck={deck}
            selected={selected}
            onSelect={(id) => {
              dispatch({ type: "select", id });
            }}
            onMove={(id, to, key) => {
              dispatch({ type: "move", id, to, key });
            }}
            onMoveEnd={seal}
            onDelete={remove}
            onAdd={(layout) => {
              dispatch({ type: "add", layout });
            }}
            onDuplicate={(id) => {
              dispatch({ type: "duplicate", id });
            }}
            onCopy={copySlide}
          />
        </div>
      </AppShell>
      {slide ? (
        <FloatingToolbar
          anchor={box}
          label="Arrange the words"
          meta={ANCHOR_NAMES[target ?? slide.position]}
          open={arranging}
          delayed
          focusOnOpen={arrange?.keyboard ?? false}
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            endArrange(true);
          }}
        >
          <FloatingToolbar.Button
            variant="ghost"
            aria-disabled={atDefault}
            onClick={resetPosition}
          >
            Reset
          </FloatingToolbar.Button>
          <FloatingToolbar.Button
            onClick={() => {
              endArrange(false);
            }}
          >
            Cancel
          </FloatingToolbar.Button>
          <FloatingToolbar.Button
            variant="primary"
            onClick={() => {
              endArrange(true);
            }}
          >
            Done
          </FloatingToolbar.Button>
        </FloatingToolbar>
      ) : null}
      <FormDialog
        open={renaming}
        onOpenChange={setRenaming}
        title="Rename deck"
        description="The name shows in the header and names the images you export."
        valid={draftName.trim() !== ""}
        submitLabel="Rename"
        onSubmit={() => {
          const name = draftName.trim();
          dispatch({
            type: "change",
            key: "name",
            change: (current) => ({ ...current, name }),
          });
          seal();
        }}
      >
        <TextField
          label="Deck name"
          value={draftName}
          onValueChange={setDraftName}
        />
      </FormDialog>
      <DeckTour open={tourOpen} onOpenChange={setTourOpen} />
      {presenting !== null ? (
        <Presenter deck={deck} start={presenting} onClose={stopPresenting} />
      ) : null}
    </div>
  );
}
