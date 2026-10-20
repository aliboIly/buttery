import { renderHook } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { spring } from "../tokens/motion.ts";
import { MotionPreferenceContext } from "./preference.ts";
import type { MotionPreference } from "./preference.ts";
import {
  reducedTransition,
  useButteryTransition,
  useLayoutAnimation,
} from "./transitions.ts";

function withPreference(preference: MotionPreference) {
  return function Wrapper({
    children,
  }: {
    readonly children: ReactNode;
  }): ReactElement {
    return (
      <MotionPreferenceContext value={preference}>
        {children}
      </MotionPreferenceContext>
    );
  };
}

function hooks(preference: MotionPreference) {
  return renderHook(
    () => ({
      transition: useButteryTransition("snappy"),
      layout: useLayoutAnimation("morph"),
    }),
    { wrapper: withPreference(preference) },
  ).result.current;
}

describe("motion transitions", () => {
  it("hands out the named spring with full motion", () => {
    const seen = hooks("full");
    expect(seen.transition).toBe(spring.snappy);
    expect(seen.layout).toEqual({ layout: true, transition: spring.morph });
  });

  it("lands transforms at once, fades in 100ms and leaves layout alone with reduced motion", () => {
    const seen = hooks("reduced");
    expect(seen.transition).toBe(reducedTransition);
    expect(seen.layout).toEqual({
      layout: false,
      transition: reducedTransition,
    });
    expect(reducedTransition).toMatchObject({
      default: spring.instant,
      opacity: { duration: 0.1 },
    });
  });

  it("never asks Motion for a zero-length animation", () => {
    expect(spring.instant.duration).toBeGreaterThan(0);
  });
});
