import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { Button } from "../../components/button/Button.tsx";
import { TextField } from "../../components/text-field/TextField.tsx";
import { SettingsSection } from "./SettingsSection.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

function Address({
  onSave = () => undefined,
  buttons,
}: {
  readonly onSave?: (address: string) => void;
  readonly buttons?: "header" | "footer";
}): ReactElement {
  const [saved, setSaved] = useState("12 Mill Street");
  const [address, setAddress] = useState(saved);
  return (
    <div style={{ inlineSize: "720px" }}>
      <SettingsSection
        title="Pickup address"
        description="Where customers collect their orders."
        dirty={address !== saved}
        onSave={() => {
          setSaved(address);
          onSave(address);
        }}
        onCancel={() => {
          setAddress(saved);
        }}
        buttons={buttons}
      >
        <TextField label="Address" value={address} onValueChange={setAddress} />
      </SettingsSection>
    </div>
  );
}

describe("SettingsSection", () => {
  it("is a region named by its heading that takes the ref, class and other props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <SettingsSection
        ref={ref}
        title="Sessions"
        className="custom"
        data-testid="sessions"
      />,
    );
    const section = screen.getByRole("region", { name: "Sessions" });
    expect(ref.current).toBe(section);
    expect(section.dataset["bt"]).toBe("SettingsSection");
    expect(section.dataset["testid"]).toBe("sessions");
    expect(section.className).toContain("bt-settings-section custom");
    expect(section.hasAttribute("data-bt-region")).toBe(true);
  });

  it("puts its one action at the end of the heading's row, the description under the heading", () => {
    render(
      <div style={{ inlineSize: "720px" }}>
        <SettingsSection
          title="Passkeys"
          description="Sign in with your fingerprint or a security key."
          action={<Button size="sm">Add a passkey</Button>}
        >
          <p>No passkeys yet.</p>
        </SettingsSection>
      </div>,
    );
    const heading = screen
      .getByRole("heading", { level: 2, name: "Passkeys" })
      .getBoundingClientRect();
    const action = screen
      .getByRole("button", { name: "Add a passkey" })
      .getBoundingClientRect();
    expect(action.top).toBe(heading.top);
    expect(action.right).toBe(
      screen.getByRole("region").getBoundingClientRect().right,
    );
  });

  it("draws a hairline under its heading's row with divider", () => {
    render(<SettingsSection title="Fraud screening" divider />);
    const head = document.querySelector<HTMLElement>(
      '[data-bt-part="section-head"]',
    );
    if (!head) throw new Error("No head.");
    expect(getComputedStyle(head).borderBottomWidth).toBe("1px");
  });

  it("loads on its own: a pill in place of its content, the section marked busy and quiet", async () => {
    render(
      <SettingsSection title="Sessions" loading>
        <p>Portland, 2 minutes ago</p>
      </SettingsSection>,
    );
    const section = screen.getByRole("region", { name: "Sessions" });
    expect(section.getAttribute("aria-busy")).toBe("true");
    expect(screen.queryByText("Portland, 2 minutes ago")).toBeNull();
    await waitFor(() => {
      expect(section.querySelector('[data-bt="LoadingPill"]')).not.toBeNull();
    });
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("keeps Save and Cancel disabled in its header until something changes", async () => {
    const onSave = vi.fn();
    render(<Address onSave={onSave} />);
    const save = screen.getByRole("button", { name: "Save" });
    const cancel = screen.getByRole("button", { name: "Cancel" });
    expect(save.getAttribute("aria-disabled")).toBe("true");
    expect(cancel.getAttribute("aria-disabled")).toBe("true");
    await userEvent.click(save, { force: true });
    expect(onSave).not.toHaveBeenCalled();
    await userEvent.fill(screen.getByLabelText("Address"), "40 Oak Lane");
    expect(save.hasAttribute("aria-disabled")).toBe(false);
    await userEvent.click(save);
    expect(onSave).toHaveBeenCalledWith("40 Oak Lane");
    expect(save.getAttribute("aria-disabled")).toBe("true");
  });

  it("saves on Enter while there's a change, and Cancel puts the value back", async () => {
    const onSave = vi.fn();
    render(<Address onSave={onSave} />);
    const field = screen.getByLabelText<HTMLInputElement>("Address");
    await userEvent.fill(field, "9 River Road");
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(field.value).toBe("12 Mill Street");
    await userEvent.fill(field, "9 River Road");
    await userEvent.keyboard("{Enter}");
    expect(onSave).toHaveBeenCalledWith("9 River Road");
  });

  it("shows neither Save nor Cancel while it loads, wherever they go, and keeps a plain action", () => {
    for (const buttons of ["header", "footer"] as const) {
      render(
        <SettingsSection
          title="Pickup address"
          loading
          onSave={() => undefined}
          onCancel={() => undefined}
          buttons={buttons}
        >
          <p>12 Mill Street</p>
        </SettingsSection>,
      );
      expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
      expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
      cleanup();
    }
    render(
      <SettingsSection
        title="Sessions"
        loading
        action={<Button size="sm">Sign out everywhere else</Button>}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Sign out everywhere else" }),
    ).toBeTruthy();
  });

  it('puts Save and Cancel under its content with buttons="footer", and nowhere else', () => {
    render(<Address buttons="footer" />);
    const head = document.querySelector('[data-bt-part="section-head"]');
    expect(head?.querySelector("button")).toBeNull();
    const field = screen.getByLabelText("Address").getBoundingClientRect();
    expect(
      screen.getByRole("button", { name: "Save" }).getBoundingClientRect().top,
    ).toBeGreaterThan(field.bottom);
    expect(screen.getAllByRole("button", { name: "Save" })).toHaveLength(1);
  });
});
