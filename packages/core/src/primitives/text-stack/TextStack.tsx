import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { cx } from "../../utils/cx.ts";
import { Text } from "../text/Text.tsx";
import type { TextVariant } from "../text/Text.tsx";

/** Which stack: the text roles and the gaps between them. */
export type TextStackSize = "dialog" | "empty" | "section";

/** The element a stack's title renders as. */
export type TextStackTitleElement =
  "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";

/** Props for `TextStack`. */
export interface TextStackProps extends Omit<
  ComponentPropsWithRef<"div">,
  "title" | "children"
> {
  /** The heading. */
  readonly title: ReactNode;
  /** The text under the title. */
  readonly body?: ReactNode;
  /** A hint under the body, such as a shortcut tip. */
  readonly caption?: ReactNode;
  /**
   * `"dialog"` (the default): a dialog title, its body 16px below and a caption 20px below that.
   * `"empty"`: an empty state's title with its description 12px below. `"section"`: a page section's
   * heading over larger body text, 16px apart.
   */
  readonly size?: TextStackSize | undefined;
  /** `"start"` (the default) or `"center"`, as in empty states. */
  readonly align?: "start" | "center" | undefined;
  /** What the title renders as: a heading level, or `"p"` when it isn't a heading. Defaults to `"h2"`. */
  readonly titleAs?: TextStackTitleElement | undefined;
}

const ROLES: Readonly<
  Record<
    TextStackSize,
    { readonly title: TextVariant; readonly body: TextVariant }
  >
> = {
  dialog: { title: "dialog-title", body: "body" },
  empty: { title: "title", body: "body-sm" },
  section: { title: "heading-2", body: "body-lg" },
};

/**
 * A title with body text and a caption under it, the text block of dialogs, empty states and page
 * sections. The roles trim their line boxes to the text, so the gaps between them are the gaps you see.
 *
 * @example
 * <TextStack
 *   title="Make it yours"
 *   body="Pick a backdrop, round the corners and add depth."
 *   caption="Tip: hold Shift for finer steps."
 * />
 */
export function TextStack({
  title,
  body,
  caption,
  size = "dialog",
  align = "start",
  titleAs: Title = "h2",
  className,
  ...rest
}: TextStackProps): ReactElement {
  const roles = ROLES[size];
  return (
    <div
      {...rest}
      className={cx("bt-text-stack", className)}
      data-bt="TextStack"
      data-size={size}
      data-align={align}
    >
      <div data-bt-part="head">
        <Text variant={roles.title} asChild>
          <Title>{title}</Title>
        </Text>
        {body === undefined ? null : <Text variant={roles.body}>{body}</Text>}
      </div>
      {caption === undefined ? null : <Text variant="caption">{caption}</Text>}
    </div>
  );
}
