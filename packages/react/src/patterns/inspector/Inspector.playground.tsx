import { useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { gradientCss, gradients } from "@buttery/core/palettes";
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
} from "@buttery/react";
import type { Anchor, Swatch, TiltValue } from "@buttery/react";
import { ArrowLeftRight, Copy } from "lucide-react";

type Edge = "none" | "light" | "dark";

const GRADIENTS: readonly Swatch[] = gradients.slice(0, 12).map((preset) => ({
  value: preset.id,
  label: preset.name,
  fill: gradientCss(preset),
}));

const LEVEL: TiltValue = { x: 0, y: 0 };

function CardSettings(): ReactElement {
  const [edge, setEdge] = useState<Edge>("dark");
  const [scale, setScale] = useState(80);
  const [roundness, setRoundness] = useState(12);
  const [rotation, setRotation] = useState(0);
  const [tilt, setTilt] = useState<TiltValue>({ x: 0.3, y: -0.1 });
  const [anchor, setAnchor] = useState<Anchor>("center");
  const [background, setBackground] = useState("lilac");
  const [from, setFrom] = useState("#a5b4fc");
  const [to, setTo] = useState("#f0abfc");
  const cardChanged = edge !== "dark" || scale !== 80 || roundness !== 12;
  const placeChanged = rotation !== 0 || tilt !== LEVEL || anchor !== "center";
  return (
    <Inspector
      label="Card settings"
      style={{ blockSize: "calc(var(--bt-bento-row) * 2)" }}
      footer={
        <Inspector.Footer>
          <Button iconStart={Copy}>Copy</Button>
          <SplitButton
            menuLabel="More export options"
            items={[{ label: "Export JPG", onSelect: () => undefined }]}
          >
            Export PNG
          </SplitButton>
        </Inspector.Footer>
      }
    >
      <Inspector.Section
        title="Card"
        resettable={cardChanged}
        onReset={() => {
          setEdge("dark");
          setScale(80);
          setRoundness(12);
        }}
      >
        <Inspector.Row label="Edge">
          <SegmentedControl<Edge>
            label="Edge"
            options={[
              { value: "none", label: "None" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
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
            resetValue={80}
            value={scale}
            onValueChange={setScale}
          />
        </Inspector.Row>
        <Inspector.Row>
          <Slider
            label="Roundness"
            min={0}
            max={40}
            resetValue={12}
            value={roundness}
            onValueChange={setRoundness}
          />
        </Inspector.Row>
      </Inspector.Section>
      <Inspector.Section
        title="Position"
        resettable={placeChanged}
        onReset={() => {
          setRotation(0);
          setTilt(LEVEL);
          setAnchor("center");
        }}
      >
        <Inspector.Row>
          <Slider
            label="Rotate"
            format="°"
            min={-180}
            max={180}
            detents={[0]}
            resetValue={0}
            value={rotation}
            onValueChange={setRotation}
          />
        </Inspector.Row>
        <Inspector.Row.Split>
          <Inspector.Row
            label="Tilt"
            extra={
              <Chip
                disabled={tilt.x === 0 && tilt.y === 0}
                onClick={() => {
                  setTilt(LEVEL);
                }}
              >
                Reset
              </Chip>
            }
          >
            <TiltPad label="Tilt" value={tilt} onValueChange={setTilt} />
          </Inspector.Row>
          <Inspector.Row label="Position">
            <AnchorGrid
              label="Position"
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
        <Inspector.Row label="Colors">
          <Inline gap={1.5} align="center">
            <ColorDot
              label="Start color"
              value={from}
              onValueChange={setFrom}
            />
            <ColorDot label="End color" value={to} onValueChange={setTo} />
            <IconButton
              icon={ArrowLeftRight}
              label="Swap colors"
              size="sm"
              onClick={() => {
                setFrom(to);
                setTo(from);
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
    title: "Card settings",
    description:
      "Sections on nested surfaces, rows of controls, a split row for the tilt pad and the anchor grid, and a footer that stays put while the sections scroll.",
    render: () => <CardSettings />,
  },
];
