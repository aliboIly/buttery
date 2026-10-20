import { spaceStep } from "../tokens/space.ts";
import type { SpaceValue } from "../tokens/space.ts";

/** Spacing props shared by the flow primitives. Every value is a step on the spacing scale (`4` = 16px). */
export interface SpacingProps {
  /** Space between children. */
  readonly gap?: SpaceValue | undefined;
  /** Padding on every side. */
  readonly pad?: SpaceValue | undefined;
  /** Left and right padding. Wins over `pad` on those sides. */
  readonly padX?: SpaceValue | undefined;
  /** Top and bottom padding. Wins over `pad` on those sides. */
  readonly padY?: SpaceValue | undefined;
}

/** The data attributes that `layout.css` turns into `gap` and `padding`. */
export interface SpacingAttributes {
  readonly "data-gap"?: string;
  readonly "data-pad"?: string;
  readonly "data-pad-x"?: string;
  readonly "data-pad-y"?: string;
}

/** Maps spacing props to the attributes the generated layout rules read. */
export function spacingAttributes({
  gap,
  pad,
  padX,
  padY,
}: SpacingProps): SpacingAttributes {
  return {
    ...(gap === undefined ? {} : { "data-gap": spaceStep(gap) }),
    ...(pad === undefined ? {} : { "data-pad": spaceStep(pad) }),
    ...(padX === undefined ? {} : { "data-pad-x": spaceStep(padX) }),
    ...(padY === undefined ? {} : { "data-pad-y": spaceStep(padY) }),
  };
}
