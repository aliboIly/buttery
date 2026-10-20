import { useEffect, useReducer, useRef, useState } from "react";
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
import { StudioInspector } from "./StudioInspector.tsx";
import type { ChangeCard } from "./StudioInspector.tsx";
import { TitleCard } from "./TitleCard.tsx";
import { SHAPE_SIZES, STUDIO_START, newCard, studioReducer } from "./state.ts";
import type { Background, Shape } from "./state.ts";
import "./card-studio.css";

/** Changes that run on, like typing, and join one undo step until something else changes. */
const RUNNING_KEYS = new Set(["title"]);

function backgroundCss(background: Background): string {
  switch (background.kind) {
    case "gradient":
      return `linear-gradient(${String(background.angle)}deg in oklab, ${background.from}, ${background.to})`;
    case "solid":
      return background.color;
    case "image":
      return `center / cover no-repeat url("${background.url}")`;
    default: {
      const unknown: never = background;
      return unknown;
    }
  }
}

/** The size crop mode started from, to go back to on Reset or Cancel. */
interface CropStart {
  readonly shape: Shape;
  readonly width: number;
  readonly height: number;
}

/** Card Studio: style a title card, then export it as an image. */
export function CardStudio(): ReactElement {
  const [studio, dispatch] = useReducer(studioReducer, STUDIO_START);
  const [live, setLive] = useState(false);
  const liveRef = useRef(false);
  const [crop, setCrop] = useState<CropStart | null>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const images = useRef<string[]>([]);
  const card = studio.card;

  useEffect(
    () => () => {
      for (const url of images.current) URL.revokeObjectURL(url);
    },
    [],
  );

  const onLive = (next: boolean): void => {
    liveRef.current = next;
    setLive(next);
    if (!next) dispatch({ type: "seal" });
  };
  const change: ChangeCard = (key, update) => {
    dispatch({ type: "change", key, change: update });
    if (!liveRef.current && !RUNNING_KEYS.has(key)) dispatch({ type: "seal" });
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
    setCrop(null);
    dispatch({ type: "set", card: null });
    toast("Card removed", {
      id: "card-removed",
      action: {
        label: "Undo",
        altText: "Undo with Command Z",
        onAction: () => {
          dispatch({ type: "set", card });
        },
      },
    });
  };

  const takeImage = (files: readonly File[]): void => {
    const [file] = files;
    if (!file) return;
    const url = URL.createObjectURL(file);
    images.current.push(url);
    const background: Background = { kind: "image", url, name: file.name };
    if (card) change("background", (current) => ({ ...current, background }));
    else dispatch({ type: "set", card: { ...newCard(), background } });
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
    navigator.clipboard
      .write([new ClipboardItem({ "image/png": cardBlob(card, "png", 1) })])
      .then(() => {
        toast("Copied the card", { id: "copy" });
      })
      .catch(() => {
        toast("Couldn't copy here. Export it instead.", { id: "copy" });
      });
  };

  const startCrop = (): void => {
    if (!card) return;
    setCrop({ shape: card.shape, width: card.width, height: card.height });
  };
  const endCrop = (keep: boolean): void => {
    if (crop && !keep) {
      dispatch({ type: "set", card: card ? { ...card, ...crop } : null });
    }
    setCrop(null);
  };

  return (
    <div className="cs-root" data-testid="card-studio">
      <AppShell
        inspectorLabel="Card settings"
        openInspectorLabel="Edit card"
        header={
          <StudioHeader
            card={card}
            canUndo={studio.past.length > 0}
            canRedo={studio.future.length > 0}
            onCrop={startCrop}
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
            onUndo={undo}
            onRedo={redo}
            onHelp={() => {
              toast(
                "Pick a background, drag the tilt pad for depth, then export.",
                {
                  id: "help",
                },
              );
            }}
          />
        }
        inspector={
          <StudioInspector
            card={card ?? newCard()}
            exportable={card !== null}
            onChange={change}
            onLive={onLive}
            onCopy={copyCard}
            onExport={exportCard}
          />
        }
      >
        {card ? (
          <Stage
            label={`Card preview: ${card.title}`}
            size={{ width: card.width, height: card.height }}
            background={backgroundCss(card.background)}
            cropping={crop !== null}
            canvasRef={canvas}
            onSizeChange={(size) => {
              change("crop", (current) => ({
                ...current,
                shape: "custom",
                ...size,
              }));
            }}
          >
            <TitleCard card={card} live={live} />
          </Stage>
        ) : (
          <DropZone accept="image/*" onFiles={takeImage}>
            <EmptyState
              title="Add a card"
              description="Drop an image for the background, or paste one with ⌘V."
              actions={
                <>
                  <Button
                    variant="primary"
                    onClick={() => {
                      dispatch({ type: "set", card: newCard() });
                    }}
                  >
                    New card
                  </Button>
                  <DropZone.Open>
                    <Button variant="secondary">Choose image</Button>
                  </DropZone.Open>
                </>
              }
            />
          </DropZone>
        )}
      </AppShell>
      {card ? (
        <FloatingToolbar
          anchor={canvas}
          label="Crop"
          meta={`${String(card.width)} × ${String(card.height)}`}
          open={crop !== null}
          delayed
        >
          <FloatingToolbar.Button
            variant="ghost"
            aria-disabled={
              crop === null ||
              (crop.width === card.width && crop.height === card.height)
            }
            onClick={() => {
              if (crop) dispatch({ type: "set", card: { ...card, ...crop } });
            }}
          >
            Reset
          </FloatingToolbar.Button>
          <FloatingToolbar.Button
            onClick={() => {
              endCrop(false);
            }}
          >
            Cancel
          </FloatingToolbar.Button>
          <FloatingToolbar.Button
            variant="primary"
            onClick={() => {
              endCrop(true);
            }}
          >
            Apply crop
          </FloatingToolbar.Button>
        </FloatingToolbar>
      ) : null}
    </div>
  );
}
