import type { ReactElement } from "react";
import { colors, radii, surfaceLevels, surfaces } from "@butteryui/core";
import type {
  ColorScheme,
  SurfaceDefinition,
  SurfaceLevel,
} from "@butteryui/core";
import { ButteryProvider } from "@butteryui/react";
import "./levels.css";

const SCHEMES: readonly ColorScheme[] = ["light", "dark"];

function LevelTile({
  level,
  scheme,
}: {
  readonly level: SurfaceLevel;
  readonly scheme: ColorScheme;
}): ReactElement {
  const surface: SurfaceDefinition = surfaces[level];
  const details = [
    `bg ${colors[surface.background][scheme]}`,
    surface.border ? `edge ${colors[surface.border][scheme]}` : null,
    surface.shadow ?? null,
    surface.radius === "none" ? null : `r ${String(radii[surface.radius])}`,
  ].filter((detail) => detail !== null);
  return (
    <div
      className="lv-tile bt-surface"
      data-level={level}
      data-testid={`level-${scheme}-${level}`}
    >
      <span className="bt-text" data-role="label">
        {level}
      </span>
      <span className="pg-mono">{details.join(" · ")}</span>
    </div>
  );
}

export function SurfaceLevels(): ReactElement {
  return (
    <div className="pg-page">
      <div className="lv-columns">
        {SCHEMES.map((scheme) => (
          <ButteryProvider key={scheme} colorScheme={scheme}>
            <section
              className="lv-column bt-surface"
              data-level="app"
              aria-label={`${scheme} surfaces`}
            >
              <h2 className="bt-text" data-role="dialog-title">
                {scheme}
              </h2>
              <div className="lv-levels">
                {surfaceLevels
                  .filter((level) => level !== "app")
                  .map((level) => (
                    <LevelTile key={level} level={level} scheme={scheme} />
                  ))}
              </div>
              <div className="lv-nesting bt-surface" data-level="panel">
                <div className="lv-nested bt-surface" data-level="section">
                  <span className="lv-nested-title bt-text" data-role="control">
                    Section
                  </span>
                  <div className="bt-surface" data-level="card">
                    <div className="lv-nested-row">
                      <span className="bt-text" data-role="label">
                        Card row
                      </span>
                    </div>
                    <div className="lv-nested-row">
                      <span className="bt-text" data-role="label">
                        Card row
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </ButteryProvider>
        ))}
      </div>
    </div>
  );
}
