import "@butteryui/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@butteryui/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { RadioCardGroup } from "./RadioCardGroup.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

const OPTIONS = [
  {
    value: "all",
    label: "Screen every renewal",
    description: "Every renewal waits for a fraud check.",
  },
  {
    value: "some",
    label: "Screen the first renewals only",
    description: "Renewals after that go through without a check.",
    detail: <input aria-label="Renewals to screen" />,
  },
  { value: "none", label: "Don't screen renewals", disabled: true },
] as const;

describe("RadioCardGroup", () => {
  it("is a radio group named by its label that takes the ref, class and other props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <RadioCardGroup
        ref={ref}
        label="Renewal screening"
        options={OPTIONS}
        className="custom"
        data-testid="screening"
      />,
    );
    const group = screen.getByRole("radiogroup", { name: "Renewal screening" });
    expect(ref.current).toBe(group);
    expect(group.dataset["bt"]).toBe("RadioCardGroup");
    expect(group.dataset["testid"]).toBe("screening");
    expect(group.className).toBe("bt-radio-card-group custom");
  });

  it("names each radio by its label and describes it by its line, the first chosen", () => {
    render(<RadioCardGroup label="Renewal screening" options={OPTIONS} />);
    const all = screen.getByRole("radio", { name: "Screen every renewal" });
    expect(all).toHaveAccessibleDescription(
      "Every renewal waits for a fraud check.",
    );
    expect(all.getAttribute("aria-checked")).toBe("true");
    expect(
      screen
        .getByRole("radio", { name: "Don't screen renewals" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });

  it("opens a chosen option's own field under it, lined up with its name", async () => {
    const onValueChange = vi.fn();
    render(
      <div style={{ inlineSize: "480px" }}>
        <RadioCardGroup
          label="Renewal screening"
          options={OPTIONS}
          onValueChange={onValueChange}
        />
      </div>,
    );
    expect(screen.queryByLabelText("Renewals to screen")).toBeNull();
    await userEvent.click(screen.getByText("Screen the first renewals only"));
    expect(onValueChange).toHaveBeenCalledWith("some");
    const field = await screen.findByLabelText("Renewals to screen");
    await waitFor(() => {
      expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(
        true,
      );
    });
    expect(field.getBoundingClientRect().left).toBe(
      screen.getByText("Screen the first renewals only").getBoundingClientRect()
        .left,
    );
  });

  it("moves between options and chooses with the arrow keys, skipping a disabled one", async () => {
    render(<RadioCardGroup label="Renewal screening" options={OPTIONS} />);
    await userEvent.keyboard("{Shift}");
    screen.getByRole("radio", { name: "Screen every renewal" }).focus();
    await userEvent.keyboard("{ArrowDown>}");
    await userEvent.keyboard("{/ArrowDown}");
    const some = screen.getByRole("radio", {
      name: "Screen the first renewals only",
    });
    expect(document.activeElement).toBe(some);
    expect(some.getAttribute("aria-checked")).toBe("true");
    await userEvent.keyboard("{ArrowDown>}");
    await userEvent.keyboard("{/ArrowDown}");
    const all = screen.getByRole("radio", { name: "Screen every renewal" });
    expect(document.activeElement).toBe(all);
    expect(all.getAttribute("aria-checked")).toBe("true");
  });

  it("gives each radio a 24px target", () => {
    render(<RadioCardGroup label="Renewal screening" options={OPTIONS} />);
    const hit = screen
      .getByRole("radio", { name: "Screen every renewal" })
      .querySelector('[data-bt-part="radio-card-group-hit"]');
    expect(hit?.getBoundingClientRect().width).toBe(24);
    expect(hit?.getBoundingClientRect().height).toBe(24);
  });

  it("keeps options 12 apart whether or not they hold a detail, and opens a detail 8 under its line", async () => {
    render(
      <div style={{ inlineSize: "480px" }}>
        <RadioCardGroup label="Renewal screening" options={OPTIONS} />
      </div>,
    );
    const options = [
      ...document.querySelectorAll<HTMLElement>(
        '.bt-radio-card-group > [data-bt-part="option"]',
      ),
    ];
    const [first, second, third] = options.map((option) =>
      option.getBoundingClientRect(),
    );
    if (!first || !second || !third) throw new Error("No options.");
    expect(second.top - first.bottom).toBe(12);
    expect(third.top - second.bottom).toBe(12);
    await userEvent.click(screen.getByText("Screen the first renewals only"));
    const field = await screen.findByLabelText("Renewals to screen");
    await waitFor(() => {
      expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(
        true,
      );
    });
    const line = screen
      .getByText("Renewals after that go through without a check.")
      .getBoundingClientRect();
    expect(field.getBoundingClientRect().top - line.bottom).toBe(8);
  });

  it("fades a detail out as another option is chosen, rather than dropping it at once", async () => {
    render(
      <RadioCardGroup
        label="Renewal screening"
        options={OPTIONS}
        defaultValue="some"
      />,
    );
    await screen.findByLabelText("Renewals to screen");
    await userEvent.click(screen.getByText("Screen every renewal"));
    expect(screen.getByLabelText("Renewals to screen")).toBeTruthy();
    await waitFor(() => {
      expect(screen.queryByLabelText("Renewals to screen")).toBeNull();
    });
  });
});
