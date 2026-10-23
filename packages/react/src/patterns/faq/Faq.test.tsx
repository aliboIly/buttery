import "@butteryui/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@butteryui/core";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { Faq } from "./Faq.tsx";
import type { FaqGroup, FaqProps, FaqQuestion } from "./Faq.tsx";

const GROUPS: readonly FaqGroup[] = [
  { value: "orders", label: "Orders and shipping" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "coffee", label: "Coffee and brewing" },
];

const QUESTIONS: readonly FaqQuestion[] = [
  {
    id: "test-arrival",
    group: "orders",
    question: "When will my coffee arrive?",
    answer: "Most orders arrive in two to four days.",
  },
  {
    id: "test-returns",
    group: "orders",
    question: "What if I don't like a coffee?",
    answer: "Tell us within 30 days and we'll send another.",
    keywords: "refund",
  },
  {
    id: "test-skip",
    group: "subscriptions",
    question: "Can I skip a delivery?",
    answer: "Yes, up to the day before it roasts.",
  },
  {
    id: "test-storage",
    group: "coffee",
    question: "How should I store my coffee?",
    answer: (
      <>
        Keep it sealed, away from heat. <a href="#guides">Our guides</a> say
        more.
      </>
    ),
  },
];

beforeEach(() => {
  publishSettled();
  window.history.replaceState(null, "", window.location.pathname);
});

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", window.location.pathname);
});

function Shop(props: Partial<FaqProps>): ReactElement {
  return (
    <div style={{ inlineSize: "960px" }}>
      <Faq
        title="Questions, answered"
        intro="What people ask us most."
        questions={QUESTIONS}
        groups={GROUPS}
        search
        {...props}
      />
    </div>
  );
}

function question(name: string): HTMLElement {
  return screen.getByRole("button", { name });
}

function searchField(): HTMLElement {
  return screen.getByRole("searchbox", { name: "Search questions" });
}

async function nextFrames(count: number): Promise<void> {
  for (let frame = 0; frame < count; frame += 1) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
}

describe("Faq", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Faq ref={ref} questions={QUESTIONS} id="questions" className="custom" />,
    );
    expect(ref.current?.dataset["bt"]).toBe("Faq");
    expect(ref.current?.id).toBe("questions");
    expect(ref.current?.className).toBe("bt-faq custom");
    expect(ref.current?.dataset["layout"]).toBe("stacked");
    expect(ref.current?.dataset["variant"]).toBe("divided");
  });

  it("titles itself with an h2 and puts its questions in h3s, a level lower with titleAs", () => {
    const { unmount } = render(<Shop />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Questions, answered" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "When will my coffee arrive?",
      }),
    ).toBeTruthy();
    unmount();
    render(<Shop titleAs="h3" />);
    expect(
      screen.getByRole("heading", {
        level: 4,
        name: "When will my coffee arrive?",
      }),
    ).toBeTruthy();
  });

  it("shows the first group's questions under tabs that switch to another group's", async () => {
    render(<Shop />);
    expect(screen.getByRole("tablist", { name: "Topics" })).toBeTruthy();
    expect(question("When will my coffee arrive?")).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Can I skip a delivery?" }),
    ).toBeNull();
    await userEvent.click(screen.getByRole("tab", { name: "Subscriptions" }));
    expect(question("Can I skip a delivery?")).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "When will my coffee arrive?" }),
    ).toBeNull();
  });

  it("lets several questions stay open, and can be controlled", async () => {
    function Controlled(): ReactElement {
      const [open, setOpen] = useState<readonly string[]>([]);
      return (
        <>
          <Shop value={open} onValueChange={setOpen} />
          <output>{open.join(", ")}</output>
        </>
      );
    }
    render(<Controlled />);
    await userEvent.click(question("When will my coffee arrive?"));
    await userEvent.click(question("What if I don't like a coffee?"));
    expect(document.querySelector("output")?.textContent).toBe(
      "test-arrival, test-returns",
    );
    expect(
      question("When will my coffee arrive?").getAttribute("aria-expanded"),
    ).toBe("true");
  });

  it("searches every group's questions, answers and keywords as you type, marking the words and saying how many match", async () => {
    render(<Shop />);
    await userEvent.type(searchField(), "coffee");
    expect(screen.queryByRole("tablist")).toBeNull();
    const found = screen
      .getAllByRole("button")
      .filter((button) => button.hasAttribute("aria-expanded"))
      .map((button) => button.textContent);
    expect(found).toEqual([
      "When will my coffee arrive?Orders and shipping",
      "What if I don't like a coffee?Orders and shipping",
      "How should I store my coffee?Coffee and brewing",
    ]);
    expect(
      [...document.querySelectorAll("mark")].map((mark) => mark.textContent),
    ).toEqual(["coffee", "coffee", "coffee"]);
    await waitFor(() => {
      expect(
        screen
          .getAllByRole("status")
          .some((status) => status.textContent === "3 questions match"),
      ).toBe(true);
    });
    await userEvent.clear(searchField());
    await userEvent.type(searchField(), "refund");
    expect(
      question("What if I don't like a coffee? Orders and shipping"),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /^When will my coffee arrive\?/ }),
    ).toBeNull();
  });

  it("finds words in an answer that isn't plain text", async () => {
    render(<Shop />);
    await userEvent.type(searchField(), "guides");
    expect(
      question("How should I store my coffee? Coffee and brewing"),
    ).toBeTruthy();
  });

  it("says when nothing matches, and Show all questions brings them back with focus in the field", async () => {
    render(<Shop />);
    await userEvent.type(searchField(), "decaf");
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: 'No questions match "decaf"',
      }),
    ).toBeTruthy();
    await userEvent.click(
      screen.getByRole("button", { name: "Show all questions" }),
    );
    expect(searchField()).toHaveProperty("value", "");
    expect(document.activeElement).toBe(searchField());
    expect(question("When will my coffee arrive?")).toBeTruthy();
    expect(screen.getByRole("tablist", { name: "Topics" })).toBeTruthy();
  });

  it("clears the search with Escape, keeping focus in the field", async () => {
    render(<Shop />);
    await userEvent.type(searchField(), "skip");
    await userEvent.keyboard("{Escape}");
    expect(searchField()).toHaveProperty("value", "");
    expect(document.activeElement).toBe(searchField());
  });

  it("shows the group and clears a search that hides a question opened from outside", async () => {
    function FromOutside(): ReactElement {
      const [open, setOpen] = useState<readonly string[]>([]);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setOpen([...open, "test-storage"]);
            }}
          >
            Ask about storage
          </button>
          <Shop value={open} onValueChange={setOpen} />
        </>
      );
    }
    render(<FromOutside />);
    await userEvent.type(searchField(), "skip");
    await userEvent.click(
      screen.getByRole("button", { name: "Ask about storage" }),
    );
    expect(searchField()).toHaveProperty("value", "");
    expect(
      screen
        .getByRole("tab", { name: "Coffee and brewing" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    expect(
      question("How should I store my coffee?").getAttribute("aria-expanded"),
    ).toBe("true");
  });

  it("opens the question an address's #id names as it loads, showing its group and moving focus to it", async () => {
    window.history.replaceState(null, "", "#test-skip");
    render(<Shop />);
    await waitFor(() => {
      expect(
        question("Can I skip a delivery?").getAttribute("aria-expanded"),
      ).toBe("true");
    });
    expect(
      screen
        .getByRole("tab", { name: "Subscriptions" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    await waitFor(() => {
      expect(document.activeElement).toBe(document.getElementById("test-skip"));
    });
  });

  it("opens a question when a #id link to it is followed, and again from the same link after it's closed", async () => {
    render(
      <>
        <a href="#test-returns">Read about returns</a>
        <Shop />
      </>,
    );
    const link = screen.getByRole("link", { name: "Read about returns" });
    await userEvent.click(link);
    await waitFor(() => {
      expect(
        question("What if I don't like a coffee?").getAttribute(
          "aria-expanded",
        ),
      ).toBe("true");
    });
    await userEvent.click(question("What if I don't like a coffee?"));
    expect(
      question("What if I don't like a coffee?").getAttribute("aria-expanded"),
    ).toBe("false");
    await userEvent.click(link);
    await waitFor(() => {
      expect(
        question("What if I don't like a coffee?").getAttribute(
          "aria-expanded",
        ),
      ).toBe("true");
    });
  });

  it("puts the intro and the contact beside the questions when split, and under 640px stacks them in order", async () => {
    const { rerender } = render(
      <div style={{ inlineSize: "960px" }}>
        <Faq
          title="Questions, answered"
          layout="split"
          questions={QUESTIONS}
          contact={<Faq.Contact description="Write to us." />}
        />
      </div>,
    );
    const intro = screen.getByRole("heading", { level: 2 });
    const first = question("When will my coffee arrive?");
    const contact = screen.getByRole("heading", {
      name: "Still have a question?",
    });
    expect(intro.getBoundingClientRect().right).toBeLessThan(
      first.getBoundingClientRect().left,
    );
    expect(contact.getBoundingClientRect().right).toBeLessThan(
      first.getBoundingClientRect().left,
    );
    expect(contact.getBoundingClientRect().top).toBeGreaterThan(
      intro.getBoundingClientRect().bottom,
    );
    rerender(
      <div style={{ inlineSize: "600px" }}>
        <Faq
          title="Questions, answered"
          layout="split"
          questions={QUESTIONS}
          contact={<Faq.Contact description="Write to us." />}
        />
      </div>,
    );
    await nextFrames(1);
    expect(first.getBoundingClientRect().top).toBeGreaterThan(
      intro.getBoundingClientRect().bottom,
    );
    expect(contact.getBoundingClientRect().top).toBeGreaterThan(
      first.getBoundingClientRect().bottom,
    );
  });

  it("leaves no room for an intro or a contact it doesn't have, in each layout", () => {
    for (const layout of ["stacked", "split", "two-column"] as const) {
      const { unmount } = render(
        <div style={{ inlineSize: "960px" }}>
          <Faq
            layout={layout}
            search
            questions={QUESTIONS}
            data-testid="bare"
          />
        </div>,
      );
      const faq = screen.getByTestId("bare").getBoundingClientRect();
      const field = searchField()
        .closest('[data-bt="SearchField"]')
        ?.getBoundingClientRect();
      expect(field?.left, layout).toBe(faq.left);
      expect(field?.top, layout).toBe(faq.top);
      const last = question("How should I store my coffee?")
        .closest('[data-bt-part="accordion-item"]')
        ?.getBoundingClientRect();
      expect(last?.bottom, layout).toBe(faq.bottom);
      unmount();
    }
  });

  it("lays its questions out in two columns, the first half in the first", () => {
    render(
      <div style={{ inlineSize: "960px" }}>
        <Faq layout="two-column" questions={QUESTIONS} />
      </div>,
    );
    const [first, second, third, fourth] = [
      "When will my coffee arrive?",
      "What if I don't like a coffee?",
      "Can I skip a delivery?",
      "How should I store my coffee?",
    ].map((name) => question(name).getBoundingClientRect());
    expect(second?.left).toBe(first?.left);
    expect(second?.top).toBeGreaterThan(first?.top ?? 0);
    expect(third?.left).toBeGreaterThan(first?.right ?? 0);
    expect(third?.top).toBe(first?.top);
    expect(fourth?.left).toBe(third?.left);
  });

  it("keeps a stacked FAQ 720px wide at most and its answers to 60 characters", async () => {
    render(
      <div style={{ inlineSize: "1200px" }}>
        <Faq
          questions={[
            {
              id: "test-long",
              question: "Do you roast every coffee to order?",
              answer:
                "Every bag is roasted the morning after it's ordered, rested for a few hours, then packed and sent out that afternoon, so it reaches you within days of its roast.",
            },
          ]}
          defaultValue={["test-long"]}
        />
      </div>,
    );
    const first = question("Do you roast every coffee to order?");
    expect(first.getBoundingClientRect().width).toBe(720);
    const answer = await screen.findByText(/^Every bag is roasted/);
    const sixty = document.createElement("span");
    sixty.style.display = "block";
    sixty.style.inlineSize = "60ch";
    answer.append(sixty);
    const measure = sixty.getBoundingClientRect().width;
    sixty.remove();
    expect(answer.getBoundingClientRect().width).toBeCloseTo(measure, 0);
    expect(answer.getBoundingClientRect().height).toBeGreaterThan(30);
  });

  it("sets a contact's actions beside its words when it's wide, and under them when it's narrow", () => {
    const { rerender } = render(
      <div style={{ inlineSize: "640px" }}>
        <Faq.Contact
          description="Write to us."
          actions={<a href="mailto:hello@halfmoon.example">Email us</a>}
        />
      </div>,
    );
    const title = screen.getByRole("heading", {
      name: "Still have a question?",
    });
    const action = screen.getByRole("link", { name: "Email us" });
    expect(action.getBoundingClientRect().left).toBeGreaterThan(
      title.getBoundingClientRect().right,
    );
    rerender(
      <div style={{ inlineSize: "320px" }}>
        <Faq.Contact
          description="Write to us."
          actions={<a href="mailto:hello@halfmoon.example">Email us</a>}
        />
      </div>,
    );
    expect(action.getBoundingClientRect().top).toBeGreaterThan(
      title.getBoundingClientRect().bottom,
    );
  });

  it("warns, with the fix, about a question in a group it doesn't list", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <Faq
        groups={GROUPS}
        questions={[
          ...QUESTIONS,
          {
            id: "test-lost",
            group: "wholesale",
            question: "Do you sell to cafés?",
            answer: "We do.",
          },
        ]}
      />,
    );
    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith(
        expect.stringMatching(
          /\[buttery:Faq\] The question "Do you sell to cafés\?" is in the group "wholesale".*Fix:/,
        ),
      );
    });
    warn.mockRestore();
  });

  it("names a question's answer region after the question", async () => {
    render(<Shop defaultValue={["test-arrival"]} />);
    const region = await screen.findByRole("region", {
      name: "When will my coffee arrive?",
    });
    expect(
      within(region).getByText("Most orders arrive in two to four days."),
    ).toBeTruthy();
  });
});
