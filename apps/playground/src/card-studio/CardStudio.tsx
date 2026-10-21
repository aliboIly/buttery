import {
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import type { ReactElement } from "react";
import { useShortcut } from "@buttery/core";
import {
  AppShell,
  Button,
  DropZone,
  EmptyState,
  FloatingToolbar,
  Stage,
  toast,
} from "@buttery/react";
import { cardBlob, fileName } from "./export.ts";
import { StudioHeader } from "./StudioHeader.tsx";
import { StudioTour, tourIsNew } from "./StudioTour.tsx";
import { EmptyStudioInspector, StudioInspector } from "./StudioInspector.tsx";
import type { ChangeCard } from "./StudioInspector.tsx";
import { TitleCard } from "./TitleCard.tsx";
import { SHAPE_SIZES, STUDIO_START, newCard, studioReducer } from "./state.ts";
import type { Backdrop, Shape } from "./state.ts";
import "./card-studio.css";

/**
 * Changes that run on, like typing, a color picker or a resize, and join one undo step until they're
 * sealed or something else changes.
 */
const RUNNING_KEYS = new Set([
  "title",
  "first-hue",
  "second-hue",
  "flat-hue",
  "size",
  "resize",
]);

function backdropCss(backdrop: Backdrop): string {
  switch (backdrop.kind) {
    case "blend":
      return `linear-gradient(${String(backdrop.sweep)}deg in oklab, ${backdrop.from}, ${backdrop.to})`;
    case "flat":
      return backdrop.color;
    case "picture":
      return `center / cover no-repeat url("${backdrop.url}")`;
    default: {
      const unknown: never = backdrop;
      return unknown;
    }
  }
}

/** The size resize mode started from, to go back to on Revert or Discard, and how long the history was then. */
interface ResizeStart {
  readonly shape: Shape;
  readonly width: number;
  readonly height: number;
  readonly history: number;
}

/** Card Studio: style a title card, then export it as an image. */
export function CardStudio(): ReactElement {
  const [studio, dispatch] = useReducer(studioReducer, STUDIO_START);
  const [tourOpen, setTourOpen] = useState(tourIsNew);
  const [live, setLive] = useState(false);
  const liveRef = useRef(false);
  const [resize, setResize] = useState<ResizeStart | null>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const newCardButton = useRef<HTMLButtonElement>(null);
  const focusNewCard = useRef(false);
  const images = useRef<string[]>([]);
  const card = studio.card;

  useEffect(
    () => () => {
      for (const url of images.current) URL.revokeObjectURL(url);
    },
    [],
  );

  useLayoutEffect(() => {
    if (card !== null || !focusNewCard.current) return;
    focusNewCard.current = false;
    newCardButton.current?.focus();
  }, [card]);

  const seal = (): void => {
    dispatch({ type: "seal" });
  };
  const onLive = (next: boolean): void => {
    liveRef.current = next;
    setLive(next);
    if (!next) seal();
  };
  const change: ChangeCard = (key, update) => {
    dispatch({ type: "change", key, change: update });
    if (!liveRef.current && !RUNNING_KEYS.has(key)) seal();
  };
  const undo = (): void => {
    dispatch({ type: "undo" });
  };
  const redo = (): void => {
    dispatch({ type: "redo" });
  };
  useShortcut("mod+z", undo);
  useShortcut("mod+shift+z", redo);

  const remove = (): void => {
    if (!card) return;
    setResize(null);
    focusNewCard.current = true;
    dispatch({ type: "set", card: null });
    const key = /Mac|iPhone|iPad/.test(navigator.userAgent)
      ? "Command"
      : "Control";
    toast("Card deleted", {
      id: "card-deleted",
      action: {
        label: "Undo",
        altText: `Undo with ${key} Z`,
        onAction: () => {
          dispatch({ type: "restore" });
        },
      },
    });
  };

  const takePicture = (files: readonly File[]): void => {
    const [file] = files;
    if (!file) return;
    const url = URL.createObjectURL(file);
    images.current.push(url);
    const backdrop: Backdrop = { kind: "picture", url, name: file.name };
    if (card) change("backdrop", (current) => ({ ...current, backdrop }));
    else dispatch({ type: "set", card: { ...newCard(), backdrop } });
  };

  const exportCard = (format: "png" | "jpg", scale: 1 | 2): void => {
    if (!card) return;
    void cardBlob(card, format, scale)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName(card, format);
        link.click();
        window.setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
        toast(`Exported ${fileName(card, format)}`, { id: "export" });
      })
      .catch(() => {
        toast("Couldn't export the card", { id: "export" });
      });
  };

  const copyCard = (): void => {
    if (!card) return;
    void Promise.resolve()
      .then(() =>
        navigator.clipboard.write([
          new ClipboardItem({ "image/png": cardBlob(card, "png", 1) }),
        ]),
      )
      .then(() => {
        toast("Copied the card", { id: "copy" });
      })
      .catch(() => {
        toast("Couldn't copy here. Export it instead.", { id: "copy" });
      });
  };

  const startResize = (): void => {
    if (!card || resize) return;
    setResize({
      shape: card.shape,
      width: card.width,
      height: card.height,
      history: studio.past.length,
    });
  };
  const resized =
    card !== null &&
    resize !== null &&
    (card.width !== resize.width || card.height !== resize.height);
  const endResize = (keep: boolean): void => {
    if (!resize) return;
    const fresh =
      studio.open === "resize" && studio.past.length === resize.history + 1;
    if (keep || !resized) {
      seal();
    } else if (fresh) {
      dispatch({ type: "drop", key: "resize" });
    } else {
      dispatch({
        type: "set",
        card: {
          ...card,
          shape: resize.shape,
          width: resize.width,
          height: resize.height,
        },
      });
    }
    setResize(null);
  };

  return (
    <div className="cs-root" data-testid="card-studio">
      <AppShell
        inspectorLabel="Card settings"
        openInspectorLabel="Edit card"
        header={
          <StudioHeader
            card={card}
            resizing={resize !== null}
            canUndo={studio.past.length > 0}
            canRedo={studio.future.length > 0}
            onResize={startResize}
            onDelete={remove}
            onShape={(shape) => {
              change("shape", (current) => ({
                ...current,
                shape,
                ...SHAPE_SIZES[shape],
              }));
            }}
            onSize={(size) => {
              change("size", (current) => ({
                ...current,
                shape: "custom",
                ...size,
              }));
            }}
            onSizeCommit={seal}
            onUndo={undo}
            onRedo={redo}
            onHelp={() => {
              setTourOpen(true);
            }}
          />
        }
        inspector={
          card ? (
            <StudioInspector
              card={card}
              exportable
              onChange={change}
              onSeal={seal}
              onLive={onLive}
              onPicture={takePicture}
              onCopy={copyCard}
              onExport={exportCard}
            />
          ) : (
            <EmptyStudioInspector />
          )
        }
      >
        <DropZone accept="image/*" onFiles={takePicture}>
          {card ? (
            <Stage
              label={`Card preview: ${card.title}`}
              size={{ width: card.width, height: card.height }}
              background={backdropCss(card.backdrop)}
              cropping={resize !== null}
              canvasRef={canvas}
              onSizeChange={(size) => {
                change("resize", (current) => ({
                  ...current,
                  shape: "custom",
                  ...size,
                }));
              }}
            >
              <TitleCard card={card} live={live} />
            </Stage>
          ) : (
            <EmptyState
              title="No card yet"
              description="Start a new card, or drag a picture in for its backdrop. Pasting one works too."
              actions={
                <>
                  <Button
                    ref={newCardButton}
                    variant="primary"
                    onClick={() => {
                      dispatch({ type: "set", card: newCard() });
                    }}
                  >
                    New card
                  </Button>
                  <DropZone.Open>
                    <Button variant="secondary">Pick a picture</Button>
                  </DropZone.Open>
                </>
              }
            />
          )}
        </DropZone>
        <StudioTour open={tourOpen} onOpenChange={setTourOpen} />
      </AppShell>
      {card ? (
        <FloatingToolbar
          anchor={canvas}
          label="Canvas size"
          meta={`${String(card.width)} × ${String(card.height)}`}
          open={resize !== null}
          delayed
          focusOnOpen
        >
          <FloatingToolbar.Button
            variant="ghost"
            aria-disabled={!resized}
            onClick={() => {
              if (resize && resized) {
                change("resize", (current) => ({
                  ...current,
                  shape: resize.shape,
                  width: resize.width,
                  height: resize.height,
                }));
              }
            }}
          >
            Revert
          </FloatingToolbar.Button>
          <FloatingToolbar.Button
            onClick={() => {
              endResize(false);
            }}
          >
            Discard
          </FloatingToolbar.Button>
          <FloatingToolbar.Button
            variant="primary"
            onClick={() => {
              endResize(true);
            }}
          >
            Keep size
          </FloatingToolbar.Button>
        </FloatingToolbar>
      ) : null}
    </div>
  );
}
