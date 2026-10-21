import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Morph, Text } from "@buttery/core";
import { gradientCss, gradients, solids } from "@buttery/core/palettes";
import {
  AnchorGrid,
  Button,
  Chip,
  ColorDot,
  DropZone,
  EmptyState,
  IconButton,
  Inspector,
  SegmentedControl,
  Slider,
  SplitButton,
  SwatchGrid,
  TextField,
  TiltPad,
} from "@buttery/react";
import type { Swatch } from "@buttery/react";
import { ArrowLeftRight, Copy } from "lucide-react";
import {
  BACKDROP_DEFAULT,
  CARD_DEFAULTS,
  DEFAULT_SWEEP,
  PLACEMENT_DEFAULTS,
  backdropChanged,
  blendFrom,
  cardChanged,
  flatFrom,
  placementChanged,
} from "./state.ts";
import type { Backdrop, Card, Finish } from "./state.ts";

const BLEND_SWATCHES: readonly Swatch[] = gradients.map((preset) => ({
  value: preset.id,
  label: preset.name,
  fill: gradientCss(preset),
}));

const FLAT_SWATCHES: readonly Swatch[] = solids.map((solid) => ({
  value: solid.id,
  label: solid.name,
  fill: solid.hex,
}));

type Fill = Backdrop["kind"];

/** The card's settings that are numbers, which sliders set. */
type NumberSetting = {
  readonly [Key in keyof Card]: Card[Key] extends number ? Key : never;
}[keyof Card];

/** How the inspector changes the card: a key that merges a drag into one undo step, and the change. */
export type ChangeCard = (key: string, change: (card: Card) => Card) => void;

/** Changes the blend's hues or sweep, leaving any other backdrop as it is. */
function blendWith(
  card: Card,
  change: (backdrop: Extract<Backdrop, { kind: "blend" }>) => Backdrop,
): Card {
  return card.backdrop.kind === "blend"
    ? { ...card, backdrop: change(card.backdrop) }
    : card;
}

/** The footer: Copy and Export, unavailable while there's no card. */
function StudioFooter({
  exportable,
  onCopy,
  onExport,
}: {
  readonly exportable: boolean;
  readonly onCopy: () => void;
  readonly onExport: (format: "png" | "jpg", scale: 1 | 2) => void;
}): ReactElement {
  return (
    <Inspector.Footer>
      <Button
        className="cs-copy"
        iconStart={Copy}
        aria-disabled={!exportable}
        onClick={onCopy}
      >
        Copy
      </Button>
      <SplitButton
        className="cs-export"
        menuLabel="More export options"
        disabled={!exportable}
        onClick={() => {
          onExport("png", 1);
        }}
        items={[
          {
            label: "Export JPG",
            onSelect: () => {
              onExport("jpg", 1);
            },
          },
          {
            label: "Export PNG at 2×",
            onSelect: () => {
              onExport("png", 2);
            },
          },
        ]}
      >
        Export PNG
      </SplitButton>
    </Inspector.Footer>
  );
}

/** The inspector while there's no card: nothing to style yet, with Copy and Export unavailable. */
export function EmptyStudioInspector(): ReactElement {
  return (
    <Inspector
      label="Card settings"
      footer={
        <StudioFooter
          exportable={false}
          onCopy={() => undefined}
          onExport={() => undefined}
        />
      }
    >
      <EmptyState
        title="Nothing to style"
        description="Start a new card, and its settings show up here."
      />
    </Inspector>
  );
}

/** The inspector's controls for the card, its placement and its backdrop, with Copy and Export below. */
export function StudioInspector({
  card,
  exportable,
  onChange,
  onSeal,
  onLive,
  onPicture,
  onCopy,
  onExport,
}: {
  readonly card: Card;
  readonly exportable: boolean;
  readonly onChange: ChangeCard;
  /** Closes the open undo step, once a color picker or a typed field settles. */
  readonly onSeal: () => void;
  readonly onLive: (live: boolean) => void;
  readonly onPicture: (files: readonly File[]) => void;
  readonly onCopy: () => void;
  readonly onExport: (format: "png" | "jpg", scale: 1 | 2) => void;
}): ReactElement {
  const backdrop = card.backdrop;
  const [choosing, setChoosing] = useState(false);
  const fill: Fill = choosing ? "picture" : backdrop.kind;
  const level = card.lean.x === 0 && card.lean.y === 0;
  const live = {
    onValueCommit: () => {
      onLive(false);
    },
  };
  const slide =
    (key: NumberSetting) =>
    (value: number): void => {
      onLive(true);
      onChange(key, (current) => ({ ...current, [key]: value }));
    };

  return (
    <Inspector
      label="Card settings"
      footer={
        <StudioFooter
          exportable={exportable}
          onCopy={onCopy}
          onExport={onExport}
        />
      }
    >
      <Inspector.Section
        title="Card"
        resettable={cardChanged(card)}
        onReset={() => {
          onLive(false);
          onChange("reset-card", (current) => ({
            ...current,
            ...CARD_DEFAULTS,
          }));
        }}
      >
        <Inspector.Row block>
          <TextField
            label="Title"
            value={card.title}
            onValueChange={(title) => {
              onChange("title", (current) => ({ ...current, title }));
            }}
          />
        </Inspector.Row>
        <Inspector.Row label="Finish">
          <SegmentedControl<Finish>
            label="Finish"
            options={[
              { value: "clear", label: "Clear" },
              { value: "paper", label: "Paper" },
              { value: "graphite", label: "Ink" },
            ]}
            value={card.finish}
            onValueChange={(finish) => {
              onLive(false);
              onChange("finish", (current) => ({ ...current, finish }));
            }}
          />
        </Inspector.Row>
        <Inspector.Row>
          <Slider
            label="Corners"
            min={0}
            max={80}
            resetValue={CARD_DEFAULTS.corners}
            value={card.corners}
            onValueChange={slide("corners")}
            {...live}
          />
        </Inspector.Row>
        <Inspector.Row>
          <Slider
            label="Spacing"
            min={0}
            max={120}
            resetValue={CARD_DEFAULTS.spacing}
            value={card.spacing}
            onValueChange={slide("spacing")}
            {...live}
          />
        </Inspector.Row>
        <Inspector.Row>
          <Slider
            label="Depth"
            format="%"
            min={0}
            max={100}
            resetValue={CARD_DEFAULTS.depth}
            value={card.depth}
            disabled={card.finish === "clear"}
            onValueChange={slide("depth")}
            {...live}
          />
        </Inspector.Row>
      </Inspector.Section>

      <Inspector.Section
        title="Placement"
        resettable={placementChanged(card)}
        onReset={() => {
          onLive(false);
          onChange("reset-placement", (current) => ({
            ...current,
            ...PLACEMENT_DEFAULTS,
          }));
        }}
      >
        <Inspector.Row>
          <Slider
            label="Scale"
            format="%"
            min={20}
            max={100}
            resetValue={PLACEMENT_DEFAULTS.scale}
            value={card.scale}
            onValueChange={slide("scale")}
            {...live}
          />
        </Inspector.Row>
        <Inspector.Row>
          <Slider
            label="Turn"
            format="°"
            min={-180}
            max={180}
            detents={[0]}
            resetValue={PLACEMENT_DEFAULTS.turn}
            value={card.turn}
            onValueChange={slide("turn")}
            {...live}
          />
        </Inspector.Row>
        <Inspector.Row.Split>
          <Inspector.Row label="Anchor">
            <AnchorGrid
              label="Anchor"
              value={card.anchor}
              onValueChange={(anchor) => {
                onLive(false);
                onChange("anchor", (current) => ({ ...current, anchor }));
              }}
            />
          </Inspector.Row>
          <Inspector.Row
            label="Lean"
            extra={
              <Chip
                aria-disabled={level}
                onClick={() => {
                  if (level) return;
                  onLive(false);
                  onChange("level", (current) => ({
                    ...current,
                    lean: PLACEMENT_DEFAULTS.lean,
                  }));
                }}
              >
                Flat
              </Chip>
            }
          >
            <TiltPad
              label="Lean"
              value={card.lean}
              onValueChange={(lean) => {
                onLive(true);
                onChange("lean", (current) => ({ ...current, lean }));
              }}
              onValueCommit={() => {
                onLive(false);
              }}
            />
          </Inspector.Row>
        </Inspector.Row.Split>
      </Inspector.Section>

      <Inspector.Section
        title="Backdrop"
        resettable={backdropChanged(card)}
        onReset={() => {
          setChoosing(false);
          onChange("reset-backdrop", (current) => ({
            ...current,
            backdrop: BACKDROP_DEFAULT,
          }));
        }}
      >
        <Inspector.Row label="Fill">
          <SegmentedControl<Fill>
            label="Fill"
            options={[
              { value: "blend", label: "Blend" },
              { value: "flat", label: "Color" },
              { value: "picture", label: "Picture" },
            ]}
            value={fill}
            onValueChange={(next) => {
              if (next === "picture") {
                setChoosing(backdrop.kind !== "picture");
                return;
              }
              setChoosing(false);
              onChange("fill", (current) => ({
                ...current,
                backdrop:
                  next === "flat" ? flatFrom("fog") : blendFrom("lilac"),
              }));
            }}
          />
        </Inspector.Row>
        <Morph contentKey={fill}>
          {fill === "picture" ? (
            <Inspector.Row label="Picture">
              <DropZone
                accept="image/*"
                paste={false}
                openShortcut={false}
                onFiles={(files) => {
                  setChoosing(false);
                  onPicture(files);
                }}
              >
                <Inline gap={2} align="center">
                  {backdrop.kind === "picture" ? (
                    <Text variant="body-sm" truncate>
                      {backdrop.name}
                    </Text>
                  ) : null}
                  <DropZone.Open>
                    <Button size="sm">
                      {backdrop.kind === "picture"
                        ? "Change picture"
                        : "Pick a picture"}
                    </Button>
                  </DropZone.Open>
                </Inline>
              </DropZone>
            </Inspector.Row>
          ) : backdrop.kind === "flat" ? (
            <>
              <Inspector.Row block>
                <SwatchGrid
                  label="Flat colors"
                  swatches={FLAT_SWATCHES}
                  value={backdrop.preset ?? undefined}
                  onValueChange={(id) => {
                    onChange("swatch", (current) => ({
                      ...current,
                      backdrop: flatFrom(id),
                    }));
                  }}
                />
              </Inspector.Row>
              <Inspector.Row label="Hue">
                <ColorDot
                  label="Backdrop hue"
                  value={backdrop.color}
                  onValueChange={(color) => {
                    onChange("flat-hue", (current) => ({
                      ...current,
                      backdrop: { kind: "flat", preset: null, color },
                    }));
                  }}
                  onValueCommit={onSeal}
                />
              </Inspector.Row>
            </>
          ) : backdrop.kind === "blend" ? (
            <>
              <Inspector.Row block>
                <SwatchGrid
                  label="Blend presets"
                  swatches={BLEND_SWATCHES}
                  value={backdrop.preset ?? undefined}
                  onValueChange={(id) => {
                    onChange("swatch", (current) => ({
                      ...current,
                      backdrop: blendFrom(
                        id,
                        current.backdrop.kind === "blend"
                          ? current.backdrop.sweep
                          : DEFAULT_SWEEP,
                      ),
                    }));
                  }}
                />
              </Inspector.Row>
              <Inspector.Row label="Hues">
                <Inline gap={1.5} align="center">
                  <ColorDot
                    label="First hue"
                    value={backdrop.from}
                    onValueChange={(from) => {
                      onChange("first-hue", (current) =>
                        blendWith(current, (blend) => ({
                          ...blend,
                          from,
                          preset: null,
                        })),
                      );
                    }}
                    onValueCommit={onSeal}
                  />
                  <ColorDot
                    label="Second hue"
                    value={backdrop.to}
                    onValueChange={(to) => {
                      onChange("second-hue", (current) =>
                        blendWith(current, (blend) => ({
                          ...blend,
                          to,
                          preset: null,
                        })),
                      );
                    }}
                    onValueCommit={onSeal}
                  />
                  <IconButton
                    icon={ArrowLeftRight}
                    label="Swap hues"
                    size="sm"
                    onClick={() => {
                      onChange("swap", (current) =>
                        blendWith(current, (blend) => ({
                          ...blend,
                          from: blend.to,
                          to: blend.from,
                          preset: null,
                        })),
                      );
                    }}
                  />
                </Inline>
              </Inspector.Row>
              <Inspector.Row>
                <Slider
                  label="Sweep"
                  format="°"
                  min={0}
                  max={360}
                  resetValue={DEFAULT_SWEEP}
                  value={backdrop.sweep}
                  onValueChange={(sweep) => {
                    onLive(true);
                    onChange("sweep", (current) =>
                      blendWith(current, (blend) => ({ ...blend, sweep })),
                    );
                  }}
                  {...live}
                />
              </Inspector.Row>
            </>
          ) : null}
        </Morph>
      </Inspector.Section>
    </Inspector>
  );
}
