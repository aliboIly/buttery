import "@buttery/core/styles.css";
import "../../styles.css";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Repeat, Truck } from "lucide-react";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FeatureIntro } from "./FeatureIntro.tsx";
import type { FeatureIntroProps } from "./FeatureIntro.tsx";

afterEach(cleanup);

function Intro(
  props: Partial<FeatureIntroProps> & { readonly width?: number },
): ReactElement {
  const { width = 900, ...rest } = props;
  return (
    <div style={{ inlineSize: `${String(width)}px` }}>
      <FeatureIntro
        title="Sell your coffee by subscription"
        description="Ship a fresh bag on a schedule."
        benefits={[
          { icon: Repeat, text: "Every week or every two" },
          { icon: Truck, text: "Ships the morning it's due" },
        ]}
        action={{ label: "Create a plan", href: "#plans" }}
        docs={{ label: "How subscriptions work", href: "#docs" }}
        media={<div data-testid="media" style={{ blockSize: "120px" }} />}
        {...rest}
      />
    </div>
  );
}

describe("FeatureIntro", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <FeatureIntro
        ref={ref}
        title="T"
        description="D"
        className="custom"
        id="intro"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("FeatureIntro");
    expect(ref.current?.className).toBe("bt-feature-intro custom");
    expect(ref.current?.id).toBe("intro");
  });

  it("is a section named by its h2 title, with its benefits as a list and a way in", () => {
    render(<Intro />);
    const section = screen.getByRole("region", {
      name: "Sell your coffee by subscription",
    });
    expect(within(section).getByRole("heading", { level: 2 })).toBeTruthy();
    expect(
      within(section)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["Every week or every two", "Ships the morning it's due"]);
    const action = within(section).getByRole("link", { name: "Create a plan" });
    expect(action.getAttribute("href")).toBe("#plans");
    expect(action.dataset["variant"]).toBe("primary");
    expect(
      within(section).getByRole("link", { name: "How subscriptions work" }),
    ).toBeTruthy();
  });

  it("puts the copy beside the media with room, and the media under it below 720px", () => {
    const { rerender } = render(<Intro width={900} />);
    const copy = (): DOMRect =>
      screen.getByRole("heading", { level: 2 }).getBoundingClientRect();
    const media = (): DOMRect =>
      screen.getByTestId("media").getBoundingClientRect();
    expect(media().left).toBeGreaterThan(copy().left);
    rerender(<Intro width={600} />);
    expect(media().top).toBeGreaterThan(copy().bottom);
  });

  it("shows a dismiss button only when dismissible, and fades away when it's pressed", async () => {
    const onDismiss = vi.fn();
    render(<Intro />);
    expect(screen.queryByRole("button", { name: "Dismiss" })).toBeNull();
    cleanup();
    render(<Intro dismissible onDismiss={onDismiss} />);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    await waitFor(() => {
      expect(document.querySelector(".bt-feature-intro")).toBeNull();
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("makes the action a primary button when it has no href", async () => {
    const onClick = vi.fn();
    render(
      <Intro
        action={{ label: "Add a bank account", onClick }}
        docs={undefined}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Add a bank account" }),
    );
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
