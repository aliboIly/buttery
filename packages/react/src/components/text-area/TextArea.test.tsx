import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { TextArea } from "./TextArea.tsx";

afterEach(cleanup);

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
});
