import type { ReactElement, ReactNode } from "react";
import { TextStack } from "@butteryui/core";

/** A page's title, its `h1`, and a line under it, as far above what follows as a section's intro is. */
export function PageIntro({
  title,
  body,
}: {
  readonly title: ReactNode;
  readonly body?: ReactNode;
}): ReactElement {
  return (
    <TextStack
      size="section"
      titleAs="h1"
      title={title}
      body={body}
      className="shop-page-intro"
    />
  );
}
