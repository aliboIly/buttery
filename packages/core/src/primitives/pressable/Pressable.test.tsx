import "../../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pressable } from "./Pressable.tsx";

afterEach(cleanup);

describe("Pressable", () => {
  it("is a button that never submits by accident", async () => {
    const onClick = vi.fn();
    const onSubmit = vi.fn();
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Pressable onClick={onClick}>Open</Pressable>
      </form>,
    );
    const button = screen.getByRole("button", { name: "Open" });
    expect(button.getAttribute("type")).toBe("button");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("works from the keyboard", async () => {
    const onClick = vi.fn();
    render(<Pressable onClick={onClick}>Open</Pressable>);
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("button"));
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("carries the press and focus recipes onto its child with asChild", () => {
    render(
      <Pressable asChild className="custom">
        <a href="#card">Card</a>
      </Pressable>,
    );
    const link = screen.getByRole("link", { name: "Card" });
    expect(link.className).toBe("bt-pressable bt-press bt-focus custom");
    expect(link.dataset["bt"]).toBe("Pressable");
  });
});
