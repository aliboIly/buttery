import type { ReactElement, ReactNode } from "react";
import {
  ArrowLeftRight,
  ChevronDown,
  CircleHelp,
  Copy,
  Redo2,
  Undo2,
} from "lucide-react";
import { gradientCss, gradients } from "@buttery/core/palettes";
import { EmptyStateDemo } from "../demo/EmptyStateDemo.tsx";
import "./surfaces-page.css";

const ICON = { size: 16, strokeWidth: 1.75, "aria-hidden": true } as const;
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
    <section
      className="sf-section bt-surface"
      data-level="section"
      aria-label={title}
    >
      <header className="sf-section-header">
        <h3 className="bt-text" data-role="control">
          {title}
        </h3>
        {resettable ? (
          <button type="button" className="sf-link bt-text" data-role="control">
            Reset
          </button>
        ) : null}
      </header>
      <div className="sf-card bt-surface" data-level="card">
        {children}
      </div>
    </section>
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
      <span className="sf-row-label">
        <span className="bt-text bt-truncate" data-role="label">
          {label}
        </span>
        {badge === undefined ? null : (
          <span className="sf-badge bt-text" data-role="badge">
            {badge}
          </span>
        )}
      </span>
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
        <span
          key={item}
          className="sf-segment bt-text"
          data-role="control"
          data-active={item === active ? "" : undefined}
        >
          {item}
        </span>
      ))}
    </span>
  );
}

function SliderPlaceholder({
  value,
}: {
  readonly value: number;
}): ReactElement {
  return (
    <span className="sf-slider">
      <span
        className="sf-thumb"
        data-bt-part="thumb"
        style={{
          insetInlineStart: `calc(${String(value)} * (100% - var(--bt-demo-thumb)))`,
        }}
      />
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
    <aside
      className="sf-inspector bt-surface"
      data-level="panel"
      aria-label="Inspector"
    >
      <div className="sf-inspector-body">
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
              <span className="sf-row-label">
                <span className="bt-text" data-role="label">
                  Lean
                </span>
                <button
                  type="button"
                  className="sf-chip bt-text"
                  data-role="badge"
                  disabled
                >
                  Reset
                </button>
              </span>
              <span className="sf-tilt">
                <span className="sf-knob" data-bt-part="knob" />
              </span>
            </span>
            <span className="sf-split-cell">
              <span className="bt-text" data-role="label">
                Anchor
              </span>
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
            <span className="sf-hues">
              <span
                className="sf-dot"
                style={{ background: selected?.fromHex }}
              />
              <span
                className="sf-dot"
                style={{ background: selected?.toHex }}
              />
              <button
                type="button"
                className="sf-icon-button"
                aria-label="Swap hues"
              >
                <ArrowLeftRight {...ICON} />
              </button>
            </span>
          </Row>
          <Row label="Sweep" badge="135°">
            <SliderPlaceholder value={0.375} />
          </Row>
        </Section>
      </div>
      <footer className="sf-footer">
        <button
          type="button"
          className="sf-button sf-button-soft bt-text"
          data-role="button"
          disabled
        >
          <Copy {...ICON} />
          Copy
        </button>
        <span className="sf-split-button" data-disabled="">
          <button
            type="button"
            className="sf-split-main bt-text"
            data-role="button"
            disabled
          >
            Export PNG
          </button>
          <span className="sf-split-divider" />
          <button
            type="button"
            className="sf-split-menu"
            aria-label="Export options"
            disabled
          >
            <ChevronDown {...ICON} />
          </button>
        </span>
      </footer>
    </aside>
  );
}

export function SurfacesPage(): ReactElement {
  return (
    <div className="sf-app">
      <div className="sf-shell">
        <div className="sf-workspace">
          <header className="sf-header bt-surface" data-level="panel">
            <span className="sf-mark" aria-hidden="true" />
            <span className="sf-title bt-text bt-truncate" data-role="title-sm">
              Spring launch
            </span>
            <span className="sf-header-actions">
              <button
                type="button"
                className="sf-select bt-text"
                data-role="button"
              >
                Square
                <ChevronDown {...ICON} />
              </button>
              <span className="sf-separator" />
              <button
                type="button"
                className="sf-icon-button"
                aria-label="Undo"
              >
                <Undo2 {...ICON} />
              </button>
              <button
                type="button"
                className="sf-icon-button"
                aria-label="Redo"
                disabled
              >
                <Redo2 {...ICON} />
              </button>
              <button
                type="button"
                className="sf-icon-button"
                aria-label="Help"
              >
                <CircleHelp {...ICON} />
              </button>
            </span>
          </header>
          <section className="sf-stage" aria-label="Canvas">
            <EmptyStateDemo />
          </section>
        </div>
        <Inspector />
      </div>
    </div>
  );
}
