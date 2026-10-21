import "@buttery/core/styles.css";
import "../../styles.css";
import { ReflowGroup, useReflow } from "@buttery/core";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { motion } from "motion/react";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Banner } from "./Banner.tsx";

const KEY = "buttery:banner:test-refunds";

beforeEach(() => {
  window.localStorage.removeItem(KEY);
});

afterEach(cleanup);

function Refunds(props: {
  readonly onDismiss?: () => void;
  readonly storageKey?: string;
}): ReactElement {
  return (
    <Banner
      action={{ label: "Turn on automatic refunds", href: "#refunds" }}
      estimate="1 min"
      {...props}
    >
      Refund orders flagged as fraud before they turn into disputes.
    </Banner>
  );
}

describe("Banner", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Banner ref={ref} className="custom" id="tip">
        Message
      </Banner>,
    );
    expect(ref.current?.dataset["bt"]).toBe("Banner");
    expect(ref.current?.className).toBe("bt-banner custom");
    expect(ref.current?.id).toBe("tip");
  });

  it("reads as its message, a link to act on it, how long it takes and a dismiss button", () => {
    render(<Refunds />);
    expect(screen.getByText(/^Refund orders flagged/).dataset["role"]).toBe(
      "body-sm",
    );
    expect(
      screen
        .getByRole("link", { name: "Turn on automatic refunds" })
        .getAttribute("href"),
    ).toBe("#refunds");
    expect(
      screen.getByText("Takes about", { exact: false }).parentElement
        ?.textContent,
    ).toBe("Takes about 1 min");
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeTruthy();
  });

  it("makes the action a button when it has no href", async () => {
    const onClick = vi.fn();
    render(
      <Banner action={{ label: "Change the cutoff", onClick }}>
        Cutoff at 2pm.
      </Banner>,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Change the cutoff" }),
    );
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("fades out when dismissed, then goes, and stays gone under its storage key", async () => {
    const onDismiss = vi.fn();
    render(<Refunds onDismiss={onDismiss} storageKey="test-refunds" />);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(document.querySelector(".bt-banner")).toBeNull();
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem(KEY)).toBe("true");
    cleanup();
    render(<Refunds storageKey="test-refunds" />);
    expect(document.querySelector(".bt-banner")).toBeNull();
  });

  it("lets what's below slide up into its place in a reflow group", async () => {
    function Below(): ReactElement {
      return (
        <motion.div {...useReflow()} data-testid="below">
          Below
        </motion.div>
      );
    }
    render(
      <ReflowGroup>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            inlineSize: "800px",
          }}
        >
          <Refunds />
          <Below />
        </div>
      </ReflowGroup>,
    );
    const top = (): number =>
      screen.getByTestId("below").getBoundingClientRect().top;
    const before = top();
    const place =
      document.querySelector(".bt-banner")?.getBoundingClientRect().top ?? 0;
    act(() => {
      screen.getByRole("button", { name: "Dismiss" }).click();
    });
    await waitFor(() => {
      expect(document.querySelector(".bt-banner")).toBeNull();
    });
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(top()).toBeGreaterThan(place + (before - place) / 2);
    await waitFor(
      () => {
        expect(top()).toBeCloseTo(place, 0);
      },
      { timeout: 2000 },
    );
  });

  it("keeps the action beside the message with room, and puts it under the message under 640px", () => {
    const { rerender } = render(
      <div style={{ inlineSize: "900px" }}>
        <Refunds />
      </div>,
    );
    const message = (): DOMRect =>
      screen.getByText(/^Refund orders/).getBoundingClientRect();
    const link = (): DOMRect =>
      screen
        .getByRole("link", { name: "Turn on automatic refunds" })
        .getBoundingClientRect();
    expect(link().left).toBeGreaterThan(message().right);
    rerender(
      <div style={{ inlineSize: "360px" }}>
        <Refunds />
      </div>,
    );
    expect(link().top).toBeGreaterThan(message().bottom);
    expect(link().left).toBeCloseTo(message().left, 0);
  });
});
