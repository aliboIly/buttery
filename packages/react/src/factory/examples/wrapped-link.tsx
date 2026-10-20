import type { ComponentPropsWithRef, ReactElement } from "react";
import { Text } from "@buttery/core";
import { buttery } from "@buttery/react";

function Link({
  children,
  ...props
}: ComponentPropsWithRef<"a">): ReactElement {
  return <a {...props}>{children}</a>;
}

const CardLink = buttery(Link, {
  surface: "card",
  pad: 4,
  stack: true,
  gap: 2,
  press: true,
  focus: true,
  hover: "lift",
});

/** A link component from elsewhere, made into a card that presses and lifts like the rest of buttery. */
export function WrappedLink(): ReactElement {
  return (
    <CardLink href="#/surface">
      <Text variant="label">Summer sale</Text>
      <Text variant="caption">Edited yesterday</Text>
    </CardLink>
  );
}
