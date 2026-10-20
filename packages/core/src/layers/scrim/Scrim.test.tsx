import "../../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Layer } from "../layer/Layer.tsx";
import { Scrim } from "./Scrim.tsx";

afterEach(cleanup);

describe("Scrim", () => {
  it("covers the viewport under its layer's content and is hidden from assistive technology", () => {
    render(
      <Layer band="modal">
        <Scrim data-testid="scrim" />
      </Layer>,
    );
    const scrim = screen.getByTestId("scrim");
    expect(scrim.getAttribute("aria-hidden")).toBe("true");
    const rect = scrim.getBoundingClientRect();
    expect(rect.width).toBe(window.innerWidth);
    expect(rect.height).toBe(window.innerHeight);
  });

  it("dims with the overlay color or blurs under the wash", () => {
    render(
      <Layer band="modal">
        <Scrim data-testid="dim" />
        <Scrim variant="blur" data-testid="blur" />
      </Layer>,
    );
    expect(
      getComputedStyle(screen.getByTestId("dim")).backgroundColor,
    ).not.toBe("rgba(0, 0, 0, 0)");
    const blur = getComputedStyle(screen.getByTestId("blur"));
    expect(
      blur.backdropFilter || blur.getPropertyValue("-webkit-backdrop-filter"),
    ).toBe("blur(10px)");
  });

  it("sits under the content that follows it in the layer", () => {
    render(
      <Layer band="modal">
        <Scrim />
        <div
          style={{ display: "grid", placeItems: "center", blockSize: "100%" }}
        >
          <button type="button">Keep editing</button>
        </div>
      </Layer>,
    );
    const button = screen.getByRole("button", { name: "Keep editing" });
    const rect = button.getBoundingClientRect();
    expect(
      document.elementFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      ),
    ).toBe(button);
  });

  it("takes clicks so it can close what it belongs to", async () => {
    const onClick = vi.fn();
    render(
      <Layer band="modal">
        <Scrim data-testid="scrim" onClick={onClick} />
      </Layer>,
    );
    await userEvent.click(screen.getByTestId("scrim"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
