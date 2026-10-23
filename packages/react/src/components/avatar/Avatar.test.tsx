import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Avatar } from "./Avatar.tsx";

afterEach(cleanup);

const PICTURE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

describe("Avatar", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Avatar
        ref={ref}
        name="Mira Okafor"
        className="custom"
        data-testid="avatar"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("Avatar");
    expect(ref.current?.dataset["testid"]).toBe("avatar");
    expect(ref.current?.className).toBe("bt-avatar custom");
  });

  it("shows the initials without a picture, round at its size", () => {
    render(<Avatar name="Mira Okafor" size="md" data-testid="avatar" />);
    const avatar = screen.getByTestId("avatar");
    expect(avatar.textContent).toBe("MO");
    expect(avatar.getAttribute("aria-hidden")).toBe("true");
    const box = avatar.getBoundingClientRect();
    expect([box.width, box.height]).toEqual([32, 32]);
    expect(getComputedStyle(avatar).borderRadius).toBe("9999px");
  });

  it("shows the picture once it loads, keeping its size", async () => {
    render(
      <Avatar name="Mira Okafor" src={PICTURE} label="Mira Okafor" size="lg" />,
    );
    const avatar = screen.getByRole("img", { name: "Mira Okafor" });
    await waitFor(() => {
      expect(avatar.querySelector('[data-bt-part="picture"]')).not.toBeNull();
    });
    expect(avatar.querySelector('[data-bt-part="initials"]')).toBeNull();
    expect(avatar.getBoundingClientRect().width).toBe(40);
  });

  it("keeps the initials when the picture fails to load", async () => {
    render(
      <Avatar
        name="Mira Okafor"
        src="data:image/png;base64,AAAA"
        data-testid="avatar"
      />,
    );
    await new Promise((resolve) => setTimeout(resolve, 200));
    const avatar = screen.getByTestId("avatar");
    expect(avatar.querySelector('[data-bt-part="picture"]')).toBeNull();
    expect(avatar.textContent).toBe("MO");
  });
});
