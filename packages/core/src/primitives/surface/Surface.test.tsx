import "../../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Surface } from "./Surface.tsx";

afterEach(cleanup);

function radius(id: string): string {
  return getComputedStyle(screen.getByTestId(id)).borderTopLeftRadius;
}

describe("Surface", () => {
  it("applies its level's radius and padding", () => {
    render(
      <>
        <Surface level="panel" data-testid="panel" />
        <Surface data-testid="card" />
      </>,
    );
    expect(radius("panel")).toBe("16px");
    expect(getComputedStyle(screen.getByTestId("panel")).paddingTop).toBe(
      "8px",
    );
    expect(radius("card")).toBe("12px");
    expect(screen.getByTestId("card").dataset["level"]).toBe("card");
  });

  it("nests concentrically with radius auto", () => {
    render(
      <Surface level="section" data-testid="section">
        <Surface radius="auto" data-testid="card">
          <Surface radius="auto" pad={2} data-testid="inner" />
        </Surface>
      </Surface>,
    );
    expect(radius("section")).toBe("16px");
    expect(radius("card")).toBe("12px");
    expect(radius("inner")).toBe("12px");
  });

  it("never nests below 4px and follows a padding override", () => {
    render(
      <Surface level="panel" pad={4} data-testid="panel">
        <Surface radius="auto" pad={3} data-testid="card">
          <Surface radius="auto" data-testid="inner" />
        </Surface>
      </Surface>,
    );
    expect(radius("card")).toBe("4px");
    expect(radius("inner")).toBe("4px");
  });

  it("takes a radius token and keeps the caller's style", () => {
    render(<Surface radius="sm" style={{ opacity: 0.5 }} data-testid="card" />);
    expect(radius("card")).toBe("8px");
    expect(screen.getByTestId("card").style.opacity).toBe("0.5");
  });
});
