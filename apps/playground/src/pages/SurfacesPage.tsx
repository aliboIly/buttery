import type { ReactElement, ReactNode } from "react";
import {
  ArrowLeftRight,
  ChevronDown,
  CircleHelp,
  Clipboard,
  Copy,
  Redo2,
  Undo2,
} from "lucide-react";
import {
  Divider,
  Icon,
  Inline,
  OverflowCluster,
  Pressable,
  Stack,
  Surface,
  Text,
} from "@buttery/core";
import { gradientCss, gradients } from "@buttery/core/palettes";
import {
  Button,
  Chip,
  IconButton,
  SegmentedControl,
  Slider,
  SplitButton,
} from "@buttery/react";
import type { SliderProps } from "@buttery/react";
import { EmptyStateDemo } from "../demo/EmptyStateDemo.tsx";
import "./surfaces-page.css";

const SELECTED_GRADIENT = "lilac";

interface SectionProps {
  readonly title: string;
  readonly resettable?: boolean;
  readonly children: ReactNode;
}

function Section({
  title,
  resettable = false,
  children,
}: SectionProps): ReactElement {
  return (
    <Surface level="section" asChild>
      <section className="sf-section" aria-label={title}>
        <Inline justify="between" padX={4} className="sf-section-header">
          <Text variant="control" asChild>
            <h3>{title}</h3>
          </Text>
          {resettable ? (
            <Pressable className="sf-link">
              <Text variant="control">Reset</Text>
            </Pressable>
          ) : null}
        </Inline>
        <Surface className="sf-card">{children}</Surface>
      </section>
    </Surface>
  );
}

function Row({
  label,
  children,
}: {
  readonly label: string;
  readonly children?: ReactNode;
}): ReactElement {
  return (
    <div className="sf-row">
      <Text truncate>{label}</Text>
      {children}
    </div>
  );
}

function SliderRow(props: SliderProps): ReactElement {
  return (
    <div className="sf-row sf-row-slider">
      <Slider {...props} />
    </div>
  );
}

function SwatchesPlaceholder(): ReactElement {
  return (
    <span className="sf-swatches">
      {gradients.map((preset) => (
        <span
          key={preset.id}
          className="sf-swatch"
          title={preset.name}
          data-selected={preset.id === SELECTED_GRADIENT ? "" : undefined}
          style={{ background: gradientCss(preset) }}
        />
      ))}
    </span>
  );
}

function AnchorPlaceholder(): ReactElement {
  return (
    <span className="sf-anchor">
      {Array.from({ length: 9 }, (_, index) => (
        <span
          key={index}
          className="sf-anchor-dot"
          data-active={index === 4 ? "" : undefined}
        />
      ))}
    </span>
  );
}

function Inspector(): ReactElement {
  const selected = gradients.find((preset) => preset.id === SELECTED_GRADIENT);
  return (
    <Surface level="panel" pad={0} asChild>
      <aside className="sf-inspector" aria-label="Inspector">
        <Stack gap={2} pad={2} className="sf-inspector-body">
          <Section title="Card">
            <Row label="Edge">
              <SegmentedControl
                label="Edge"
                options={["Plain", "Outline", "Glow"]}
                defaultValue="Outline"
              />
            </Row>
            <SliderRow
              label="Scale"
              min={25}
              max={200}
              defaultValue={75}
              format="%"
            />
            <SliderRow label="Corners" max={48} defaultValue={16} />
            <SliderRow label="Spacing" max={48} defaultValue={8} />
            <SliderRow label="Depth" defaultValue={30} format="%" />
          </Section>
          <Section title="Placement" resettable>
            <SliderRow
              label="Turn"
              min={-180}
              max={180}
              defaultValue={-8}
              format="°"
              detents={[0]}
            />
            <div className="sf-split">
              <span className="sf-split-cell">
                <Inline gap={2}>
                  <Text truncate>Lean</Text>
                  <Chip disabled>Reset</Chip>
                </Inline>
                <span className="sf-tilt">
                  <span className="sf-knob" />
                </span>
              </span>
              <span className="sf-split-cell">
                <Text truncate>Anchor</Text>
                <AnchorPlaceholder />
              </span>
            </div>
          </Section>
          <Section title="Backdrop" resettable>
            <Row label="Fill">
              <SegmentedControl label="Fill" options={["Blend", "Flat"]} />
            </Row>
            <div className="sf-row sf-row-full">
              <SwatchesPlaceholder />
            </div>
            <Row label="Hues">
              <Inline gap={1.5}>
                <span
                  className="sf-dot"
                  style={{ background: selected?.fromHex }}
                />
                <span
                  className="sf-dot"
                  style={{ background: selected?.toHex }}
                />
                <IconButton icon={ArrowLeftRight} label="Swap hues" size="sm" />
              </Inline>
            </Row>
            <SliderRow label="Sweep" max={360} defaultValue={135} format="°" />
          </Section>
        </Stack>
        <Inline gap={2} pad={3} className="sf-footer">
          <Button iconStart={Copy} disabled className="sf-copy">
            Copy
          </Button>
          <SplitButton
            disabled
            menuLabel="Export options"
            className="sf-export"
            items={[
              {
                label: "Copy to clipboard",
                icon: Clipboard,
                onSelect: () => undefined,
              },
            ]}
          >
            Export PNG
          </SplitButton>
        </Inline>
      </aside>
    </Surface>
  );
}

const ACTIONS = [
  { label: "Undo", icon: Undo2, priority: 3, disabled: false },
  { label: "Redo", icon: Redo2, priority: 3, disabled: true },
  { label: "Help", icon: CircleHelp, priority: 1, disabled: false },
] as const;

function Header(): ReactElement {
  return (
    <Surface level="panel" padX={4} asChild>
      <header className="sf-header">
        <span className="sf-mark" aria-hidden="true" />
        <Text variant="title-sm" truncate className="sf-title">
          Spring launch
        </Text>
        <OverflowCluster gap={1} justify="end" moreLabel="More actions">
          <OverflowCluster.Item
            priority={2}
            menuItem={{ label: "Canvas: Square", onSelect: () => undefined }}
          >
            <Inline gap={1}>
              <Pressable className="sf-select">
                <Text variant="button" tone="secondary">
                  Square
                </Text>
                <Icon icon={ChevronDown} />
              </Pressable>
              <Divider orientation="vertical" length={6} decorative />
            </Inline>
          </OverflowCluster.Item>
          {ACTIONS.map(({ label, icon, priority, disabled }) => (
            <OverflowCluster.Item
              key={label}
              priority={priority}
              menuItem={{ label, icon, disabled, onSelect: () => undefined }}
            >
              <IconButton icon={icon} label={label} disabled={disabled} />
            </OverflowCluster.Item>
          ))}
        </OverflowCluster>
      </header>
    </Surface>
  );
}

export function SurfacesPage(): ReactElement {
  return (
    <div className="sf-app">
      <div className="sf-shell">
        <div className="sf-workspace">
          <Header />
          <section className="sf-stage" aria-label="Canvas">
            <EmptyStateDemo />
          </section>
        </div>
        <Inspector />
      </div>
    </div>
  );
}
