import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { page, userEvent as browser } from "vitest/browser";
import { TextArea } from "./TextArea.tsx";

afterEach(cleanup);

function colorOf(variable: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${variable})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

function area(): HTMLTextAreaElement {
  const field = screen.getByRole("textbox");
  if (!(field instanceof HTMLTextAreaElement)) throw new Error("No textarea.");
  return field;
}

describe("TextArea", () => {
  it("stamps its class and data-bt on the field and its ref on the textarea", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<TextArea ref={ref} label="Note" className="custom" />);
    const root = ref.current?.closest('[data-bt="TextArea"]');
    expect(root?.className).toBe("bt-text-area bt-form-field custom");
    expect(ref.current).toBe(area());
  });

  it("is named by its label and described by its hint and error", async () => {
    render(
      <TextArea label="Note" hint="Shown under the card." error="Too long." />,
    );
    await expect
      .element(page.getByRole("textbox", { name: "Note", exact: true }))
      .toBeInTheDocument();
    expect(area().getAttribute("aria-invalid")).toBe("true");
    expect(area().getAttribute("aria-describedby")?.split(" ")).toHaveLength(2);
  });

  it("grows with its text from three lines up to its limit, then scrolls", async () => {
    render(<TextArea label="Note" rows={3} maxRows={5} />);
    const line = Number.parseFloat(getComputedStyle(area()).lineHeight);
    const empty = area().getBoundingClientRect().height;
    await userEvent.type(area(), "One{Enter}Two{Enter}Three{Enter}Four");
    const four = area().getBoundingClientRect().height;
    expect(Math.round(four - empty)).toBe(Math.round(line));
    await userEvent.type(area(), "{Enter}Five{Enter}Six{Enter}Seven");
    const capped = area().getBoundingClientRect().height;
    expect(Math.round(capped - empty)).toBe(Math.round(line * 2));
    expect(getComputedStyle(area()).overflowY).toBe("auto");
  });

  it("fits its text again when its width changes", async () => {
    render(
      <div data-testid="frame" style={{ inlineSize: "640px" }}>
        <TextArea
          label="Note"
          rows={1}
          defaultValue="A note long enough to wrap onto several lines once the field gets narrow, with a few more words after that."
        />
      </div>,
    );
    const wide = area().getBoundingClientRect().height;
    screen.getByTestId("frame").style.inlineSize = "200px";
    await expect
      .poll(() => area().getBoundingClientRect().height)
      .toBeGreaterThan(wide);
    expect(area().scrollHeight).toBeLessThanOrEqual(area().clientHeight + 1);
  });

  it("leaves a scrolled panel where it is as it measures", async () => {
    render(
      <div
        data-testid="panel"
        style={{ blockSize: "240px", overflowY: "auto" }}
      >
        <div style={{ blockSize: "600px" }} />
        <TextArea
          label="Note"
          defaultValue={"One\nTwo\nThree\nFour\nFive\nSix"}
        />
      </div>,
    );
    const panel = screen.getByTestId("panel");
    panel.scrollTop = panel.scrollHeight;
    const end = panel.scrollTop;
    await userEvent.type(area(), "!");
    expect(panel.scrollTop).toBe(end);
  });

  it("makes one line as tall as a field of its size: 28 at sm, 48 at lg with 16px text, 40 in compact", () => {
    render(
      <>
        <TextArea label="Small" size="sm" rows={1} />
        <TextArea label="Large" size="lg" rows={1} />
        <div data-bt-density="compact">
          <TextArea label="Large, compact" size="lg" rows={1} />
        </div>
      </>,
    );
    const height = (label: string): number =>
      screen
        .getByLabelText(label)
        .closest('[data-bt-part="box"]')
        ?.getBoundingClientRect().height ?? 0;
    expect(height("Small")).toBe(28);
    expect(height("Large")).toBe(48);
    expect(height("Large, compact")).toBe(40);
    expect(getComputedStyle(screen.getByLabelText("Large")).fontSize).toBe(
      "16px",
    );
    expect(getComputedStyle(screen.getByLabelText("Large")).paddingLeft).toBe(
      "16px",
    );
  });

  it("fits a large box again when the density changes under it, one line as tall as a large field in each", async () => {
    render(
      <div data-bt-density="comfortable" data-testid="density">
        <TextArea label="Gift message" size="lg" rows={1} />
      </div>,
    );
    const box = (): number =>
      area().closest('[data-bt-part="box"]')?.getBoundingClientRect().height ??
      0;
    await document.fonts.ready;
    for (let frame = 0; frame < 3; frame += 1)
      await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(box()).toBe(48);
    screen.getByTestId("density").setAttribute("data-bt-density", "compact");
    await waitFor(() => {
      expect(box()).toBe(40);
    });
  });

  it("draws a soft box on bg-control whose edge shows on hover", async () => {
    render(<TextArea label="Note" variant="soft" />);
    const box = area().closest<HTMLElement>('[data-bt-part="box"]');
    if (!box) throw new Error("No box.");
    const edge = colorOf("--bt-control-border");
    expect(getComputedStyle(box).backgroundColor).toBe(
      colorOf("--bt-bg-control"),
    );
    expect(getComputedStyle(box).borderTopColor).toBe("rgba(0, 0, 0, 0)");
    await browser.hover(box);
    expect(getComputedStyle(box).borderTopColor).toBe(edge);
  });
});
