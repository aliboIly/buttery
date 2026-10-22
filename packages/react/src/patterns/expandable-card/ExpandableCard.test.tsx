import "@buttery/core/styles.css";
import "../../styles.css";
import { MotionPreferenceContext, publishSettled } from "@buttery/core";
import { layoutCheckTokens, runLayoutChecks } from "@buttery/core/layout";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Bento } from "../bento/Bento.tsx";
import { ExpandableCard } from "./ExpandableCard.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

function cards(): void {
  render(
    <div style={{ inlineSize: "1216px" }}>
      <Bento>
        <ExpandableCard
          title="Lean it in 3D"
          span={8}
          detail={<p>Steer the lean pad.</p>}
        >
          <div>Picture</div>
        </ExpandableCard>
        <Bento.Card title="Any size" span={4} data-testid="other" />
      </Bento>
    </div>,
  );
}

async function settled(): Promise<void> {
  await waitFor(() => {
    expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(true);
  });
}

describe("ExpandableCard", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <ExpandableCard
        ref={ref}
        title="Lean"
        detail={null}
        className="custom"
        data-testid="card"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("ExpandableCard");
    expect(ref.current?.dataset["testid"]).toBe("card");
    expect(ref.current?.className).toBe(
      "bt-bento-card bt-expandable-card custom",
    );
  });

  it("opens from its expand button into a dialog named by its title, the other cards stepping back", async () => {
    cards();
    await userEvent.click(
      screen.getByRole("button", { name: "Open Lean it in 3D" }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Lean it in 3D" });
    expect(dialog.textContent).toContain("Steer the lean pad.");
    expect(document.activeElement).toBe(dialog);
    expect(
      document
        .querySelector('[data-bt="Bento"]')
        ?.hasAttribute("data-expanded"),
    ).toBe(true);
    await settled();
    await waitFor(() => {
      expect(getComputedStyle(screen.getByTestId("other")).opacity).toBe("0");
    });
  });

  it("leaves nothing overflowing a one-row grid once it has opened, with full motion", async () => {
    render(
      <MotionPreferenceContext value="full">
        <Bento>
          <ExpandableCard
            title="Lean it in 3D"
            span={8}
            detail={<p>Steer the lean pad.</p>}
          >
            <div>Picture</div>
          </ExpandableCard>
        </Bento>
      </MotionPreferenceContext>,
    );
    const card = screen.getByRole("article");
    await userEvent.click(
      screen.getByRole("button", { name: "Open Lean it in 3D" }),
    );
    await screen.findByRole("dialog", { name: "Lean it in 3D" });
    await settled();
    await waitFor(() => {
      expect(getComputedStyle(card).opacity).toBe("0");
    });
    expect(
      runLayoutChecks({ tokens: layoutCheckTokens(), rules: ["overflow"] }),
    ).toEqual([]);
  });

  it("opens from a press anywhere on the card", async () => {
    cards();
    await userEvent.click(screen.getByText("Picture"));
    expect(
      await screen.findByRole("dialog", { name: "Lean it in 3D" }),
    ).toBeTruthy();
  });

  it("closes on Escape with focus back on the expand button, and the others come back", async () => {
    cards();
    const expand = screen.getByRole("button", { name: "Open Lean it in 3D" });
    await userEvent.click(expand);
    await screen.findByRole("dialog");
    await settled();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(expand);
    expect(
      document
        .querySelector('[data-bt="Bento"]')
        ?.hasAttribute("data-expanded"),
    ).toBe(false);
  });

  it("tells its owner once when its expand button opens it", async () => {
    const onOpenChange = vi.fn();
    render(
      <ExpandableCard title="Lean" detail={null} onOpenChange={onOpenChange} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open Lean" }));
    await screen.findByRole("dialog");
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("keeps the page unsettled while the card travels back", async () => {
    cards();
    await userEvent.click(
      screen.getByRole("button", { name: "Open Lean it in 3D" }),
    );
    await screen.findByRole("dialog");
    await settled();
    await userEvent.keyboard("{Escape}");
    const card = document.querySelector('[data-bt="ExpandableCard"]');
    await waitFor(() => {
      expect(card?.hasAttribute("data-travelling")).toBe(true);
    });
    expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(
      false,
    );
    await settled();
  });

  it("closes from its close button", async () => {
    cards();
    await userEvent.click(
      screen.getByRole("button", { name: "Open Lean it in 3D" }),
    );
    await screen.findByRole("dialog");
    await settled();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});
