import { useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@butteryui/core";
import type { DemoSection, DocsPage } from "@butteryui/core";
import { gradientCss, gradients } from "@butteryui/core/palettes";
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
  TiltPad,
} from "@butteryui/react";
import type { Anchor, Swatch, TiltValue } from "@butteryui/react";
import { ArrowLeftRight, Copy } from "lucide-react";

export const page: DocsPage = {
  section: "patterns",
  title: "Inspector",
  description:
    "A settings panel of titled sections holding rows of controls, with a footer for its main actions.",
  order: 200,
  status: "stable",
  since: "0.6.0",
  home: "patterns/inspector",
};

type Edge = "plain" | "outline" | "glow";

const GRADIENTS: readonly Swatch[] = gradients.slice(0, 12).map((preset) => ({
  value: preset.id,
  label: preset.name,
  fill: gradientCss(preset),
}));

const LEVEL: TiltValue = { x: 0, y: 0 };

const MIST = gradients.find((preset) => preset.id === "mist");

function SlideSettings(): ReactElement {
  const [edge, setEdge] = useState<Edge>("outline");
  const [scale, setScale] = useState(75);
  const [corners, setCorners] = useState(16);
  const [turn, setTurn] = useState(0);
  const [tilt, setTilt] = useState<TiltValue>({ x: 0.3, y: -0.1 });
  const [anchor, setAnchor] = useState<Anchor>("center");
  const [background, setBackground] = useState("mist");
  const [first, setFirst] = useState(MIST?.fromHex ?? "#000000");
  const [second, setSecond] = useState(MIST?.toHex ?? "#000000");
  const level = tilt.x === 0 && tilt.y === 0;
  const pictureChanged = edge !== "outline" || scale !== 75 || corners !== 16;
  const placeChanged = turn !== 0 || !level || anchor !== "center";
  return (
    <Inspector
      label="Slide settings"
      style={{ blockSize: "calc(var(--bt-bento-row) * 2)" }}
      footer={
        <Inspector.Footer>
          <Button iconStart={Copy}>Copy</Button>
          <SplitButton
            menuLabel="More export options"
            items={[{ label: "Export PDF", onSelect: () => undefined }]}
          >
            Export PNG
          </SplitButton>
        </Inspector.Footer>
      }
    >
      <Inspector.Section
        title="Picture"
        resettable={pictureChanged}
        onReset={() => {
          setEdge("outline");
          setScale(75);
          setCorners(16);
        }}
      >
        <Inspector.Row label="Edge">
          <SegmentedControl<Edge>
            label="Edge"
            options={[
              { value: "plain", label: "Plain" },
              { value: "outline", label: "Outline" },
              { value: "glow", label: "Glow" },
            ]}
            value={edge}
            onValueChange={setEdge}
          />
        </Inspector.Row>
        <Inspector.Row>
          <Slider
            label="Scale"
            format="%"
            min={20}
            max={100}
            resetValue={75}
            value={scale}
            onValueChange={setScale}
          />
        </Inspector.Row>
        <Inspector.Row>
          <Slider
            label="Corners"
            min={0}
            max={40}
            resetValue={16}
            value={corners}
            onValueChange={setCorners}
          />
        </Inspector.Row>
      </Inspector.Section>
      <Inspector.Section
        title="Placement"
        resettable={placeChanged}
        onReset={() => {
          setTurn(0);
          setTilt(LEVEL);
          setAnchor("center");
        }}
      >
        <Inspector.Row>
          <Slider
            label="Turn"
            format="°"
            min={-180}
            max={180}
            detents={[0]}
            resetValue={0}
            value={turn}
            onValueChange={setTurn}
          />
        </Inspector.Row>
        <Inspector.Row.Split>
          <Inspector.Row
            label="Tilt"
            extra={
              <Chip
                aria-disabled={level}
                onClick={() => {
                  setTilt(LEVEL);
                }}
              >
                Flat
              </Chip>
            }
          >
            <TiltPad label="Tilt" value={tilt} onValueChange={setTilt} />
          </Inspector.Row>
          <Inspector.Row label="Anchor">
            <AnchorGrid
              label="Anchor"
              value={anchor}
              onValueChange={setAnchor}
            />
          </Inspector.Row>
        </Inspector.Row.Split>
      </Inspector.Section>
      <Inspector.Section title="Background">
        <Inspector.Row block>
          <SwatchGrid
            label="Background"
            swatches={GRADIENTS}
            value={background}
            onValueChange={setBackground}
          />
        </Inspector.Row>
        <Inspector.Row label="Hues">
          <Inline gap={1.5} align="center">
            <ColorDot
              label="First hue"
              value={first}
              onValueChange={setFirst}
            />
            <ColorDot
              label="Second hue"
              value={second}
              onValueChange={setSecond}
            />
            <IconButton
              icon={ArrowLeftRight}
              label="Swap hues"
              size="sm"
              onClick={() => {
                setFirst(second);
                setSecond(first);
              }}
            />
          </Inline>
        </Inspector.Row>
      </Inspector.Section>
    </Inspector>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Slide settings",
    description:
      "Sections on nested surfaces, rows of controls, a split row for the tilt pad and the anchor grid, and a footer that stays put while the sections scroll.",
    render: () => <SlideSettings />,
  },
];
