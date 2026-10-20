import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
});
