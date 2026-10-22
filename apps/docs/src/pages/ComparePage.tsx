import { ArrowLeftRight, CircleHelp, Copy, Redo2, Undo2 } from "lucide-react";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { Inline, Kbd, Stack, Surface, Text } from "@buttery/core";
import { gradientCss, gradientRows } from "@buttery/core/palettes";
import {
  AnchorGrid,
  ArrowLink,
  Button,
  ButteryProvider,
  Chip,
  ColorDot,
  EmptyState,
  IconButton,
  Inspector,
  NumberField,
  SegmentedControl,
  Slider,
  SplitButton,
  SwatchGrid,
  TiltPad,
  Tooltip,
} from "@buttery/react";
import type { Swatch } from "@buttery/react";
import { referenceRoot } from "virtual:buttery-reference";
import { siteHref } from "../location.ts";
import "./compare-page.css";

interface Capture {
  readonly file: string;
  /** The capture's size shown at CSS pixels. */
  readonly width: number;
  readonly height: number;
}

/** The empty editor: 2× pixels, shown at 1×. */
const EDITOR: Capture = {
  file: "01-editor-empty.png",
  width: 1743,
  height: 1050,
};
/** Recorded frames: about 1.17 pixels to a CSS pixel. */
const ACTIVE: Capture = {
  file: "frames/editor-active.png",
  width: 1368,
  height: 1031,
};
const TOAST: Capture = {
  file: "frames/empty-state-toast.png",
  width: 1368,
  height: 1031,
};

/** The accent arc on a tilted knob, recorded close up. */
const TILTED: Capture = {
  file: "frames/tilt-knob-accent-closeup.png",
  width: 103,
  height: 68,
};

const LILAC = gradientRows.cream.find((preset) => preset.id === "lilac");

const SWATCHES: readonly Swatch[] = [
  ...gradientRows.cream,
  ...gradientRows.fresh,
  ...gradientRows.neutral,
].map((preset) => ({
  value: preset.id,
  label: preset.name,
  fill: gradientCss(preset),
}));

interface Crop {
  readonly title: string;
  /** The capture it comes from, or `null` when no capture shows it. */
  readonly capture: Capture | null;
  /** Where the control sits in the capture, in CSS px. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** Why there's no crop, for rows without one. */
  readonly note?: string;
  readonly ours: () => ReactNode;
}

const CROPS: readonly Crop[] = [
  {
    title: "SegmentedControl",
    capture: EDITOR,
    x: 1355,
    y: 64,
    width: 190,
    height: 44,
    ours: () => (
      <SegmentedControl
        label="Edge"
        options={["Plain", "Outline", "Glow"]}
        defaultValue="Outline"
      />
    ),
  },
  {
    title: "Slider and ValueBadge",
    capture: EDITOR,
    x: 1230,
    y: 114,
    width: 330,
    height: 44,
    ours: () => (
      <Slider label="Scale" min={25} max={200} defaultValue={75} format="%" />
    ),
  },
  {
    title: "Chip",
    capture: EDITOR,
    x: 1262,
    y: 428,
    width: 80,
    height: 36,
    ours: () => (
      <Inline gap={2} align="center">
        <Text>Lean</Text>
        <Chip aria-disabled>Flat</Chip>
      </Inline>
    ),
  },
  {
    title: "Button and SplitButton",
    capture: EDITOR,
    x: 1222,
    y: 976,
    width: 340,
    height: 52,
    ours: () => (
      <Inline gap={2}>
        <Button iconStart={Copy} disabled>
          Copy
        </Button>
        <SplitButton
          disabled
          menuLabel="Export options"
          items={[{ label: "Copy to clipboard", onSelect: () => undefined }]}
        >
          Export PNG
        </SplitButton>
      </Inline>
    ),
  },
  {
    title: "IconButton",
    capture: EDITOR,
    x: 1092,
    y: 24,
    width: 116,
    height: 42,
    ours: () => (
      <Inline gap={1}>
        <IconButton icon={Undo2} label="Undo" />
        <IconButton icon={Redo2} label="Redo" disabled />
        <IconButton icon={CircleHelp} label="Help" />
      </Inline>
    ),
  },
  {
    title: "IconButton, small",
    capture: EDITOR,
    x: 1494,
    y: 754,
    width: 44,
    height: 36,
    ours: () => (
      <IconButton icon={ArrowLeftRight} label="Swap hues" size="sm" />
    ),
  },
  {
    title: "Chip, enabled",
    capture: ACTIVE,
    x: 1051,
    y: 419,
    width: 86,
    height: 31,
    ours: () => (
      <Inline gap={2} align="center">
        <Text>Lean</Text>
        <Chip>Flat</Chip>
      </Inline>
    ),
  },
  {
    title: "Button and SplitButton, enabled",
    capture: ACTIVE,
    x: 1041,
    y: 964,
    width: 316,
    height: 43,
    ours: () => (
      <Inline gap={2}>
        <Button iconStart={Copy}>Copy</Button>
        <SplitButton
          menuLabel="Export options"
          items={[{ label: "Copy to clipboard", onSelect: () => undefined }]}
        >
          Export PNG
        </SplitButton>
      </Inline>
    ),
  },
  {
    title: "NumberField",
    capture: TOAST,
    x: 694,
    y: 293,
    width: 191,
    height: 66,
    ours: () => (
      <Inline gap={2}>
        <NumberField label="W" defaultValue={1600} unit="px" />
        <NumberField label="H" defaultValue={900} unit="px" />
      </Inline>
    ),
  },
  {
    title: "Toast",
    capture: TOAST,
    x: 590,
    y: 959,
    width: 190,
    height: 50,
    ours: () => (
      <div className="bt-toast" data-bt-part="toast">
        <div data-bt-part="pill">
          <span data-bt-part="message">Card deleted</span>
          <button
            type="button"
            className="bt-press bt-focus"
            data-bt-part="action"
          >
            Undo
          </button>
        </div>
      </div>
    ),
  },
  {
    title: "SwatchGrid",
    capture: EDITOR,
    x: 1240,
    y: 584,
    width: 302,
    height: 154,
    ours: () => (
      <Inspector label="Backdrop" className="cp-inspector">
        <Inspector.Section title="Backdrop">
          <Inspector.Row block>
            <SwatchGrid
              label="Blend presets"
              swatches={SWATCHES}
              defaultValue="lilac"
            />
          </Inspector.Row>
        </Inspector.Section>
      </Inspector>
    ),
  },
  {
    title: "ColorDot",
    capture: EDITOR,
    x: 1240,
    y: 750,
    width: 300,
    height: 45,
    ours: () => (
      <Inline gap={1.5} align="center">
        <ColorDot label="First hue" defaultValue={LILAC?.fromHex} />
        <ColorDot label="Second hue" defaultValue={LILAC?.toHex} />
        <IconButton icon={ArrowLeftRight} label="Swap hues" size="sm" />
      </Inline>
    ),
  },
  {
    title: "TiltPad",
    capture: EDITOR,
    x: 1240,
    y: 418,
    width: 140,
    height: 56,
    ours: () => (
      <Inline gap={2} align="center">
        <Text>Lean</Text>
        <Chip aria-disabled>Flat</Chip>
        <TiltPad label="Lean" />
      </Inline>
    ),
  },
  {
    title: "TiltPad, tilted",
    capture: TILTED,
    x: 0,
    y: 0,
    width: 103,
    height: 68,
    ours: () => <TiltPad label="Lean" defaultValue={{ x: 0.5, y: -0.35 }} />,
  },
  {
    title: "AnchorGrid",
    capture: EDITOR,
    x: 1400,
    y: 418,
    width: 140,
    height: 56,
    ours: () => (
      <Inline gap={2} align="center">
        <Text>Anchor</Text>
        <AnchorGrid label="Anchor" />
      </Inline>
    ),
  },
  {
    title: "EmptyState",
    capture: TOAST,
    x: 370,
    y: 488,
    width: 290,
    height: 114,
    ours: () => (
      <EmptyState
        title="No card yet"
        description="Start a new card, or drag a picture in for its backdrop."
        actions={
          <>
            <Button variant="primary">New card</Button>
            <Button variant="secondary">Pick a picture</Button>
          </>
        }
      />
    ),
  },
  {
    title: "Select, FloatingToolbar and the removal toast in place",
    capture: null,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    note: "An open select, the crop toolbar and a toast float over the app, so the phase report compares them as whole screens of Card Studio next to the captures.",
    ours: () => (
      <ArrowLink href={siteHref("/demos/card-studio")}>
        Open Card Studio
      </ArrowLink>
    ),
  },
  {
    title: "Button and ArrowLink with the arrow",
    capture: null,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    note: "The arrow follows a recording of another product's nav; its look isn't buttery's, so it's compared frame by frame for behavior in the phase report instead.",
    ours: () => (
      <Inline gap={4} align="center">
        <Button variant="primary" arrow="forward">
          Get started
        </Button>
        <ArrowLink href={siteHref("/components/button")}>
          More about buttons
        </ArrowLink>
      </Inline>
    ),
  },
  {
    title: "Tooltip and Kbd",
    capture: null,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    note: "No capture shows a tooltip or a keycap.",
    ours: () => (
      <Inline gap={4} align="center">
        <Tooltip label="Undo" defaultOpen>
          <IconButton icon={Undo2} label="Undo" />
        </Tooltip>
        <Kbd keys={["mod", "Z"]} />
      </Inline>
    ),
  },
];

function CropView({ crop }: { readonly crop: Crop }): ReactElement {
  const { capture } = crop;
  if (!capture) {
    return <Text variant="caption">{crop.note}</Text>;
  }
  const style: CSSProperties = {
    inlineSize: `${String(crop.width)}px`,
    blockSize: `${String(crop.height)}px`,
    backgroundImage: `url("${String(referenceRoot)}/${capture.file}")`,
    backgroundPosition: `-${String(crop.x)}px -${String(crop.y)}px`,
    backgroundSize: `${String(capture.width)}px ${String(capture.height)}px`,
  };
  return (
    <div
      className="cp-crop"
      style={style}
      role="img"
      aria-label={`Reference capture: ${crop.title}`}
    />
  );
}

/**
 * Each control next to its crop from the local reference captures, in light and dark. Only the dev server
 * shows this page, and only when the reference folder is there.
 */
export function ComparePage(): ReactElement {
  return (
    <Stack gap={8}>
      <Stack gap={2}>
        <Text variant="heading-1" asChild>
          <h1>Compare</h1>
        </Text>
        <Text variant="body-lg">
          Reference crops on the left, buttery&apos;s controls in light and dark
          beside them. Local only: it reads the reference folder.
        </Text>
      </Stack>
      {CROPS.map((crop) => (
        <Stack key={crop.title} gap={3} asChild>
          <section aria-label={crop.title}>
            <Text variant="title" asChild>
              <h2>{crop.title}</h2>
            </Text>
            <div className="cp-row">
              <Surface level="section" pad={4} className="cp-cell">
                <CropView crop={crop} />
              </Surface>
              <Surface level="section" pad={4} className="cp-cell">
                {crop.ours()}
              </Surface>
              <ButteryProvider colorScheme="dark">
                <Surface level="app" pad={4} className="cp-cell">
                  {crop.ours()}
                </Surface>
              </ButteryProvider>
            </div>
          </section>
        </Stack>
      ))}
    </Stack>
  );
}
