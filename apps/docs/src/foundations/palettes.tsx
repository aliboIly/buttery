import type { ReactElement } from "react";
import { formatOklch } from "@buttery/core";
import { gradientCss, gradients, solids } from "@buttery/core/palettes";
import "./palettes.css";

export function PaletteGrids(): ReactElement {
  return (
    <div className="pg-page">
      <section className="pg-section">
        <h2 className="bt-text" data-role="dialog-title">
          Gradients
        </h2>
        <div className="pl-grid" data-testid="gradients">
          {gradients.map((preset) => (
            <figure key={preset.id} className="pl-tile">
              <span
                className="pl-swatch"
                style={{ background: gradientCss(preset) }}
              />
              <figcaption className="pl-caption">
                <span className="bt-text" data-role="label">
                  {preset.name}
                </span>
                <span className="pg-mono">
                  {formatOklch(preset.from)} → {formatOklch(preset.to)}
                </span>
                <span className="pg-mono">
                  {preset.fromHex} → {preset.toHex}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="pg-section">
        <h2 className="bt-text" data-role="dialog-title">
          Solids
        </h2>
        <div className="pl-grid" data-testid="solids">
          {solids.map((preset) => (
            <figure key={preset.id} className="pl-tile">
              <span className="pl-swatch" style={{ background: preset.hex }} />
              <figcaption className="pl-caption">
                <span className="bt-text" data-role="label">
                  {preset.name}
                </span>
                <span className="pg-mono">
                  {formatOklch(preset.color)} · {preset.hex}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
