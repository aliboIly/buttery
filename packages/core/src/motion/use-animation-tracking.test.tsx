import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
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

  it("lets go of a layout animation that reduced motion turns off half way, which Motion never reports ending", () => {
    publishSettled();
    let preference: MotionPreference = "full";
    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <MotionPreferenceContext value={preference}>
        {children}
      </MotionPreferenceContext>
    );
    const { result, rerender, unmount } = renderHook(
      () => useAnimationTracking(),
      { wrapper },
    );
    result.current.onLayoutAnimationStart();
    expect(isSettled()).toBe(false);
    preference = "reduced";
    rerender();
    expect(isSettled()).toBe(true);
    unmount();
  });
});
