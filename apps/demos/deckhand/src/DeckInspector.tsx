import type { ReactElement } from "react";
import { Morph } from "@buttery/core";
import { gradientCss, gradients, solids } from "@buttery/core/palettes";
import {
  AnchorGrid,
  EmptyState,
  Inspector,
  SegmentedControl,
  Select,
  Slider,
  SwatchGrid,
  TextArea,
  TextField,
} from "@buttery/react";
import type { SegmentedControlOption, Swatch } from "@buttery/react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import {
  DEFAULT_ANGLE,
  DEFAULT_TEXT_SIZE,
  LAYOUT_DEFAULTS,
  LAYOUT_OPTIONS,
  LOOK_DEFAULTS,
  lookChanged,
  placementChanged,
} from "./deck.ts";
import type { Align, Box, Fill, Layout, Slide, Stat } from "./deck.ts";

const SOLID_SWATCHES: readonly Swatch[] = solids.map((preset) => ({
  value: preset.id,
  label: preset.name,
  fill: preset.hex,
}));

const GRADIENT_SWATCHES: readonly Swatch[] = gradients.map((preset) => ({
  value: preset.id,
  label: preset.name,
  fill: gradientCss(preset),
}));

const SOLID_IDS = new Set(solids.map(({ id }) => id));

const ALIGNS = [
  { value: "start", label: "Left", icon: AlignLeft },
  { value: "center", label: "Center", icon: AlignCenter },
  { value: "end", label: "Right", icon: AlignRight },
] as const satisfies readonly SegmentedControlOption<Align>[];

const BOXES = [
  { value: "none", label: "None" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const satisfies readonly SegmentedControlOption<Box>[];

const FILLS = [
  { value: "solid", label: "Color" },
  { value: "gradient", label: "Gradient" },
] as const satisfies readonly SegmentedControlOption<Fill["kind"]>[];

const ORDINALS = ["First", "Second", "Third"] as const;

/** How the inspector changes the slide: a key, which joins changes into one undo step, and the change. */
export type ChangeSlide = (
  key: string,
  change: (slide: Slide) => Slide,
) => void;

/** The fill in the other kind, keeping its family where the palettes have both. */
function switchFill(fill: Fill, kind: Fill["kind"]): Fill {
  if (fill.kind === kind) return fill;
  return kind === "solid"
    ? {
        kind: "solid",
        preset: SOLID_IDS.has(fill.preset)
          ? fill.preset
          : LOOK_DEFAULTS.fill.preset,
      }
    : { kind: "gradient", preset: fill.preset, angle: DEFAULT_ANGLE };
}

/** The words of the slide, as its layout asks for them. */
function TextRows({
  slide,
  onChange,
  onSeal,
}: {
  readonly slide: Slide;
  readonly onChange: ChangeSlide;
  readonly onSeal: () => void;
}): ReactElement {
  const write =
    (field: "title" | "subtitle" | "points") =>
    (value: string): void => {
      onChange(`text:${slide.id}:${field}`, (current) => ({
        ...current,
        [field]: value,
      }));
    };
  const writeStat =
    (index: number, part: keyof Stat) =>
    (value: string): void => {
      onChange(`text:${slide.id}:stat-${String(index)}-${part}`, (current) => ({
        ...current,
        stats: current.stats.map((stat, at) =>
          at === index ? { ...stat, [part]: value } : stat,
        ),
      }));
    };
  const title = (
    <Inspector.Row block>
      <TextField
        label="Title"
        value={slide.title}
        onValueChange={write("title")}
        onBlur={onSeal}
        data-dh-input="title"
      />
    </Inspector.Row>
  );
  const subtitle = (label: string, placeholder: string): ReactElement => (
    <Inspector.Row block>
      <TextArea
        label={label}
        rows={1}
        maxRows={4}
        placeholder={placeholder}
        value={slide.subtitle}
        onValueChange={write("subtitle")}
        onBlur={onSeal}
        data-dh-input="subtitle"
      />
    </Inspector.Row>
  );
  switch (slide.layout) {
    case "title":
      return (
        <>
          {title}
          {subtitle("Subtitle", "A line under the title")}
        </>
      );
    case "points":
      return (
        <>
          {title}
          <Inspector.Row block>
            <TextArea
              label="Points"
              hint="One point per line"
              rows={4}
              value={slide.points}
              onValueChange={write("points")}
              onBlur={onSeal}
              data-dh-input="points"
            />
          </Inspector.Row>
          {subtitle("Note", "Optional, such as a contact")}
        </>
      );
    case "numbers":
      return (
        <>
          {title}
          {slide.stats.map((stat, index) => (
            <Inspector.Row key={ORDINALS[index]} block>
              <div className="dh-stat-fields">
                <TextField
                  label="Number"
                  aria-label={`${ORDINALS[index] ?? ""} number`}
                  value={stat.value}
                  onValueChange={writeStat(index, "value")}
                  onBlur={onSeal}
                  data-dh-input={`stat-${String(index)}-value`}
                />
                <TextArea
                  label="Caption"
                  aria-label={`${ORDINALS[index] ?? ""} caption`}
                  rows={1}
                  maxRows={3}
                  value={stat.label}
                  onValueChange={writeStat(index, "label")}
                  onBlur={onSeal}
                  data-dh-input={`stat-${String(index)}-label`}
                />
              </div>
            </Inspector.Row>
          ))}
          {subtitle("Note", "Optional, such as a source")}
        </>
      );
    case "quote":
      return (
        <>
          <Inspector.Row block>
            <TextArea
              label="Quote"
              rows={3}
              value={slide.title}
              onValueChange={write("title")}
              onBlur={onSeal}
              data-dh-input="title"
            />
          </Inspector.Row>
          {subtitle("Who said it", "Their name and where they work")}
        </>
      );
    default: {
      const unknown: never = slide.layout;
      return unknown;
    }
  }
}

/** The inspector while the deck has no slides: nothing to style yet. */
export function EmptyDeckInspector(): ReactElement {
  return (
    <Inspector label="Slide settings">
      <div className="dh-inspector-empty">
        <EmptyState
          title="No slide to style"
          description="Add a slide, and its words, layout and look show up here."
        />
      </div>
    </Inspector>
  );
}

/** The picked slide's words, layout and look, each section with a Reset where it has defaults. */
export function DeckInspector({
  slide,
  onChange,
  onSeal,
  onLive,
  onLayout,
}: {
  readonly slide: Slide;
  readonly onChange: ChangeSlide;
  /** Closes the open undo step, once a field is left or a drag lets go. */
  readonly onSeal: () => void;
  /** Says a slider is being dragged, so the slide follows it at once. */
  readonly onLive: (live: boolean) => void;
  readonly onLayout: (layout: Layout) => void;
}): ReactElement {
  const live = {
    onValueCommit: () => {
      onLive(false);
    },
  };
  return (
    <Inspector label="Slide settings">
      <Inspector.Section title="Text">
        <Morph contentKey={slide.layout}>
          <TextRows slide={slide} onChange={onChange} onSeal={onSeal} />
        </Morph>
      </Inspector.Section>

      <Inspector.Section
        title="Slide"
        resettable={placementChanged(slide)}
        onReset={() => {
          onLive(false);
          onChange(`reset-slide:${slide.id}`, (current) => ({
            ...current,
            ...LAYOUT_DEFAULTS[current.layout],
            size: DEFAULT_TEXT_SIZE,
          }));
        }}
      >
        <Inspector.Row label="Layout">
          <Select<Layout>
            label="Layout"
            options={LAYOUT_OPTIONS}
            value={slide.layout}
            onValueChange={onLayout}
          />
        </Inspector.Row>
        <Inspector.Row label="Align">
          <SegmentedControl<Align>
            label="Align"
            options={ALIGNS}
            iconOnly
            value={slide.align}
            onValueChange={(align) => {
              onChange(`align:${slide.id}`, (current) => ({
                ...current,
                align,
              }));
            }}
          />
        </Inspector.Row>
        <Inspector.Row>
          <Slider
            label="Size"
            format="%"
            min={70}
            max={130}
            step={5}
            resetValue={DEFAULT_TEXT_SIZE}
            value={slide.size}
            onValueChange={(size) => {
              onLive(true);
              onChange(`size:${slide.id}`, (current) => ({ ...current, size }));
            }}
            {...live}
          />
        </Inspector.Row>
        <Inspector.Row label="Position" block>
          <AnchorGrid
            label="Position"
            value={slide.position}
            onValueChange={(position) => {
              onChange(`position:${slide.id}`, (current) => ({
                ...current,
                position,
              }));
            }}
          />
        </Inspector.Row>
      </Inspector.Section>

      <Inspector.Section
        title="Look"
        data-testid="look-section"
        resettable={lookChanged(slide)}
        onReset={() => {
          onLive(false);
          onChange(`reset-look:${slide.id}`, (current) => ({
            ...current,
            ...LOOK_DEFAULTS,
          }));
        }}
      >
        <Inspector.Row label="Fill">
          <SegmentedControl<Fill["kind"]>
            label="Fill"
            options={FILLS}
            value={slide.fill.kind}
            onValueChange={(kind) => {
              onChange(`fill:${slide.id}`, (current) => ({
                ...current,
                fill: switchFill(current.fill, kind),
              }));
            }}
          />
        </Inspector.Row>
        <Morph contentKey={slide.fill.kind}>
          {slide.fill.kind === "solid" ? (
            <Inspector.Row block>
              <SwatchGrid
                label="Colors"
                swatches={SOLID_SWATCHES}
                value={slide.fill.preset}
                onValueChange={(preset) => {
                  onChange(`swatch:${slide.id}`, (current) => ({
                    ...current,
                    fill: { kind: "solid", preset },
                  }));
                }}
              />
            </Inspector.Row>
          ) : (
            <>
              <Inspector.Row block>
                <SwatchGrid
                  label="Gradients"
                  swatches={GRADIENT_SWATCHES}
                  value={slide.fill.preset}
                  onValueChange={(preset) => {
                    onChange(`swatch:${slide.id}`, (current) => ({
                      ...current,
                      fill: {
                        kind: "gradient",
                        preset,
                        angle:
                          current.fill.kind === "gradient"
                            ? current.fill.angle
                            : DEFAULT_ANGLE,
                      },
                    }));
                  }}
                />
              </Inspector.Row>
              <Inspector.Row>
                <Slider
                  label="Angle"
                  format="°"
                  min={0}
                  max={360}
                  step={5}
                  resetValue={DEFAULT_ANGLE}
                  value={slide.fill.angle}
                  onValueChange={(angle) => {
                    onLive(true);
                    onChange(`angle:${slide.id}`, (current) =>
                      current.fill.kind === "gradient"
                        ? { ...current, fill: { ...current.fill, angle } }
                        : current,
                    );
                  }}
                  {...live}
                />
              </Inspector.Row>
            </>
          )}
        </Morph>
        <Inspector.Row label="Box">
          <SegmentedControl<Box>
            label="Box"
            options={BOXES}
            value={slide.box}
            onValueChange={(box) => {
              onLive(false);
              onChange(`box:${slide.id}`, (current) => ({ ...current, box }));
            }}
          />
        </Inspector.Row>
        <Inspector.Row>
          <Slider
            label="Depth"
            format="%"
            min={0}
            max={100}
            resetValue={LOOK_DEFAULTS.depth}
            value={slide.depth}
            disabled={slide.box === "none"}
            onValueChange={(depth) => {
              onLive(true);
              onChange(`depth:${slide.id}`, (current) => ({
                ...current,
                depth,
              }));
            }}
            {...live}
          />
        </Inspector.Row>
      </Inspector.Section>
    </Inspector>
  );
}
