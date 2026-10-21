import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { userEvent as browser } from "vitest/browser";
import { InfoButton } from "./InfoButton.tsx";

const INFO = "Every sale, before refunds and fees.";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

describe("InfoButton", () => {
  it("is a 28px button named by what it explains; it stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <InfoButton
        ref={ref}
        info={INFO}
        className="custom"
        data-testid="info"
      />,
    );
    const button = screen.getByRole("button", { name: INFO });
    expect(ref.current).toBe(button);
    expect(button.dataset["bt"]).toBe("InfoButton");
    expect(button.dataset["testid"]).toBe("info");
    expect(button.classList.contains("bt-info-button")).toBe(true);
    expect(button.classList.contains("custom")).toBe(true);
    expect(button.getBoundingClientRect().height).toBe(28);
  });

  it("opens what it explains in a popover when pressed, which Escape closes with focus back on the button", async () => {
    render(<InfoButton info={INFO} />);
    const button = screen.getByRole("button", { name: INFO });
    await userEvent.click(button);
    const popover = await screen.findByRole("dialog", { name: INFO });
    expect(popover.textContent).toBe(INFO);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(button);
  });

  it("opens on a tap, which no tooltip answers", async () => {
    render(<InfoButton info={INFO} />);
    const user = userEvent.setup();
    await user.pointer({
      keys: "[TouchA]",
      target: screen.getByRole("button", { name: INFO }),
    });
    expect(await screen.findByRole("dialog", { name: INFO })).toBeTruthy();
  });

  it("opens from the keyboard, and closes on a press elsewhere", async () => {
    render(
      <>
        <InfoButton info={INFO} />
        <p>Elsewhere</p>
      </>,
    );
    await browser.keyboard("{Shift}");
    screen.getByRole("button", { name: INFO }).focus();
    await browser.keyboard("{Enter}");
    expect(await screen.findByRole("dialog", { name: INFO })).toBeTruthy();
    await userEvent.click(screen.getByText("Elsewhere"));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});
