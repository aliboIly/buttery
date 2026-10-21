import { act, cleanup, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useStoredState } from "./use-stored-state.ts";

const KEY = "buttery-test:count";

function isCount(value: unknown): value is number {
  return typeof value === "number";
}

function Counter({
  storageKey,
  name,
}: {
  readonly storageKey?: string | undefined;
  readonly name: string;
}): ReactElement {
  const [count, setCount] = useStoredState(storageKey, 0, isCount);
  return (
    <button
      type="button"
      onClick={() => {
        setCount((current) => current + 1);
      }}
    >
      {`${name} ${String(count)}`}
    </button>
  );
}

beforeEach(() => {
  window.localStorage.removeItem(KEY);
});

afterEach(cleanup);

describe("useStoredState", () => {
  it("is ordinary state without a key", () => {
    render(<Counter name="a" />);
    act(() => {
      screen.getByRole("button").click();
    });
    expect(screen.getByRole("button").textContent).toBe("a 1");
    expect(window.localStorage.getItem(KEY)).toBeNull();
  });

  it("keeps its value under the key and shares it with everything that reads it", () => {
    render(
      <>
        <Counter storageKey={KEY} name="a" />
        <Counter storageKey={KEY} name="b" />
      </>,
    );
    act(() => {
      screen.getByRole("button", { name: "a 0" }).click();
    });
    expect(screen.getByRole("button", { name: "b 1" })).toBeTruthy();
    expect(window.localStorage.getItem(KEY)).toBe("1");
    cleanup();
    render(<Counter storageKey={KEY} name="c" />);
    expect(screen.getByRole("button").textContent).toBe("c 1");
  });

  it("falls back when what's stored isn't the right shape", () => {
    window.localStorage.setItem(KEY, '"many"');
    render(<Counter storageKey={KEY} name="a" />);
    expect(screen.getByRole("button").textContent).toBe("a 0");
    window.localStorage.setItem(KEY, "{not json");
    cleanup();
    render(<Counter storageKey={KEY} name="b" />);
    expect(screen.getByRole("button").textContent).toBe("b 0");
  });

  it("follows a change made in another tab", () => {
    render(<Counter storageKey={KEY} name="a" />);
    act(() => {
      window.localStorage.setItem(KEY, "5");
      window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
    });
    expect(screen.getByRole("button").textContent).toBe("a 5");
  });
});
