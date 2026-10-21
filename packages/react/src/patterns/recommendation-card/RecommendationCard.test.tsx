import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RecommendationCard } from "./RecommendationCard.tsx";

const KEY = "buttery:recommendation:test-alerts";

beforeEach(() => {
  window.localStorage.removeItem(KEY);
});

afterEach(cleanup);

describe("RecommendationCard", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <RecommendationCard ref={ref} title="Tip" className="custom" id="tip">
        Body
      </RecommendationCard>,
    );
    expect(ref.current?.dataset["bt"]).toBe("RecommendationCard");
    expect(ref.current?.className).toBe("bt-recommendation-card custom");
    expect(ref.current?.id).toBe("tip");
  });

  it("reads as a badge, an h3 title, the reason, a link to do it and how long it takes", () => {
    render(
      <RecommendationCard
        title="Send low-stock alerts"
        action={{ label: "Turn on alerts", href: "#alerts" }}
        estimate="2 min"
      >
        Get a message when a coffee runs low.
      </RecommendationCard>,
    );
    expect(
      screen
        .getByText("Tip")
        .closest("[data-bt='StatusBadge']")
        ?.getAttribute("data-tone"),
    ).toBe("info");
    expect(
      screen.getByRole("heading", { level: 3, name: "Send low-stock alerts" }),
    ).toBeTruthy();
    expect(
      screen.getByText("Get a message when a coffee runs low.").dataset["role"],
    ).toBe("body-sm");
    expect(
      screen.getByRole("link", { name: "Turn on alerts" }).getAttribute("href"),
    ).toBe("#alerts");
    expect(screen.getByText(/Takes about/).parentElement?.textContent).toBe(
      "Takes about 2 min",
    );
  });

  it("makes the action a button that looks like a link when it has no href", async () => {
    const onClick = vi.fn();
    render(
      <RecommendationCard
        title="Discounts"
        action={{ label: "Draft a discount", onClick }}
      >
        Body
      </RecommendationCard>,
    );
    const button = screen.getByRole("button", { name: "Draft a discount" });
    expect(getComputedStyle(button).borderTopWidth).toBe("0px");
    expect(getComputedStyle(button).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("runs its media edge to edge along the bottom", () => {
    render(
      <div style={{ inlineSize: "320px" }}>
        <RecommendationCard
          title="Alerts"
          media={<div data-testid="media" style={{ blockSize: "40px" }} />}
        >
          Body
        </RecommendationCard>
      </div>,
    );
    const card = document
      .querySelector(".bt-recommendation-card")
      ?.getBoundingClientRect();
    const media = screen.getByTestId("media").getBoundingClientRect();
    expect(media.left).toBe(card?.left);
    expect(media.right).toBe(card?.right);
    expect(media.bottom).toBe(card?.bottom);
  });

  it("fades out when dismissed and stays gone under its storage key", async () => {
    const onDismiss = vi.fn();
    render(
      <RecommendationCard
        title="Alerts"
        storageKey="test-alerts"
        onDismiss={onDismiss}
      >
        Body
      </RecommendationCard>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    await waitFor(() => {
      expect(document.querySelector(".bt-recommendation-card")).toBeNull();
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem(KEY)).toBe("true");
  });
});
