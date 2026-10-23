import "@butteryui/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@butteryui/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useEffect, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ButteryProvider } from "../../provider/ButteryProvider.tsx";
import { Onboarding } from "./Onboarding.tsx";
import type { OnboardingStep } from "./Onboarding.tsx";

beforeEach(() => {
  publishSettled();
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

const STEPS: readonly OnboardingStep[] = [
  {
    title: "Start with a title",
    body: "Type it right on the card.",
    media: <Onboarding.Shared id="card">Card</Onboarding.Shared>,
  },
  {
    title: "Dress the card",
    body: "Pick a finish and a backdrop.",
    media: (
      <Onboarding.Shared id="card" rotate={-4}>
        Card
      </Onboarding.Shared>
    ),
  },
  {
    title: "Send it out",
    body: "Copy it or save it as a picture.",
    caption: "Pictures come out at the canvas's size.",
    media: <Onboarding.Shared id="card">Card</Onboarding.Shared>,
  },
];

function dialog(): HTMLElement {
  return screen.getByRole("dialog");
}

function forward(): HTMLElement {
  const actions = document.querySelector('[data-bt-part="actions"]');
  const button = actions?.querySelectorAll("button")[1];
  if (!button) throw new Error("no forward button");
  return button;
}

async function settled(): Promise<void> {
  await waitFor(() => {
    expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(true);
  });
}

describe("Onboarding", () => {
  it("stamps its class and data-bt on its content and forwards its ref", async () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Onboarding steps={STEPS} defaultOpen ref={ref} className="custom" />,
    );
    await screen.findByRole("dialog");
    expect(ref.current?.dataset["bt"]).toBe("Onboarding");
    expect(ref.current?.className).toBe("bt-onboarding custom");
  });

  it("is named by the step's title and described by its body, and moves on with Next", async () => {
    render(<Onboarding steps={STEPS} defaultOpen />);
    await screen.findByRole("dialog");
    expect(dialog()).toHaveAccessibleName("Start with a title");
    expect(dialog()).toHaveAccessibleDescription("Type it right on the card.");
    expect(screen.getByRole("img", { name: "Step 1 of 3" })).toBeTruthy();
    const back = screen.getByRole("button", { name: "Back" });
    expect(back.getAttribute("aria-disabled")).toBe("true");
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    await settled();
    expect(dialog()).toHaveAccessibleName("Dress the card");
    expect(screen.getByRole("img", { name: "Step 2 of 3" })).toBeTruthy();
    expect(back.getAttribute("aria-disabled")).toBe("false");
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toBe(
      "Step 2 of 3: Dress the card",
    );
  });

  it("steps with the arrow keys and stays put at the ends", async () => {
    render(<Onboarding steps={STEPS} defaultOpen />);
    await screen.findByRole("dialog");
    screen.getByRole("button", { name: "Next" }).focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("img", { name: "Step 1 of 3" })).toBeTruthy();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");
    await settled();
    expect(screen.getByRole("img", { name: "Step 3 of 3" })).toBeTruthy();
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("img", { name: "Step 2 of 3" })).toBeTruthy();
  });

  it("turns its forward button into Done on the last step, keeping its width and focus", async () => {
    render(<Onboarding steps={STEPS} defaultOpen />);
    await screen.findByRole("dialog");
    await settled();
    const button = forward();
    const width = button.getBoundingClientRect().width;
    await userEvent.click(button);
    await userEvent.click(button);
    await settled();
    expect(forward()).toBe(button);
    expect(button).toHaveAccessibleName("Done");
    expect(button.getBoundingClientRect().width).toBe(width);
    expect(button.hasAttribute("data-arrow")).toBe(false);
  });

  it("finishes with confetti and closes once it has flown", async () => {
    const onFinish = vi.fn();
    render(
      <ButteryProvider reducedMotion="never" layoutGuard={false}>
        <Onboarding steps={STEPS} defaultOpen onFinish={onFinish} />
      </ButteryProvider>,
    );
    await screen.findByRole("dialog");
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await userEvent.click(forward());
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(
      document.querySelector(
        '[data-bt="Confetti"] canvas, [data-bt="Confetti"] *',
      ),
    ).not.toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(screen.queryByRole("dialog")).not.toBeNull();
    await waitFor(
      () => {
        expect(screen.queryByRole("dialog")).toBeNull();
      },
      { timeout: 2000 },
    );
  });

  it("closes at once when it finishes with reduced motion", async () => {
    render(
      <ButteryProvider reducedMotion="always" layoutGuard={false}>
        <Onboarding steps={STEPS} defaultOpen />
      </ButteryProvider>,
    );
    await screen.findByRole("dialog");
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await userEvent.click(forward());
    await waitFor(
      () => {
        expect(screen.queryByRole("dialog")).toBeNull();
      },
      { timeout: 400 },
    );
  });

  it("opens by itself the first time with a storageKey, and remembers once it's closed", async () => {
    render(<Onboarding steps={STEPS} storageKey="studio" />);
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(window.localStorage.getItem("buttery:onboarding:studio")).toBe(
      "done",
    );
    cleanup();
    render(<Onboarding steps={STEPS} storageKey="studio" />);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens with focus on the forward button", async () => {
    render(<Onboarding steps={STEPS} defaultOpen />);
    await screen.findByRole("dialog");
    await waitFor(() => {
      expect(document.activeElement).toBe(forward());
    });
  });

  it("starts again from the first step each time it opens", async () => {
    render(<Onboarding steps={STEPS} defaultOpen />);
    await screen.findByRole("dialog");
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    cleanup();
    render(<Onboarding steps={STEPS} open />);
    await screen.findByRole("dialog");
    expect(screen.getByRole("img", { name: "Step 1 of 3" })).toBeTruthy();
  });

  it("starts again from the first step when its owner opens it again", async () => {
    const { rerender } = render(<Onboarding steps={STEPS} open />);
    await screen.findByRole("dialog");
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("img", { name: "Step 2 of 3" })).toBeTruthy();
    rerender(<Onboarding steps={STEPS} open={false} />);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    rerender(<Onboarding steps={STEPS} open />);
    await screen.findByRole("dialog");
    expect(screen.getByRole("img", { name: "Step 1 of 3" })).toBeTruthy();
  });

  it("closes once the confetti has flown while its owner keeps rendering", async () => {
    function Owner(): ReactElement {
      const [open, setOpen] = useState(true);
      const [, setTick] = useState(0);
      useEffect(() => {
        const timer = window.setInterval(() => {
          setTick((tick) => tick + 1);
        }, 50);
        return () => {
          window.clearInterval(timer);
        };
      }, []);
      return (
        <Onboarding
          steps={STEPS}
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
          }}
        />
      );
    }
    render(
      <ButteryProvider reducedMotion="never" layoutGuard={false}>
        <Owner />
      </ButteryProvider>,
    );
    await screen.findByRole("dialog");
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await userEvent.click(forward());
    expect(forward().hasAttribute("aria-disabled")).toBe(false);
    await waitFor(
      () => {
        expect(screen.queryByRole("dialog")).toBeNull();
      },
      { timeout: 2000 },
    );
  });

  it("speaks the words it's given", async () => {
    render(
      <Onboarding
        steps={STEPS}
        defaultOpen
        labels={{
          back: "Zurück",
          next: "Weiter",
          finish: "Fertig",
          close: "Schließen",
          step: (step, count) =>
            `Schritt ${String(step + 1)} von ${String(count)}`,
        }}
      />,
    );
    await screen.findByRole("dialog");
    expect(screen.getByRole("button", { name: "Zurück" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Weiter" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Schließen" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Schritt 1 von 3" })).toBeTruthy();
  });
});
