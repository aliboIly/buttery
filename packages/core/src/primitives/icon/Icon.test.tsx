import "../../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import type { IconComponentProps } from "./Icon.tsx";
import { Icon } from "./Icon.tsx";

afterEach(cleanup);

function Dot(props: IconComponentProps): ReactElement {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} strokeWidth={2} {...props}>
      <circle cx={12} cy={12} r={4} />
    </svg>
  );
}

describe("Icon", () => {
  it("is decorative unless it has a label", () => {
    render(
      <>
        <Icon icon={Dot} data-testid="plain" />
        <Icon icon={Dot} label="Add a photo" />
      </>,
    );
    expect(screen.getByTestId("plain").getAttribute("aria-hidden")).toBe(
      "true",
    );
    expect(screen.getByRole("img", { name: "Add a photo" })).toBeTruthy();
  });

  it("draws at 16px with a 1.75 stroke inside controls and 20px in empty states", () => {
    render(
      <>
        <Icon icon={Dot} data-testid="sm" />
        <Icon icon={Dot} size="md" data-testid="md" />
      </>,
    );
    const sm = screen.getByTestId("sm");
    expect(sm.getBoundingClientRect().width).toBe(16);
    expect(getComputedStyle(sm).strokeWidth).toBe("1.75px");
    expect(screen.getByTestId("md").getBoundingClientRect().height).toBe(20);
  });
});
