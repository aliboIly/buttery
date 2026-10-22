import "@buttery/core/styles.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { colors, createTheme, useMotionPreference } from "@buttery/core";
import { toast } from "../components/toaster/Toaster.tsx";
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
    <output aria-label="Settings">
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
  it("reports settled, hosts the floating lanes and the toasts, and shows LayoutGuard in development", () => {
    const { unmount } = render(
      <ButteryProvider>
        <Probe />
      </ButteryProvider>,
    );
    expect(root.hasAttribute("data-bt-settled")).toBe(true);
    expect(document.querySelectorAll('[data-bt-part="lane"]')).toHaveLength(3);
    expect(
      document
        .querySelector('[data-bt="Toaster"]')
        ?.closest('[data-lane="bottom-center"]'),
    ).not.toBeNull();
    unmount();
    expect(root.hasAttribute("data-bt-settled")).toBe(false);
    expect(document.querySelector('[data-bt="FloatingLanes"]')).toBeNull();
  });

  it("gives the toasts' region and messages the labels in toaster, so an app can translate them", async () => {
    render(
      <ButteryProvider
        toaster={{
          label: "Hinweis",
          regionLabel: "Hinweise ({hotkey})",
          toneLabels: { success: "Erledigt" },
        }}
      />,
    );
    toast.success("Karte gespeichert");
    expect(
      await screen.findByRole("region", { name: "Hinweise (F8)" }),
    ).toBeTruthy();
    await waitFor(() => {
      expect(
        [...document.querySelectorAll('[role="status"]')].map(
          (status) => status.textContent,
        ),
      ).toContain("Hinweis Erledigt: Karte gespeichert");
    });
    toast.dismiss();
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
    expect(document.querySelectorAll('[data-bt="Toaster"]')).toHaveLength(1);
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
    expect(screen.getByRole("status", { name: "Settings" }).textContent).toBe(
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
    expect(screen.getByRole("status", { name: "Settings" }).textContent).toBe(
      "light comfortable web false",
    );
  });

  it("tells buttery's motion primitives whether to reduce motion", () => {
    function Motion(): ReactElement {
      return <output aria-label="motion">{useMotionPreference()}</output>;
    }
    render(
      <ButteryProvider reducedMotion="always">
        <Motion />
        <ButteryProvider reducedMotion="never">
          <Motion />
        </ButteryProvider>
      </ButteryProvider>,
    );
    expect(
      screen.getAllByLabelText("motion").map((element) => element.textContent),
    ).toEqual(["reduced", "full"]);
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

  it("colors text in a nested provider with its own theme, even text that sets no color", () => {
    render(
      <ButteryProvider colorScheme="dark">
        <ButteryProvider colorScheme="light">
          <span data-testid="plain">plain</span>
          <span data-testid="probe" style={{ color: "var(--bt-text)" }}>
            probe
          </span>
        </ButteryProvider>
      </ButteryProvider>,
    );
    expect(getComputedStyle(screen.getByTestId("plain")).color).toBe(
      getComputedStyle(screen.getByTestId("probe")).color,
    );
  });

  it("explains what's missing when used outside a provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow(
      /needs a <ButteryProvider> above it/,
    );
  });
});
