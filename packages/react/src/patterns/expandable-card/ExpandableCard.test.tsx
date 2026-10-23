import "@butteryui/core/styles.css";
import "../../styles.css";
import { MotionPreferenceContext, publishSettled } from "@butteryui/core";
import { layoutCheckTokens, runLayoutChecks } from "@butteryui/core/layout";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent as browser } from "vitest/browser";
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
          title="Tilt it in 3D"
          span={8}
          detail={<p>Steer the tilt pad.</p>}
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
        title="Tilt"
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
      screen.getByRole("button", { name: "Open Tilt it in 3D" }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Tilt it in 3D" });
    expect(dialog.textContent).toContain("Steer the tilt pad.");
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
            title="Tilt it in 3D"
            span={8}
            detail={<p>Steer the tilt pad.</p>}
          >
            <div>Picture</div>
          </ExpandableCard>
        </Bento>
      </MotionPreferenceContext>,
    );
    const card = screen.getByRole("article");
    await userEvent.click(
      screen.getByRole("button", { name: "Open Tilt it in 3D" }),
    );
    await screen.findByRole("dialog", { name: "Tilt it in 3D" });
    await settled();
    await waitFor(() => {
      expect(getComputedStyle(card).opacity).toBe("0");
    });
    expect(
      runLayoutChecks({ tokens: layoutCheckTokens(), rules: ["overflow"] }),
    ).toEqual([]);
  });

  it("draws its variant in the grid and opens on the dialog surface whatever it is", async () => {
    render(
      <Bento>
        <ExpandableCard
          title="Tilt it in 3D"
          variant="tinted"
          detail={<p>Steer the tilt pad.</p>}
        >
          <div>Picture</div>
        </ExpandableCard>
      </Bento>,
    );
    const card = screen.getByRole("article");
    expect(getComputedStyle(card).backgroundColor).toBe("rgb(251, 244, 218)");
    expect(getComputedStyle(card).boxShadow).toBe("none");
    await browser.click(
      screen.getByRole("button", { name: "Open Tilt it in 3D" }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Tilt it in 3D" });
    expect(getComputedStyle(dialog).backgroundColor).toBe("rgb(255, 255, 255)");
    await browser.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("keeps a plain card's expand button at its top end corner, its focus ring unclipped", () => {
    render(
      <div style={{ inlineSize: "640px" }}>
        <Bento>
          <ExpandableCard
            title="Every change kept"
            variant="plain"
            detail={<p>Undo and redo.</p>}
          >
            <div>Picture</div>
          </ExpandableCard>
        </Bento>
      </div>,
    );
    const card = screen.getByRole("article");
    const expand = screen.getByRole("button", {
      name: "Open Every change kept",
    });
    const head = card.querySelector('[data-bt-part="head"]');
    if (!head) throw new Error("no head");
    const cardBox = card.getBoundingClientRect();
    const box = expand.getBoundingClientRect();
    expect(box.right).toBe(cardBox.right);
    expect(box.top - cardBox.top).toBe(
      Number.parseFloat(getComputedStyle(head).paddingTop),
    );
    expect(getComputedStyle(card).overflow).toBe("visible");
    expect(getComputedStyle(card).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  });

  it("opens from a press anywhere on the card", async () => {
    cards();
    await userEvent.click(screen.getByText("Picture"));
    expect(
      await screen.findByRole("dialog", { name: "Tilt it in 3D" }),
    ).toBeTruthy();
  });

  it("closes on Escape with focus back on the expand button, and the others come back", async () => {
    cards();
    const expand = screen.getByRole("button", { name: "Open Tilt it in 3D" });
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
      <ExpandableCard title="Tilt" detail={null} onOpenChange={onOpenChange} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open Tilt" }));
    await screen.findByRole("dialog");
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("keeps the page unsettled while the card travels back", async () => {
    cards();
    await userEvent.click(
      screen.getByRole("button", { name: "Open Tilt it in 3D" }),
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
      screen.getByRole("button", { name: "Open Tilt it in 3D" }),
    );
    await screen.findByRole("dialog");
    await settled();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});
