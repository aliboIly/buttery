import {
  ReflowGroup,
  cx,
  hasContent,
  useAnimationTracking,
  useReflow,
} from "@butteryui/core";
import type { MotionElementProps } from "@butteryui/core";
import { motion } from "motion/react";
import { useId, useLayoutEffect, useMemo } from "react";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { useAppShell } from "../app-shell/app-shell-context.ts";
import { AppPageContext } from "./app-page-context.ts";

/** Props for `AppPage`. */
export interface AppPageProps extends ComponentPropsWithRef<"main"> {
  /**
   * How wide the page gets, its padding included, centered in the column: `"contained"` (the default),
   * 1280px, for index and table pages; `"medium"`, 960px, for a settings detail page; `"narrow"`, 820px, for
   * a dense form or a preferences matrix; or `"full"`, the column's width.
   */
  readonly width?: "contained" | "medium" | "narrow" | "full" | undefined;
  /** The page's header, a `PageHeader`, with its tabs and quick actions inside it. */
  readonly header?: ReactNode;
  /**
   * A right rail beside the page, 320px wide from 1040px of the shell's column beside a full sidebar (1280 of
   * shell, with no side panel docked), under the page otherwise, including beside a narrow shell's icon rail.
   */
  readonly aside?: ReactNode;
  /** Names the right rail's landmark, such as "Customer details". Defaults to `"Details"`. */
  readonly asideLabel?: string | undefined;
  /**
   * Gives the page's last block the rest of the height, so a table scrolls inside it with its header
   * sticky while the header and filters stay put; the table's pagination then keeps floating lanes above
   * it. Defaults to `false`.
   */
  readonly fill?: boolean | undefined;
  /**
   * A small footer that ends the page under a hairline, such as a feedback link and the keyboard
   * shortcuts, in `body-sm` and `text-secondary`.
   */
  readonly footer?: ReactNode;
}

function AppPageRoot({
  width = "contained",
  header,
  aside,
  asideLabel = "Details",
  fill = false,
  footer,
  className,
  children,
  ...rest
}: AppPageProps): ReactElement {
  const withAside = hasContent(aside);
  const page = useMemo(() => ({ fill }), [fill]);
  const { scrollPageToTop } = useAppShell();

  useLayoutEffect(() => {
    scrollPageToTop();
  }, [scrollPageToTop]);

  return (
    <main
      data-bt="AppPage"
      {...rest}
      className={cx("bt-app-page", className)}
      data-width={width}
      data-fill={fill ? "" : undefined}
    >
      <ReflowGroup>
        <AppPageContext value={page}>
          <div data-bt-part="frame">
            {hasContent(header) ? (
              <div data-bt-part="header">{header}</div>
            ) : null}
            <div data-bt-part="body" data-aside={withAside ? "" : undefined}>
              <div data-bt-part="main">{children}</div>
              {withAside ? (
                <aside aria-label={asideLabel} data-bt-part="aside">
                  {aside}
                </aside>
              ) : null}
            </div>
            {hasContent(footer) ? (
              <footer
                className="bt-text"
                data-role="body-sm"
                data-bt-part="footer"
              >
                {footer}
              </footer>
            ) : null}
          </div>
        </AppPageContext>
      </ReflowGroup>
    </main>
  );
}

/** Props for `AppPage.Section`. */
export interface AppPageSectionProps extends Omit<
  MotionElementProps<"section">,
  "title"
> {
  /** The section's heading, an `h2` in `title-md`, which names it. */
  readonly title?: string | undefined;
  /** One line under the heading saying what the section is for, in `body-sm` and `text-secondary`. */
  readonly description?: ReactNode;
  /** Actions at the end of the heading's row, such as a small "See all" button. */
  readonly actions?: ReactNode;
}

/**
 * One block of a page, 32px from the next: an optional `title-md` heading with actions at its end, then its
 * content 16px under it. When a banner or card above it in the page is dismissed, it slides up into the space.
 */
export function AppPageSection({
  title,
  description,
  actions,
  className,
  children,
  ...rest
}: AppPageSectionProps): ReactElement {
  const titleId = useId();
  const titled = title !== undefined;
  const described = hasContent(description);
  const reflow = useReflow();
  const tracking = useAnimationTracking();
  return (
    <motion.section
      aria-labelledby={titled ? titleId : undefined}
      {...rest}
      {...reflow}
      onLayoutAnimationStart={tracking.onLayoutAnimationStart}
      onLayoutAnimationComplete={tracking.onLayoutAnimationComplete}
      className={cx("bt-app-page-section", className)}
      data-bt-part="section"
      data-bt-region=""
    >
      {titled || described || hasContent(actions) ? (
        <div data-bt-part="section-head">
          {titled || described ? (
            <div data-bt-part="section-titles">
              {titled ? (
                <h2
                  id={titleId}
                  className="bt-text bt-truncate"
                  data-role="title-md"
                  data-bt-truncate=""
                  title={title}
                  data-bt-part="section-title"
                >
                  {title}
                </h2>
              ) : null}
              {described ? (
                <p
                  className="bt-text"
                  data-role="body-sm"
                  data-bt-part="section-description"
                >
                  {description}
                </p>
              ) : null}
            </div>
          ) : null}
          {hasContent(actions) ? (
            <div data-bt-part="section-actions">{actions}</div>
          ) : null}
        </div>
      ) : null}
      {children}
    </motion.section>
  );
}

/** `AppPage` with its `Section` part. */
export interface AppPageComponent {
  (props: AppPageProps): ReactElement;
  /** One block of the page. */
  readonly Section: typeof AppPageSection;
}

/**
 * A dashboard page in an `AppShell layout="sidebar"`: its `main` landmark, centered in the column at most
 * 1280px wide with its padding (`contained`), 960 (`medium`) or 820 (`narrow`), or `full`, padded 16, 24 or
 * 32 by the column's width. The header comes first and the page's sections 24px under it, 32px apart; a
 * right rail sits beside them, 320px wide and 32px away, from 1040px of column beside a full sidebar, and
 * under them otherwise. With `fill`, the last block takes the rest of the height so a table scrolls inside
 * it. Its end padding leaves room for floating lanes.
 * Each page starts at the top: mounting one scrolls the shell's page region back up, so key a page by what
 * it shows (`<CustomerPage key={id} />`) when one route renders it for different records.
 *
 * @example
 * <AppPage header={<PageHeader title="Orders" />} fill>
 *   <AppPage.Section>
 *     <DataTable … />
 *   </AppPage.Section>
 * </AppPage>
 */
export const AppPage: AppPageComponent = Object.assign(AppPageRoot, {
  Section: AppPageSection,
});
