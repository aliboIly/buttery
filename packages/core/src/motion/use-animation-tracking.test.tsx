import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MotionPreferenceContext } from "./preference.ts";
import type { MotionPreference } from "./preference.ts";
import { isSettled, publishSettled } from "./settle.ts";
import { useAnimationTracking } from "./use-animation-tracking.ts";

describe("useAnimationTracking", () => {
  it("keeps the page unsettled until both its own and its layout animation end", () => {
    publishSettled();
    const { result, unmount } = renderHook(() => useAnimationTracking());
    result.current.onAnimationStart();
    result.current.onLayoutAnimationStart();
    result.current.onAnimationComplete();
    expect(isSettled()).toBe(false);
    result.current.onLayoutAnimationComplete();
    expect(isSettled()).toBe(true);
    result.current.onLayoutAnimationStart();
    unmount();
    expect(isSettled()).toBe(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function tracked() {
    publishSettled();
    let preference: MotionPreference = "full";
    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <MotionPreferenceContext value={preference}>
        {children}
      </MotionPreferenceContext>
    );
    const hook = renderHook(() => useAnimationTracking(), { wrapper });
    return {
      ...hook,
      reduce: () => {
        preference = "reduced";
        hook.rerender();
      },
    };
  }

  it("waits for a layout animation that reduced motion turns off half way to report its end", () => {
    vi.useFakeTimers();
    const { result, reduce, unmount } = tracked();
    result.current.onLayoutAnimationStart();
    reduce();
    expect(isSettled()).toBe(false);
    result.current.onLayoutAnimationComplete();
    expect(isSettled()).toBe(true);
    unmount();
  });

  it("lets go of one that never reports its end once the longest layout animation would have ended", () => {
    vi.useFakeTimers();
    const { result, reduce, unmount } = tracked();
    result.current.onLayoutAnimationStart();
    reduce();
    vi.advanceTimersByTime(800);
    expect(isSettled()).toBe(false);
    vi.advanceTimersByTime(200);
    expect(isSettled()).toBe(true);
    unmount();
  });

  it("lets go of its own animation that reduced motion cut short without reporting its end", () => {
    vi.useFakeTimers();
    const { result, reduce, unmount } = tracked();
    result.current.onAnimationStart();
    reduce();
    vi.advanceTimersByTime(800);
    expect(isSettled()).toBe(false);
    vi.advanceTimersByTime(200);
    expect(isSettled()).toBe(true);
    unmount();
  });
});
