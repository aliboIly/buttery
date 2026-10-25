import "../styles/index.css";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { trackAnimation } from "../motion/settle.ts";
import type * as Checks from "./checks.ts";
import { runLayoutChecks } from "./checks.ts";
import { LayoutGuard } from "./LayoutGuard.tsx";

vi.mock("./checks.ts", async (importOriginal) => {
  const actual = await importOriginal<typeof Checks>();
  return { ...actual, runLayoutChecks: vi.fn(actual.runLayoutChecks) };
});

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

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
}

/** Lets the guard's timer fire, then a frame render, then the check it scheduled after the frame. */
async function runGuard(milliseconds = 300): Promise<void> {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
  await act(async () => {
    await nextFrame();
    await nextFrame();
  });
  act(() => {
    vi.advanceTimersByTime(0);
  });
}

describe("LayoutGuard", () => {
  it("outlines offenders and logs them once in the shared JSON format", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<LayoutGuard />);
    await runGuard();
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
    await runGuard(1000);
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
    await runGuard(0);
    expect(marks()).toHaveLength(1);
  });

  it("checks after the page renders, once components have adapted to a resize", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    page.innerHTML = `
      <div data-bt="Box" id="box" style="inline-size: 200px">
        <div id="content" style="inline-size: 200px; block-size: 10px"></div>
      </div>`;
    const box = page.querySelector<HTMLElement>("#box");
    const content = page.querySelector<HTMLElement>("#content");
    if (!box || !content) throw new Error("fixture missing");
    const fit = new ResizeObserver(() => {
      content.style.setProperty("inline-size", `${String(box.clientWidth)}px`);
    });
    fit.observe(box);
    render(<LayoutGuard />);
    await runGuard();
    for (let elapsed = 0; elapsed < 900; elapsed += 100) {
      await act(async () => {
        page.dataset["frame"] = String(elapsed);
        await Promise.resolve();
        vi.advanceTimersByTime(100);
      });
    }
    box.style.setProperty("inline-size", "80px");
    await runGuard(100);
    fit.disconnect();
    expect(warn).not.toHaveBeenCalled();
    expect(marks()).toHaveLength(0);
  });

  it("checks a rule or two per frame, and starts over when the page changes between frames", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const run = vi.mocked(runLayoutChecks);
    const original = run.getMockImplementation();
    if (!original) throw new Error("runLayoutChecks isn't mocked");
    run.mockImplementation((options) => {
      // Each rule costs a whole slice, so every frame runs one of the seven.
      vi.advanceTimersByTime(10);
      return original(options);
    });
    render(<LayoutGuard />);
    await runGuard();
    expect(run).toHaveBeenCalledTimes(1);
    expect(marks()).toHaveLength(0);
    await runGuard(0);
    expect(run).toHaveBeenCalledTimes(2);
    await act(async () => {
      page.dataset["frame"] = "changed";
      await Promise.resolve();
    });
    await runGuard(0);
    expect(run).toHaveBeenCalledTimes(2);
    expect(warn).not.toHaveBeenCalled();
    for (let slice = 0; slice < 7; slice += 1)
      await runGuard(slice === 0 ? 300 : 0);
    expect(run).toHaveBeenCalledTimes(9);
    expect(marks()).toHaveLength(1);
    expect(warn).toHaveBeenCalledOnce();
    run.mockImplementation(original);
  });

  it("waits for buttery's animations to settle", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const finish = trackAnimation();
    render(<LayoutGuard />);
    await runGuard(600);
    expect(marks()).toHaveLength(0);
    finish();
    await runGuard();
    expect(marks()).toHaveLength(1);
  });

  it("leaves ⌥⇧L alone while typing in a field", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const field = document.createElement("input");
    page.append(field);
    render(<LayoutGuard />);
    await runGuard();
    fireEvent.keyDown(field, { code: "KeyL", altKey: true, shiftKey: true });
    expect(marks()).toHaveLength(1);
  });

  it("toggles the outlines with ⌥⇧L and the grid with ⌥⇧G", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<LayoutGuard />);
    await runGuard();
    expect(marks()).toHaveLength(1);
    fireEvent.keyDown(window, { code: "KeyL", altKey: true, shiftKey: true });
    expect(marks()).toHaveLength(0);
    fireEvent.keyDown(window, { code: "KeyG", altKey: true, shiftKey: true });
    expect(document.querySelectorAll('[data-bt-part="column"]')).toHaveLength(
      12,
    );
  });
});
