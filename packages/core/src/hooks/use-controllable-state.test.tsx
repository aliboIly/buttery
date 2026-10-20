import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useControllableState } from "./use-controllable-state.ts";

describe("useControllableState", () => {
  it("keeps its own state when uncontrolled and reports changes", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: 1, onChange }),
    );
    act(() => {
      result.current[1](result.current[0] + 1);
    });
    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("reflects the controlled value and only asks the owner to change it", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) =>
        useControllableState({ value, defaultValue: "a", onChange }),
      { initialProps: { value: "b" } },
    );
    act(() => {
      result.current[1]("c");
    });
    expect(result.current[0]).toBe("b");
    expect(onChange).toHaveBeenCalledWith("c");
    rerender({ value: "c" });
    expect(result.current[0]).toBe("c");
  });

  it("stores function values as values", () => {
    const first = (): string => "first";
    const second = (): string => "second";
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: first }),
    );
    act(() => {
      result.current[1](second);
    });
    expect(result.current[0]).toBe(second);
  });

  it("skips onChange when the value doesn't change", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: "same", onChange }),
    );
    act(() => {
      result.current[1]("same");
    });
    expect(onChange).not.toHaveBeenCalled();
  });
});
