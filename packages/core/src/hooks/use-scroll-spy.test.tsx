import "../styles/index.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Sticky } from "../layers/sticky/Sticky.tsx";
import { useScrollSpy } from "./use-scroll-spy.ts";

afterEach(cleanup);

const IDS = ["first", "second", "third"] as const;

function Spy(): ReactElement {
  return <output data-testid="current">{useScrollSpy(IDS) ?? "none"}</output>;
}

function page(withBar: boolean): HTMLElement {
  render(
    <div
      data-testid="scroller"
      style={{ blockSize: "300px", overflowY: "auto" }}
    >
      {withBar ? (
        <Sticky>
          <div style={{ blockSize: "40px" }}>Bar</div>
        </Sticky>
      ) : null}
      <Spy />
      <div style={{ blockSize: "100px" }} />
      {IDS.map((id) => (
        <section key={id} id={id} style={{ blockSize: "400px" }}>
          {id}
        </section>
      ))}
    </div>,
  );
  return screen.getByTestId("scroller");
}

function current(): string | null {
  return screen.getByTestId("current").textContent;
}

describe("useScrollSpy", () => {
  it("is null above the first section, then follows the section whose top has reached the container's top", async () => {
    const scroller = page(false);
    await waitFor(() => {
      expect(current()).toBe("none");
    });
    const second = document.getElementById("second");
    if (!second) throw new Error("No second section.");
    scroller.scrollTop = second.offsetTop - scroller.offsetTop;
    await waitFor(() => {
      expect(current()).toBe("second");
    });
  });

  it("measures from the bottom of the sticky bars", async () => {
    const scroller = page(true);
    const first = document.getElementById("first");
    if (!first) throw new Error("No first section.");
    scroller.scrollTop = first.offsetTop - scroller.offsetTop - 40;
    await waitFor(() => {
      expect(current()).toBe("first");
    });
    scroller.scrollTop -= 2;
    await waitFor(() => {
      expect(current()).toBe("none");
    });
  });

  it("marks the last section at the end, even when its top never reaches the line", async () => {
    const scroller = page(false);
    scroller.scrollTop = scroller.scrollHeight;
    await waitFor(() => {
      expect(current()).toBe("third");
    });
  });
});
