import "../../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Layer, Portal } from "./Layer.tsx";

afterEach(cleanup);

function layerOf(element: HTMLElement): HTMLElement {
  const layer = element.closest<HTMLElement>("[data-bt-layer]");
  if (!layer) throw new Error("not inside a layer");
  return layer;
}

describe("Layer", () => {
  it("renders into a viewport-sized container at its band's z-index", () => {
    render(
      <Layer band="modal">
        <p>Dialog</p>
      </Layer>,
    );
    const layer = layerOf(screen.getByText("Dialog"));
    expect(layer.parentElement).toBe(document.body);
    expect(layer.dataset["btLayer"]).toBe("modal");
    const style = getComputedStyle(layer);
    expect(style.zIndex).toBe("60");
    expect(style.position).toBe("fixed");
    expect(style.pointerEvents).toBe("none");
    expect(getComputedStyle(screen.getByText("Dialog")).pointerEvents).toBe(
      "auto",
    );
  });

  it("nests a lower band inside its parent and puts a higher band at the root", () => {
    render(
      <Layer band="modal">
        <p>Dialog</p>
        <Layer band="dropdown">
          <p>Menu</p>
        </Layer>
        <Layer band="tooltip">
          <p>Tip</p>
        </Layer>
      </Layer>,
    );
    const modal = layerOf(screen.getByText("Dialog"));
    expect(layerOf(screen.getByText("Menu")).parentElement).toBe(modal);
    expect(layerOf(screen.getByText("Tip")).parentElement).toBe(document.body);
  });

  it("lets clicks through a nested layer to the layer under it", () => {
    render(
      <Layer band="modal">
        <button type="button" style={{ margin: "40px" }}>
          Rename
        </button>
        <Layer band="dropdown">
          <p style={{ margin: "200px" }}>Menu</p>
        </Layer>
      </Layer>,
    );
    const button = screen.getByRole("button", { name: "Rename" });
    const rect = button.getBoundingClientRect();
    expect(
      document.elementFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      ),
    ).toBe(button);
  });

  it("removes its container on unmount", () => {
    const { unmount } = render(
      <Layer band="toast">
        <p>Saved</p>
      </Layer>,
    );
    unmount();
    expect(document.querySelector("[data-bt-layer]")).toBeNull();
  });
});

describe("Portal", () => {
  it("renders into the current layer without starting a new one", () => {
    render(
      <Layer band="floating">
        <div>
          <Portal>
            <p>Moved</p>
          </Portal>
        </div>
      </Layer>,
    );
    const moved = screen.getByText("Moved");
    expect(moved.parentElement?.dataset["btLayer"]).toBe("floating");
    expect(document.querySelectorAll("[data-bt-layer]")).toHaveLength(1);
  });
});
