import "../styles/index.css";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { trackAnimation } from "../motion/settle.ts";
import { LayoutGuard } from "./LayoutGuard.tsx";

const OVERLAPPING = `
  <div style="position: relative; block-size: 80px">
    <div data-bt="Chip" style="position: absolute; inset-inline-start: 0; inline-size: 80px; block-size: 40px"></div>
    <div data-bt="Badge" style="position: absolute; inset-inline-start: 60px; inline-size: 80px; block-size: 40px"></div>
  </div>`;

let page: HTMLDivElement;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
  page = document.createElement("div");
  page.innerHTML = OVERLAPPING;
  document.body.append(page);
});

afterEach(() => {
  cleanup();
  page.remove();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function marks(): NodeListOf<Element> {
  return document.querySelectorAll(
    '[data-bt="LayoutGuard"] [data-bt-part="mark"]',
  );
}

describe("LayoutGuard", () => {
  it("outlines offenders and logs them once in the shared JSON format", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<LayoutGuard />);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(marks()).toHaveLength(1);
    expect(marks()[0]?.textContent).toContain("overlap");
    const [summary, json] = String(warn.mock.calls[0]?.[0]).split("\n");
    expect(summary).toContain("1 layout problem");
    const logged: unknown = JSON.parse(json ?? "");
    expect(logged).toMatchObject({
      rule: "overlap",
      a: '[data-bt="Chip"]',
      b: '[data-bt="Badge"]',
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(warn).toHaveBeenCalledOnce();
  });

  it("still checks at least once a second while the page keeps changing", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<LayoutGuard />);
    for (let elapsed = 0; elapsed < 1000; elapsed += 100) {
      await act(async () => {
        page.dataset["frame"] = String(elapsed);
        await Promise.resolve();
        vi.advanceTimersByTime(100);
      });
    }
    expect(marks()).toHaveLength(1);
  });

  it("waits for buttery's animations to settle", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const finish = trackAnimation();
    render(<LayoutGuard />);
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(marks()).toHaveLength(0);
    finish();
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(marks()).toHaveLength(1);
  });

  it("leaves ⌥⇧L alone while typing in a field", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const field = document.createElement("input");
    page.append(field);
    render(<LayoutGuard />);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    fireEvent.keyDown(field, { code: "KeyL", altKey: true, shiftKey: true });
    expect(marks()).toHaveLength(1);
  });

  it("toggles the outlines with ⌥⇧L and the grid with ⌥⇧G", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<LayoutGuard />);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(marks()).toHaveLength(1);
    fireEvent.keyDown(window, { code: "KeyL", altKey: true, shiftKey: true });
    expect(marks()).toHaveLength(0);
    fireEvent.keyDown(window, { code: "KeyG", altKey: true, shiftKey: true });
    expect(document.querySelectorAll('[data-bt-part="column"]')).toHaveLength(
      12,
    );
  });
});
