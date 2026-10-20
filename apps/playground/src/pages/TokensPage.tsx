import type { ReactElement, ReactNode } from "react";
import {
  colors,
  displayRoles,
  durations,
  easings,
  heights,
  radii,
  shadows,
  space,
  spaceVar,
  textRoles,
  widths,
  zIndex,
} from "@buttery/core";
import type { SpaceStep } from "@buttery/core";
import "./tokens-page.css";

const SAMPLE = "Pick a backdrop and round the corners";

function Section({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <section className="pg-section">
      <h2 className="bt-text" data-role="dialog-title">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function TokensPage(): ReactElement {
  return (
    <div className="pg-page">
      <Section title="Color">
        <div className="pg-grid">
          {Object.entries(colors).map(([name, definition]) => (
            <figure key={name} className="tk-swatch">
              <span
                className="tk-chip"
                style={{ background: `var(--bt-${name})` }}
              />
              <figcaption className="tk-caption">
                <span className="bt-text" data-role="label">
                  {name}
                </span>
                <span className="pg-mono">
                  {definition.light} · {definition.dark}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section title="Text roles">
        <div className="tk-list bt-surface" data-level="card">
          {Object.entries(textRoles).map(([name, role]) => (
            <div key={name} className="tk-row">
              <span className="bt-text" data-role={name}>
                {SAMPLE}
              </span>
              <span className="pg-mono">
                {name} · {role.size}/{role.lineHeight} · {role.weight}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Display roles">
        <div className="tk-display bt-surface" data-level="card">
          {Object.entries(displayRoles).map(([name, role]) => (
            <div key={name} className="tk-display-item">
              <span className="bt-text" data-role={name}>
                Make anything buttery
              </span>
              <span className="pg-mono">
                {name} · sm {role.steps.sm.join("/")} · md{" "}
                {role.steps.md.join("/")} · lg {role.steps.lg.join("/")}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Spacing">
        <div className="tk-list bt-surface" data-level="card">
          {(Object.keys(space) as SpaceStep[]).map((step) => (
            <div key={step} className="tk-row">
              <span
                className="tk-bar"
                style={{ inlineSize: `var(${spaceVar(step)})` }}
              />
              <span className="pg-mono">
                {spaceVar(step)} · {space[step]}px
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Radius">
        <div className="pg-grid">
          {Object.entries(radii).map(([name, value]) => (
            <figure key={name} className="tk-swatch">
              <span
                className="tk-radius"
                style={{ borderRadius: `var(--bt-r-${name})` }}
              />
              <figcaption className="pg-mono">
                --bt-r-{name} · {value}px
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section title="Elevation">
        <div className="pg-grid">
          {Object.keys(shadows).map((name) => (
            <figure key={name} className="tk-swatch">
              <span
                className="tk-shadow"
                style={{ boxShadow: `var(--bt-${name})` }}
              />
              <figcaption className="pg-mono">--bt-{name}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section title="Heights">
        <div className="tk-heights bt-surface" data-level="card">
          {Object.entries(heights).map(([name, definition]) => (
            <figure key={name} className="tk-height">
              <span
                className="tk-height-bar"
                style={{ blockSize: `var(--bt-h-${name})` }}
              />
              <figcaption className="pg-mono">
                {name} · {definition.comfortable} / {definition.compact}
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section title="Widths, layers and motion">
        <dl className="tk-defs bt-surface" data-level="card">
          {Object.values(widths).map((definition) => (
            <div key={definition.cssVar} className="tk-def">
              <dt className="pg-mono">{definition.cssVar}</dt>
              <dd className="bt-text" data-role="label">
                {definition.value}px
              </dd>
            </div>
          ))}
          {Object.entries(zIndex).map(([name, value]) => (
            <div key={name} className="tk-def">
              <dt className="pg-mono">--bt-z-{name}</dt>
              <dd className="bt-text" data-role="label">
                {value}
              </dd>
            </div>
          ))}
          {Object.entries(durations).map(([name, value]) => (
            <div key={name} className="tk-def">
              <dt className="pg-mono">--bt-dur-{name}</dt>
              <dd className="bt-text" data-role="label">
                {value}ms
              </dd>
            </div>
          ))}
          {Object.entries(easings).map(([name, value]) => (
            <div key={name} className="tk-def">
              <dt className="pg-mono">--bt-ease-{name}</dt>
              <dd className="bt-text" data-role="label">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </Section>
    </div>
  );
}
