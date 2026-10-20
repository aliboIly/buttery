import type { ReactElement } from "react";
import "./empty-state-demo.css";

/** A static empty state built from text roles and spacing tokens, until the EmptyState pattern lands. */
export function EmptyStateDemo(): ReactElement {
  return (
    <div className="es-root" data-testid="empty-state">
      <div className="es-text">
        <h2 className="bt-text" data-role="title">
          Your canvas is empty
        </h2>
        <p className="bt-text" data-role="body-sm">
          Bring in a photo, or start from a blank card.
        </p>
      </div>
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
