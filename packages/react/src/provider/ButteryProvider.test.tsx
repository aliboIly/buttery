import "@buttery/core/styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { colors, createTheme } from "@buttery/core";
import { ButteryProvider } from "./ButteryProvider.tsx";
import { useButtery } from "./context.ts";

const root = document.documentElement;

function stubMatchMedia(matching: readonly string[]): void {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: matching.includes(query),
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      }) satisfies MediaQueryList,
  );
}

function Probe(): ReactElement {
  const { colorScheme, density, platform, reducedMotion } = useButtery();
  return (
    <output>
      {[colorScheme, density, platform, String(reducedMotion)].join(" ")}
    </output>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Reflect.deleteProperty(window, "__TAURI_INTERNALS__");
});

describe("ButteryProvider", () => {
  it("reports settled, hosts the floating lanes and shows LayoutGuard in development", () => {
    const { unmount } = render(
      <ButteryProvider>
        <Probe />
      </ButteryProvider>,
    );
    expect(root.hasAttribute("data-bt-settled")).toBe(true);
    expect(document.querySelectorAll('[data-bt-part="lane"]')).toHaveLength(3);
    unmount();
    expect(root.hasAttribute("data-bt-settled")).toBe(false);
    expect(document.querySelector('[data-bt="FloatingLanes"]')).toBeNull();
  });

  it("leaves LayoutGuard out when asked", () => {
    render(
      <ButteryProvider layoutGuard={false}>
        <ButteryProvider colorScheme="dark">
          <Probe />
        </ButteryProvider>
      </ButteryProvider>,
    );
    expect(document.querySelectorAll('[data-bt="FloatingLanes"]')).toHaveLength(
      1,
    );
  });

  it("writes its settings onto <html> and removes them on unmount", () => {
    const { unmount } = render(
      <ButteryProvider colorScheme="dark" density="compact">
        <Probe />
      </ButteryProvider>,
    );
    expect(root.dataset["btTheme"]).toBe("dark");
    expect(root.dataset["btDensity"]).toBe("compact");
    expect(getComputedStyle(root).getPropertyValue("--bt-bg-app").trim()).toBe(
      colors["bg-app"].dark,
    );
    expect(
      getComputedStyle(root).getPropertyValue("--bt-h-control").trim(),
    ).toBe("30px");
    unmount();
    expect(root.dataset["btTheme"]).toBeUndefined();
  });

  it("rewrites only the setting that changed", () => {
    const { rerender } = render(
      <ButteryProvider colorScheme="light">
        <Probe />
      </ButteryProvider>,
    );
    root.setAttribute("data-bt-density", "compact");
    rerender(
      <ButteryProvider colorScheme="dark">
        <Probe />
      </ButteryProvider>,
    );
    expect(root.dataset["btTheme"]).toBe("dark");
    expect(root.dataset["btDensity"]).toBe("compact");
  });

  it("follows the OS color scheme and reduced-motion setting by default", () => {
    stubMatchMedia([
      "(prefers-color-scheme: dark)",
      "(prefers-reduced-motion: reduce)",
    ]);
    render(
      <ButteryProvider>
        <Probe />
      </ButteryProvider>,
    );
    expect(screen.getByRole("status").textContent).toBe(
      "dark comfortable web true",
    );
    expect(root.dataset["btMotion"]).toBe("reduced");
  });

  it("lets explicit props win over the OS", () => {
    stubMatchMedia([
      "(prefers-color-scheme: dark)",
      "(prefers-reduced-motion: reduce)",
    ]);
    render(
      <ButteryProvider colorScheme="light" reducedMotion="never">
        <Probe />
      </ButteryProvider>,
    );
    expect(screen.getByRole("status").textContent).toBe(
      "light comfortable web false",
    );
  });

  it("detects the desktop app", () => {
    Object.defineProperty(window, "__TAURI_INTERNALS__", {
      value: {},
      configurable: true,
    });
    render(
      <ButteryProvider>
        <Probe />
      </ButteryProvider>,
    );
    expect(root.dataset["btPlatform"]).toBe("desktop");
  });

  it("applies a theme from createTheme", () => {
    render(
      <ButteryProvider
        colorScheme="light"
        theme={createTheme({ accent: "#7c3aed", radius: "soft" })}
      >
        <Probe />
      </ButteryProvider>,
    );
    expect(getComputedStyle(root).getPropertyValue("--bt-accent").trim()).toBe(
      "#7c3aed",
    );
    expect(getComputedStyle(root).getPropertyValue("--bt-r-lg").trim()).toBe(
      "15px",
    );
  });

  it("scopes a nested provider to its subtree", () => {
    render(
      <ButteryProvider colorScheme="light">
        <ButteryProvider colorScheme="dark">
          <span data-testid="inside">inside</span>
        </ButteryProvider>
      </ButteryProvider>,
    );
    const inside = screen.getByTestId("inside");
    expect(
      getComputedStyle(inside).getPropertyValue("--bt-bg-surface").trim(),
    ).toBe(colors["bg-surface"].dark);
    expect(
      getComputedStyle(root).getPropertyValue("--bt-bg-surface").trim(),
    ).toBe(colors["bg-surface"].light);
    expect(inside.parentElement?.style.display).toBe("contents");
  });

  it("explains what's missing when used outside a provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow(
      /needs a <ButteryProvider> above it/,
    );
  });
});
