import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Bell, Truck, User } from "lucide-react";
import { createRef } from "react";
import type { MouseEvent, ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SettingsIndex } from "./SettingsIndex.tsx";

afterEach(cleanup);

function Settings({
  width = 1200,
  onClick,
}: {
  readonly width?: number;
  readonly onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}): ReactElement {
  return (
    <div style={{ inlineSize: `${String(width)}px` }}>
      <SettingsIndex>
        <SettingsIndex.Section title="You">
          <SettingsIndex.Link
            icon={User}
            title="Profile"
            description="Your name and password."
            href="#profile"
            onClick={onClick}
          />
          <SettingsIndex.Link
            icon={Bell}
            title="Notifications"
            description="Which emails you get."
            href="#notifications"
          />
          <SettingsIndex.Link
            icon={Truck}
            title="Shipping"
            description="Rates and pickup."
            href="#shipping"
          />
        </SettingsIndex.Section>
        <SettingsIndex.Section title="Money">
          <SettingsIndex.Link icon={Truck} title="Payouts" href="#payouts" />
        </SettingsIndex.Section>
      </SettingsIndex>
    </div>
  );
}

describe("SettingsIndex", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(<SettingsIndex ref={ref} className="custom" id="settings" />);
    expect(ref.current?.dataset["bt"]).toBe("SettingsIndex");
    expect(ref.current?.className).toBe("bt-settings-index custom");
    expect(ref.current?.id).toBe("settings");
  });

  it("makes each section a region named by its h2, holding a list of links named by their text", async () => {
    const onClick = vi.fn((event: { preventDefault: () => void }) => {
      event.preventDefault();
    });
    render(<Settings onClick={onClick} />);
    const you = screen.getByRole("region", { name: "You" });
    expect(within(you).getByRole("heading", { level: 2 })).toBeTruthy();
    expect(within(you).getAllByRole("listitem")).toHaveLength(3);
    const profile = within(you).getByRole("link", {
      name: "Profile Your name and password.",
    });
    expect(profile.getAttribute("href")).toBe("#profile");
    await userEvent.click(profile);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("ends a section with a dashed link to more, its tile a plus", () => {
    render(
      <SettingsIndex>
        <SettingsIndex.Section title="Your shop">
          <SettingsIndex.More
            title="Find more settings"
            description="Add-ons and integrations."
            href="#more"
          />
        </SettingsIndex.Section>
      </SettingsIndex>,
    );
    const more = screen.getByRole("link", { name: /Find more settings/ });
    expect(getComputedStyle(more).outlineStyle).toBe("dashed");
    expect(more.getAttribute("href")).toBe("#more");
    expect(more.querySelector('[data-bt-part="tile"] svg')).not.toBeNull();
  });

  it("draws its dashed edge inside, so its tile sits where a plain link's does, and rings it on keyboard focus", async () => {
    render(
      <SettingsIndex>
        <SettingsIndex.Section title="Your shop">
          <SettingsIndex.Link icon={Truck} title="Shipping" href="#shipping" />
          <SettingsIndex.More title="Find more settings" href="#more" />
        </SettingsIndex.Section>
      </SettingsIndex>,
    );
    const inset = (name: RegExp): number => {
      const link = screen.getByRole("link", { name });
      const tile = link.querySelector('[data-bt-part="tile"]');
      if (!tile) throw new Error("No tile.");
      return (
        tile.getBoundingClientRect().left - link.getBoundingClientRect().left
      );
    };
    expect(inset(/Find more settings/)).toBe(inset(/Shipping/));
    await userEvent.tab();
    await userEvent.tab();
    const more = screen.getByRole("link", { name: /Find more settings/ });
    expect(document.activeElement).toBe(more);
    expect(getComputedStyle(more).outlineStyle).toBe("solid");
  });

  it("hands a router the link followed, and leaves a click for a new tab to the browser", async () => {
    const onNavigate = vi.fn(
      (_href: string, event: { preventDefault: () => void }) => {
        event.preventDefault();
      },
    );
    render(
      <SettingsIndex>
        <SettingsIndex.Section title="Your shop">
          <SettingsIndex.Link
            icon={Truck}
            title="Shipping"
            href="#shipping"
            onNavigate={onNavigate}
          />
          <SettingsIndex.More
            title="Find more settings"
            href="#more"
            onNavigate={onNavigate}
          />
        </SettingsIndex.Section>
      </SettingsIndex>,
    );
    await userEvent.click(screen.getByRole("link", { name: /Shipping/ }));
    expect(onNavigate).toHaveBeenCalledWith("#shipping", expect.anything());
    const more = screen.getByRole("link", { name: /Find more/ });
    more.addEventListener("click", (event) => {
      event.preventDefault();
    });
    await userEvent.keyboard("{Meta>}");
    await userEvent.click(more);
    await userEvent.keyboard("{/Meta}");
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("passes a link and the link to more their ref, class and other props", () => {
    const link = createRef<HTMLAnchorElement>();
    const more = createRef<HTMLAnchorElement>();
    render(
      <SettingsIndex>
        <SettingsIndex.Section title="Your shop">
          <SettingsIndex.Link
            ref={link}
            icon={Truck}
            title="Shipping"
            href="#shipping"
            className="custom"
            aria-describedby="hint"
          />
          <SettingsIndex.More
            ref={more}
            title="Find more settings"
            href="#more"
            className="custom"
            target="_blank"
          />
        </SettingsIndex.Section>
      </SettingsIndex>,
    );
    expect(link.current).toBe(screen.getByRole("link", { name: /Shipping/ }));
    expect(link.current?.className).toBe("bt-focus custom");
    expect(link.current?.getAttribute("aria-describedby")).toBe("hint");
    expect(more.current?.getAttribute("target")).toBe("_blank");
    expect(more.current?.className).toBe("bt-focus custom");
  });

  it("lays links in three columns with room, two from 640px and one under that", () => {
    const columns = (): number => {
      const tops = screen
        .getAllByRole("link")
        .slice(0, 3)
        .map((link) => Math.round(link.getBoundingClientRect().top));
      return tops.filter((top) => top === tops[0]).length;
    };
    const { rerender } = render(<Settings width={1200} />);
    expect(columns()).toBe(3);
    rerender(<Settings width={800} />);
    expect(columns()).toBe(2);
    rerender(<Settings width={500} />);
    expect(columns()).toBe(1);
  });

  it("puts sections 32px apart and links 16px apart across", () => {
    render(<Settings width={1200} />);
    const [profile, notifications] = screen.getAllByRole("link");
    expect(
      (notifications?.getBoundingClientRect().left ?? 0) -
        (profile?.getBoundingClientRect().right ?? 0),
    ).toBeCloseTo(16, 0);
    const you = screen
      .getByRole("region", { name: "You" })
      .getBoundingClientRect();
    const money = screen
      .getByRole("region", { name: "Money" })
      .getBoundingClientRect();
    expect(money.top - you.bottom).toBeCloseTo(32, 0);
  });
});
