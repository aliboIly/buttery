import type { CSSProperties, ReactElement, ReactNode } from "react";
import {
  ArrowLeftRight,
  ChevronDown,
  CircleHelp,
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
import type { CssVariables } from "@buttery/core";
import { gradientCss, gradients } from "@buttery/core/palettes";
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

interface RowProps {
  readonly label: string;
  readonly badge?: string;
  readonly children?: ReactNode;
}

function Row({ label, badge, children }: RowProps): ReactElement {
  return (
    <div className="sf-row">
      <Inline gap={2}>
        <Text truncate>{label}</Text>
        {badge === undefined ? null : (
          <Text variant="badge" className="sf-badge">
            {badge}
          </Text>
        )}
      </Inline>
      {children}
    </div>
  );
}

function SegmentedPlaceholder({
  items,
  active,
}: {
  readonly items: readonly string[];
  readonly active: string;
}): ReactElement {
  return (
    <span className="sf-segmented">
      {items.map((item) => (
        <Text
          key={item}
          variant="control"
          className="sf-segment"
          data-active={item === active ? "" : undefined}
        >
          {item}
        </Text>
      ))}
    </span>
  );
}

function SliderPlaceholder({
  value,
}: {
  readonly value: number;
}): ReactElement {
  const style: CSSProperties & CssVariables = {
    "--bt-surfaces-page-value": String(value),
  };
  return (
    <span className="sf-slider" style={style}>
      <span className="sf-track" />
      <span className="sf-thumb">
        <span className="sf-grip">
          <span />
          <span />
        </span>
      </span>
    </span>
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
              <SegmentedPlaceholder
                items={["Plain", "Outline", "Glow"]}
                active="Outline"
              />
            </Row>
            <Row label="Scale" badge="75%">
              <SliderPlaceholder value={0.45} />
            </Row>
            <Row label="Corners" badge="16">
              <SliderPlaceholder value={0.25} />
            </Row>
            <Row label="Spacing" badge="8">
              <SliderPlaceholder value={0.1} />
            </Row>
            <Row label="Depth" badge="30%">
              <SliderPlaceholder value={0.3} />
            </Row>
          </Section>
          <Section title="Placement" resettable>
            <Row label="Turn" badge="−8°">
              <SliderPlaceholder value={0.48} />
            </Row>
            <div className="sf-split">
              <span className="sf-split-cell">
                <Inline gap={2}>
                  <Text>Lean</Text>
                  <Pressable className="sf-chip" disabled>
                    <Text variant="badge" tone="disabled">
                      Reset
                    </Text>
                  </Pressable>
                </Inline>
                <span className="sf-tilt">
                  <span className="sf-knob" />
                </span>
              </span>
              <span className="sf-split-cell">
                <Text>Anchor</Text>
                <AnchorPlaceholder />
              </span>
            </div>
          </Section>
          <Section title="Backdrop" resettable>
            <Row label="Fill">
              <SegmentedPlaceholder items={["Blend", "Flat"]} active="Blend" />
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
                <Pressable
                  className="sf-icon-button sf-icon-button-sm"
                  aria-label="Swap hues"
                >
                  <Icon icon={ArrowLeftRight} />
                </Pressable>
              </Inline>
            </Row>
            <Row label="Sweep" badge="135°">
              <SliderPlaceholder value={0.375} />
            </Row>
          </Section>
        </Stack>
        <Inline gap={2} pad={3} className="sf-footer">
          <Pressable className="sf-button sf-button-soft" disabled>
            <Icon icon={Copy} />
            <Text variant="button" tone="disabled">
              Copy
            </Text>
          </Pressable>
          <span className="sf-split-button">
            <Pressable className="sf-split-main" disabled>
              <Text variant="button" className="sf-on-primary">
                Export PNG
              </Text>
            </Pressable>
            <span className="sf-split-divider" />
            <Pressable
              className="sf-split-menu"
              aria-label="Export options"
              disabled
            >
              <Icon icon={ChevronDown} />
            </Pressable>
          </span>
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
              <Pressable
                className="sf-icon-button"
                aria-label={label}
                title={label}
                disabled={disabled}
              >
                <Icon icon={icon} />
              </Pressable>
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
