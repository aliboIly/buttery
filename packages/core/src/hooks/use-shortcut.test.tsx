import { cleanup, render } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isTypingField,
  matchesShortcut,
  parseShortcut,
  useShortcut,
} from "./use-shortcut.ts";
import type { ShortcutOptions } from "./use-shortcut.ts";

afterEach(cleanup);

const apple = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
const mod = apple ? "Meta" : "Control";

function Listener({
  shortcut,
  handler,
  options,
}: {
  readonly shortcut: string;
  readonly handler: () => void;
  readonly options?: ShortcutOptions;
}): ReactElement {
  useShortcut(shortcut, handler, options);
  return <input aria-label="Name" />;
}

describe("useShortcut", () => {
  it("reads a shortcut's key and modifiers", () => {
    expect(parseShortcut("mod+shift+Z")).toEqual({
      key: "z",
      mod: true,
      shift: true,
      alt: false,
      ctrl: false,
      known: true,
    });
    expect(parseShortcut("escape").key).toBe("escape");
  });

  it("treats mod as Command on Apple platforms and Control elsewhere", () => {
    const press = new KeyboardEvent("keydown", { key: "o", metaKey: true });
    expect(matchesShortcut(press, "mod+o", true)).toBe(true);
    expect(matchesShortcut(press, "mod+o", false)).toBe(false);
    const control = new KeyboardEvent("keydown", { key: "o", ctrlKey: true });
    expect(matchesShortcut(control, "mod+o", false)).toBe(true);
    expect(matchesShortcut(control, "mod+shift+o", false)).toBe(false);
  });

  it("runs on the shortcut and stops the browser's own action", async () => {
    const handler = vi.fn();
    render(<Listener shortcut="mod+o" handler={handler} />);
    await userEvent.keyboard(`{${mod}>}o{/${mod}}`);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]?.[0]).toBeInstanceOf(KeyboardEvent);
    expect((handler.mock.calls[0]?.[0] as KeyboardEvent).defaultPrevented).toBe(
      true,
    );
  });

  it("leaves typing in a field alone unless told", async () => {
    const handler = vi.fn();
    const { getByLabelText, rerender } = render(
      <Listener shortcut="mod+z" handler={handler} />,
    );
    getByLabelText("Name").focus();
    await userEvent.keyboard(`{${mod}>}z{/${mod}}`);
    expect(handler).not.toHaveBeenCalled();
    rerender(
      <Listener
        shortcut="mod+z"
        handler={handler}
        options={{ inFields: true }}
      />,
    );
    await userEvent.keyboard(`{${mod}>}z{/${mod}}`);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("stops listening when disabled", async () => {
    const handler = vi.fn();
    const { rerender } = render(
      <Listener shortcut="escape" handler={handler} />,
    );
    await userEvent.keyboard("{Escape}");
    expect(handler).toHaveBeenCalledTimes(1);
    rerender(
      <Listener
        shortcut="escape"
        handler={handler}
        options={{ enabled: false }}
      />,
    );
    await userEvent.keyboard("{Escape}");
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("never fires a shortcut that names a modifier it doesn't know", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const handler = vi.fn();
    render(<Listener shortcut="hyper+k" handler={handler} />);
    await userEvent.keyboard("k");
    expect(handler).not.toHaveBeenCalled();
    expect(parseShortcut("opt+k")).toEqual(parseShortcut("alt+k"));
  });

  it("counts text fields as typing, and buttons, checkboxes, sliders and file inputs as not", () => {
    const make = (type: string): HTMLInputElement => {
      const input = document.createElement("input");
      input.type = type;
      return input;
    };
    expect(isTypingField(make("text"))).toBe(true);
    expect(isTypingField(make("search"))).toBe(true);
    expect(isTypingField(document.createElement("textarea"))).toBe(true);
    for (const type of ["submit", "file", "range", "checkbox", "color"]) {
      expect(isTypingField(make(type))).toBe(false);
    }
  });

  it("reads cmd, meta and option as mod and alt, and warns with the fix about a modifier it doesn't know", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(parseShortcut("cmd+option+k")).toEqual(parseShortcut("mod+alt+k"));
    expect(parseShortcut("meta+k")).toEqual(parseShortcut("mod+k"));
    expect(parseShortcut("super+k").known).toBe(false);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"super"'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Fix: use mod"));
  });
});
