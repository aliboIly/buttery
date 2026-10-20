import { Slot as RadixSlot } from "radix-ui";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";

function single(children: ReactNode): ReactNode {
  if (!Array.isArray(children)) return children;
  const items: readonly ReactNode[] = children;
  return items.length === 1 ? items[0] : children;
}

/**
 * Radix's `Slot`: merges its props onto its single child element. It also takes that element in a
 * one-item array, which is how a `Slottable` hands children on, so an `asChild` primitive can sit inside
 * a component that adds its own part, such as `SharedIndicator`.
 */
export function Slot({
  children,
  ...props
}: ComponentPropsWithRef<typeof RadixSlot.Root>): ReactElement {
  return <RadixSlot.Root {...props}>{single(children)}</RadixSlot.Root>;
}
