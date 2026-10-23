import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs.tsx";
import { ScopeBadge } from "../../components/scope-badge/ScopeBadge.tsx";
import { AppShell } from "../app-shell/AppShell.tsx";
import { SettingsSection } from "../settings-section/SettingsSection.tsx";
import { SettingsPage } from "./SettingsPage.tsx";

afterEach(cleanup);

function inShell(page: ReactNode): void {
  render(
    <div style={{ inlineSize: "1728px", blockSize: "800px" }}>
      <AppShell layout="sidebar" sidebar={<nav aria-label="Main" />}>
        {page}
      </AppShell>
    </div>,
  );
}

function frame(): DOMRect {
  const part = document.querySelector('[data-bt-part="frame"]');
  if (!part) throw new Error("No frame.");
  return part.getBoundingClientRect();
}

describe("SettingsPage", () => {
  it("is the page's main landmark, stamped SettingsPage, taking the ref, class and other props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <SettingsPage
        ref={ref}
        title="Pickup"
        className="custom"
        data-testid="pickup"
      />,
    );
    const main = screen.getByRole("main");
    expect(ref.current).toBe(main);
    expect(main.dataset["bt"]).toBe("SettingsPage");
    expect(main.dataset["testid"]).toBe("pickup");
    expect(main.className).toBe("bt-app-page bt-settings-page custom");
  });

  it("is 960 wide, or 820 when narrow", () => {
    inShell(<SettingsPage title="Pickup" />);
    expect(frame().width).toBe(960);
    cleanup();
    inShell(<SettingsPage title="Notifications" width="narrow" />);
    expect(frame().width).toBe(820);
  });

  it("puts the breadcrumbs, the title, its badge and one line about it in its header, then its sections", () => {
    inShell(
      <SettingsPage
        title="Pickup"
        breadcrumbs={
          <Breadcrumbs items={[{ label: "Settings", href: "#settings" }]} />
        }
        badge={
          <ScopeBadge
            label="All shops"
            info="Changes here apply to every shop."
          />
        }
        description="When and where customers collect their orders."
        footer={<a href="#feedback">Share feedback</a>}
      >
        <SettingsSection title="Hours" />
      </SettingsPage>,
    );
    expect(
      screen.getByRole("navigation", { name: "Breadcrumbs" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { level: 1, name: "Pickup" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "All shops" })).toBeTruthy();
    expect(
      screen.getByText("When and where customers collect their orders."),
    ).toBeTruthy();
    expect(screen.getByRole("region", { name: "Hours" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Share feedback" })).toBeTruthy();
  });
});
