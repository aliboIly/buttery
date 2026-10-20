import type { ReactElement } from "react";
import { TextStack } from "@buttery/core";
import "./empty-state-demo.css";

/** A static empty state built from text roles and spacing tokens, until the EmptyState pattern lands. */
export function EmptyStateDemo(): ReactElement {
  return (
    <div className="es-root" data-testid="empty-state">
      <TextStack
        size="empty"
        align="center"
        title="Your canvas is empty"
        body="Bring in a photo, or start from a blank card."
      />
      <div className="es-actions">
        <button
          type="button"
          className="es-button es-primary bt-control bt-press bt-text"
          data-size="button"
          data-role="button"
        >
          Import photo
        </button>
        <button
          type="button"
          className="es-button es-secondary bt-control bt-press bt-text"
          data-size="button"
          data-role="button"
        >
          Blank card
        </button>
      </div>
    </div>
  );
}
