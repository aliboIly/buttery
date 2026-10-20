import type { ReactElement } from "react";
import { gradientCss, gradients } from "@buttery/core/palettes";
import { EmptyStateDemo } from "../demo/EmptyStateDemo.tsx";
import "./text-stacks-page.css";

const MEDIA = gradients.find((preset) => preset.id === "mist");

function OnboardingDemo(): ReactElement {
  return (
    <div
      className="ob-dialog bt-surface"
      data-level="dialog"
      data-testid="onboarding"
    >
      <div
        className="ob-media"
        style={{ background: MEDIA ? gradientCss(MEDIA) : undefined }}
      />
      <div className="ob-content">
        <div className="ob-lead">
          <div className="ob-copy">
            <div className="ob-head">
              <h2 className="bt-text" data-role="dialog-title">
                Make it yours
              </h2>
              <p className="bt-text" data-role="body">
                Pick a backdrop, round the corners and add depth. Every change
                shows up right away.
              </p>
            </div>
            <p className="bt-text" data-role="caption">
              Tip: hold Shift for finer steps.
            </p>
          </div>
          <div className="ob-dots" aria-hidden="true">
            <span className="ob-dot" />
            <span className="ob-dot" data-active="" />
            <span className="ob-dot" />
            <span className="ob-dot" />
          </div>
        </div>
        <div className="ob-actions">
          <button
            type="button"
            className="ob-button ob-soft bt-control bt-press bt-text"
            data-size="cta"
            data-role="button-lg"
          >
            Previous
          </button>
          <button
            type="button"
            className="ob-button ob-primary bt-control bt-press bt-text"
            data-size="cta"
            data-role="button-lg"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export function TextStacksPage(): ReactElement {
  return (
    <div className="pg-page">
      <div className="ts-stage">
        <OnboardingDemo />
        <div className="ts-empty">
          <EmptyStateDemo />
        </div>
      </div>
    </div>
  );
}
