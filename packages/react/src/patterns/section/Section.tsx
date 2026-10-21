import { TextStack, cx, hasContent } from "@buttery/core";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { useId } from "react";
import { Container } from "../container/Container.tsx";

/** How much room a section takes above and below: 64, 96 or 128px. */
export type SectionSize = "sm" | "md" | "lg";

/** Props for `Section`. */
export interface SectionProps extends Omit<
  ComponentPropsWithRef<"section">,
  "title"
> {
  /** Room above and below: `"sm"` (64px), `"md"` (96px, the default) or `"lg"` (128px). */
  readonly size?: SectionSize | undefined;
  /** `"default"` on the surface, or `"muted"` on the app background, to set a section apart. */
  readonly tone?: "default" | "muted" | undefined;
  /** The section's heading. It names the section for screen readers. */
  readonly title?: ReactNode;
  /** A line or two under the heading. */
  readonly body?: ReactNode;
  /** Where the heading and body sit: `"start"` (the default) or `"center"`. */
  readonly align?: "start" | "center" | undefined;
  /** Whether the content sits in a `Container`. Defaults to `true`; turn it off for full-bleed content. */
  readonly contained?: boolean | undefined;
}

/**
 * A band of a page: room above and below, an optional heading and body (a `TextStack` at its section size,
 * 48px above the content, 64 once the page is past 1024px), and the content in a `Container`.
 *
 * @example
 * <Section title="Made for launch days" body="Every card exports at the size you need.">
 *   <Bento>…</Bento>
 * </Section>
 */
export function Section({
  size = "md",
  tone = "default",
  title,
  body,
  align = "start",
  contained = true,
  className,
  children,
  ...rest
}: SectionProps): ReactElement {
  const titleId = useId();
  const titled = hasContent(title);
  const content = (
    <>
      {titled ? (
        <TextStack
          size="section"
          align={align}
          title={<span id={titleId}>{title}</span>}
          body={body}
          data-bt-part="intro"
        />
      ) : null}
      {children}
    </>
  );
  return (
    <section
      aria-labelledby={titled ? titleId : undefined}
      {...rest}
      className={cx("bt-section", className)}
      data-bt="Section"
      data-size={size}
      data-tone={tone}
    >
      {contained ? <Container>{content}</Container> : content}
    </section>
  );
}
