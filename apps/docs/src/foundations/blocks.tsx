import type { ReactElement } from "react";
import { VisuallyHidden } from "radix-ui";
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
import "./blocks.css";
import { COLOR_GROUPS } from "./color-groups.ts";
import type { ColorGroup } from "./color-groups.ts";
import { TableScroll } from "../TableScroll.tsx";

const SAMPLE = "Pick a backdrop and round the corners";

/** A table of the color tokens in one role: a swatch, the token, its light and dark values, and its use. */
export function ColorTable({
  group,
}: {
  readonly group: ColorGroup;
}): ReactElement {
  const starts: readonly string[] = COLOR_GROUPS[group];
  const rows = Object.entries(colors).filter(([name]) =>
    starts.some((start) => name.startsWith(start)),
  );
  return (
    <TableScroll label={`${group} colors`}>
      <table className="tk-table">
        <thead>
          <tr>
            <th scope="col">
              <VisuallyHidden.Root>Swatch</VisuallyHidden.Root>
            </th>
            <th scope="col">Token</th>
            <th scope="col">Light</th>
            <th scope="col">Dark</th>
            <th scope="col">Use</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, definition]) => (
            <tr key={name}>
              <td>
                <span
                  className="tk-dot"
                  style={{ background: `var(--bt-${name})` }}
                />
              </td>
              <td className="pg-mono docs-token">--bt-{name}</td>
              <td className="pg-mono">{definition.light}</td>
              <td className="pg-mono">{definition.dark}</td>
              <td>{definition.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  );
}

/** Every color token, each a swatch with its light and dark values. */
export function ColorTokens(): ReactElement {
  return (
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
  );
}

/** Every text role, set in itself, with its size, line height and weight. */
export function TextRoles(): ReactElement {
  return (
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
  );
}

/** The display roles for heroes, with the sizes they step through by width. */
export function DisplayRoles(): ReactElement {
  return (
    <div className="tk-display bt-surface" data-level="card">
      {Object.entries(displayRoles).map(([name, role]) => (
        <div key={name} className="tk-display-item">
          <span className="bt-text" data-role={name}>
            Make anything buttery
          </span>
          <span className="pg-mono">
            {name} · sm {role.steps.sm.join("/")} · md {role.steps.md.join("/")}{" "}
            · lg {role.steps.lg.join("/")}
          </span>
        </div>
      ))}
    </div>
  );
}

/** The spacing scale, each step a bar as long as it is. */
export function SpacingScale(): ReactElement {
  return (
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
  );
}

/** The radius scale, each a square rounded by it. */
export function RadiusScale(): ReactElement {
  return (
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
  );
}

/** Every shadow, each on a card of its own. */
export function Shadows(): ReactElement {
  return (
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
  );
}

/** The control heights, comfortable and compact. */
export function HeightScale(): ReactElement {
  return (
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
  );
}

function Definitions({
  rows,
}: {
  readonly rows: readonly (readonly [string, string])[];
}): ReactElement {
  return (
    <dl className="tk-defs bt-surface" data-level="card">
      {rows.map(([term, value]) => (
        <div key={term} className="tk-def">
          <dt className="pg-mono">{term}</dt>
          <dd className="bt-text" data-role="label">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** The width tokens and their values. */
export function WidthTokens(): ReactElement {
  return (
    <Definitions
      rows={Object.values(widths).map(
        (definition) =>
          [definition.cssVar, `${String(definition.value)}px`] as const,
      )}
    />
  );
}

/** The layer bands, lowest first. */
export function LayerTokens(): ReactElement {
  return (
    <Definitions
      rows={Object.entries(zIndex).map(
        ([name, value]) => [`--bt-z-${name}`, String(value)] as const,
      )}
    />
  );
}

/** The durations and easings tweens use. */
export function MotionTokens(): ReactElement {
  return (
    <Definitions
      rows={[
        ...Object.entries(durations).map(
          ([name, value]) =>
            [`--bt-dur-${name}`, `${String(value)}ms`] as const,
        ),
        ...Object.entries(easings).map(
          ([name, value]) => [`--bt-ease-${name}`, value] as const,
        ),
      ]}
    />
  );
}
