import type { ReactElement } from "react";
import { Inline, Morph } from "@buttery/core";
import { gradientCss, gradients, solids } from "@buttery/core/palettes";
import {
  AnchorGrid,
  Button,
  Chip,
  ColorDot,
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
  BACKGROUND_DEFAULT,
  CARD_DEFAULTS,
  POSITION_DEFAULTS,
  backgroundChanged,
  cardChanged,
  gradientFrom,
  positionChanged,
  solidFrom,
} from "./state.ts";
import type { Card, Edge } from "./state.ts";

const GRADIENT_SWATCHES: readonly Swatch[] = gradients.map((preset) => ({
  value: preset.id,
  label: preset.name,
  fill: gradientCss(preset),
}));

const SOLID_SWATCHES: readonly Swatch[] = solids.map((solid) => ({
  value: solid.id,
  label: solid.name,
  fill: solid.hex,
}));

type Fill = "gradient" | "solid";

/** The card's settings that are numbers, which sliders set. */
type NumberSetting = {
  readonly [Key in keyof Card]: Card[Key] extends number ? Key : never;
}[keyof Card];

/** How the inspector changes the card: a key that merges a drag into one undo step, and the change. */
export type ChangeCard = (key: string, change: (card: Card) => Card) => void;

/** The inspector's controls for the card, its position and its background, with Copy and Export below. */
export function StudioInspector({
  card,
  exportable,
  onChange,
  onLive,
  onCopy,
  onExport,
}: {
  readonly card: Card;
  readonly exportable: boolean;
  readonly onChange: ChangeCard;
  readonly onLive: (live: boolean) => void;
  readonly onCopy: () => void;
  readonly onExport: (format: "png" | "jpg", scale: 1 | 2) => void;
}): ReactElement {
  const background = card.background;
  const fill: Fill = background.kind === "solid" ? "solid" : "gradient";
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
        <Inspector.Footer>
          <Button
            className="cs-copy"
            iconStart={Copy}
            disabled={!exportable}
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
        <Inspector.Row label="Edge">
          <SegmentedControl<Edge>
            label="Edge"
            options={[
              { value: "none", label: "None" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
            value={card.edge}
            onValueChange={(edge) => {
              onLive(false);
              onChange("edge", (current) => ({ ...current, edge }));
            }}
          />
        </Inspector.Row>
        <Inspector.Row>
          <Slider
            label="Size"
            format="%"
            min={20}
            max={100}
            resetValue={CARD_DEFAULTS.scale}
            value={card.scale}
            onValueChange={slide("scale")}
            {...live}
          />
        </Inspector.Row>
        <Inspector.Row>
          <Slider
            label="Roundness"
            min={0}
            max={80}
            resetValue={CARD_DEFAULTS.roundness}
            value={card.roundness}
            onValueChange={slide("roundness")}
            {...live}
          />
        </Inspector.Row>
        <Inspector.Row>
          <Slider
            label="Padding"
            min={0}
            max={120}
            resetValue={CARD_DEFAULTS.padding}
            value={card.padding}
            onValueChange={slide("padding")}
            {...live}
          />
        </Inspector.Row>
        <Inspector.Row>
          <Slider
            label="Shadow"
            format="%"
            min={0}
            max={100}
            resetValue={CARD_DEFAULTS.shadow}
            value={card.shadow}
            disabled={card.edge === "none"}
            onValueChange={slide("shadow")}
            {...live}
          />
        </Inspector.Row>
      </Inspector.Section>

      <Inspector.Section
        title="Position"
        resettable={positionChanged(card)}
        onReset={() => {
          onLive(false);
          onChange("reset-position", (current) => ({
            ...current,
            ...POSITION_DEFAULTS,
          }));
        }}
      >
        <Inspector.Row>
          <Slider
            label="Rotate"
            format="°"
            min={-180}
            max={180}
            detents={[0]}
            resetValue={POSITION_DEFAULTS.rotation}
            value={card.rotation}
            onValueChange={slide("rotation")}
            {...live}
          />
        </Inspector.Row>
        <Inspector.Row.Split>
          <Inspector.Row
            label="Tilt"
            extra={
              <Chip
                disabled={card.tilt.x === 0 && card.tilt.y === 0}
                onClick={() => {
                  onLive(false);
                  onChange("tilt-reset", (current) => ({
                    ...current,
                    tilt: POSITION_DEFAULTS.tilt,
                  }));
                }}
              >
                Reset
              </Chip>
            }
          >
            <TiltPad
              label="Tilt"
              value={card.tilt}
              onValueChange={(tilt) => {
                onLive(true);
                onChange("tilt", (current) => ({ ...current, tilt }));
              }}
              onValueCommit={() => {
                onLive(false);
              }}
            />
          </Inspector.Row>
          <Inspector.Row label="Position">
            <AnchorGrid
              label="Position"
              value={card.anchor}
              onValueChange={(anchor) => {
                onLive(false);
                onChange("anchor", (current) => ({ ...current, anchor }));
              }}
            />
          </Inspector.Row>
        </Inspector.Row.Split>
      </Inspector.Section>

      <Inspector.Section
        title="Background"
        resettable={backgroundChanged(card)}
        onReset={() => {
          onChange("reset-background", (current) => ({
            ...current,
            background: BACKGROUND_DEFAULT,
          }));
        }}
      >
        <Inspector.Row label="Type">
          <SegmentedControl<Fill>
            label="Background type"
            options={[
              { value: "gradient", label: "Gradient" },
              { value: "solid", label: "Solid" },
            ]}
            value={fill}
            onValueChange={(next) => {
              onChange("fill", (current) => ({
                ...current,
                background:
                  next === "solid"
                    ? solidFrom("fog")
                    : gradientFrom("lilac", 135),
              }));
            }}
          />
        </Inspector.Row>
        <Inspector.Row block>
          <Morph contentKey={fill}>
            {background.kind === "solid" ? (
              <SwatchGrid
                label="Background color"
                swatches={SOLID_SWATCHES}
                value={background.preset ?? undefined}
                onValueChange={(id) => {
                  onChange("swatch", (current) => ({
                    ...current,
                    background: solidFrom(id),
                  }));
                }}
              />
            ) : (
              <SwatchGrid
                label="Background gradient"
                swatches={GRADIENT_SWATCHES}
                value={
                  background.kind === "gradient"
                    ? (background.preset ?? undefined)
                    : undefined
                }
                onValueChange={(id) => {
                  onChange("swatch", (current) => ({
                    ...current,
                    background: gradientFrom(
                      id,
                      current.background.kind === "gradient"
                        ? current.background.angle
                        : 135,
                    ),
                  }));
                }}
              />
            )}
          </Morph>
        </Inspector.Row>
        {background.kind === "gradient" ? (
          <>
            <Inspector.Row label="Colors">
              <Inline gap={1.5} align="center">
                <ColorDot
                  label="Start color"
                  value={background.from}
                  onValueChange={(from) => {
                    onChange("from", (current) =>
                      current.background.kind === "gradient"
                        ? {
                            ...current,
                            background: {
                              ...current.background,
                              from,
                              preset: null,
                            },
                          }
                        : current,
                    );
                  }}
                />
                <ColorDot
                  label="End color"
                  value={background.to}
                  onValueChange={(to) => {
                    onChange("to", (current) =>
                      current.background.kind === "gradient"
                        ? {
                            ...current,
                            background: {
                              ...current.background,
                              to,
                              preset: null,
                            },
                          }
                        : current,
                    );
                  }}
                />
                <IconButton
                  icon={ArrowLeftRight}
                  label="Swap colors"
                  size="sm"
                  onClick={() => {
                    onChange("swap", (current) =>
                      current.background.kind === "gradient"
                        ? {
                            ...current,
                            background: {
                              ...current.background,
                              from: current.background.to,
                              to: current.background.from,
                              preset: null,
                            },
                          }
                        : current,
                    );
                  }}
                />
              </Inline>
            </Inspector.Row>
            <Inspector.Row>
              <Slider
                label="Angle"
                format="°"
                min={0}
                max={360}
                resetValue={135}
                value={background.angle}
                onValueChange={(angle) => {
                  onLive(true);
                  onChange("angle", (current) =>
                    current.background.kind === "gradient"
                      ? {
                          ...current,
                          background: { ...current.background, angle },
                        }
                      : current,
                  );
                }}
                {...live}
              />
            </Inspector.Row>
          </>
        ) : background.kind === "solid" ? (
          <Inspector.Row label="Color">
            <ColorDot
              label="Background color"
              value={background.color}
              onValueChange={(color) => {
                onChange("color", (current) => ({
                  ...current,
                  background: { kind: "solid", preset: null, color },
                }));
              }}
            />
          </Inspector.Row>
        ) : null}
      </Inspector.Section>
    </Inspector>
  );
}
