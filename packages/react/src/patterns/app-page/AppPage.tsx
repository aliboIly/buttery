import { cx, hasContent } from "@buttery/core";
import { useId } from "react";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";

/** Props for `AppPage`. */
export interface AppPageProps extends ComponentPropsWithRef<"main"> {
  /** `"contained"` (the default), at most 1280px wide with its padding and centered, or `"full"`, the column's width. */
  readonly width?: "contained" | "full" | undefined;
  /** The page's header, a `PageHeader`, with its tabs and quick actions inside it. */
  readonly header?: ReactNode;
  /** A right rail beside the page, 320px wide from 1280px of shell, under the page below that. */
  readonly aside?: ReactNode;
  /** Names the right rail's landmark, such as "Customer details". Defaults to `"Details"`. */
  readonly asideLabel?: string | undefined;
  /**
   * Gives the page's last block the rest of the height, so a table scrolls inside it with its header
   * sticky while the header and filters stay put. Defaults to `false`.
   */
  readonly fill?: boolean | undefined;
}

function AppPageRoot({
  width = "contained",
  header,
  aside,
  asideLabel = "Details",
  fill = false,
  className,
  children,
  ...rest
}: AppPageProps): ReactElement {
  const withAside = hasContent(aside);
  return (
    <main
      {...rest}
      className={cx("bt-app-page", className)}
      data-bt="AppPage"
      data-width={width}
      data-fill={fill ? "" : undefined}
    >
      <div data-bt-part="frame">
        {hasContent(header) ? <div data-bt-part="header">{header}</div> : null}
        <div data-bt-part="body" data-aside={withAside ? "" : undefined}>
          <div data-bt-part="main">{children}</div>
          {withAside ? (
            <aside aria-label={asideLabel} data-bt-part="aside">
              {aside}
            </aside>
          ) : null}
        </div>
      </div>
    </main>
  );
}

/** Props for `AppPage.Section`. */
export interface AppPageSectionProps extends Omit<
  ComponentPropsWithRef<"section">,
  "title"
> {
  /** The section's heading, an `h2` in `title-md`, which names it. */
  readonly title?: string | undefined;
  /** Actions at the end of the heading's row, such as a small "See all" button. */
  readonly actions?: ReactNode;
}

/** One block of a page, 32px from the next: an optional `title-md` heading with actions at its end, then its content 16px under it. */
export function AppPageSection({
  title,
  actions,
  className,
  children,
  ...rest
}: AppPageSectionProps): ReactElement {
  const titleId = useId();
  const titled = title !== undefined;
  return (
    <section
      aria-labelledby={titled ? titleId : undefined}
      {...rest}
      className={cx("bt-app-page-section", className)}
      data-bt-part="section"
    >
      {titled || hasContent(actions) ? (
        <div data-bt-part="section-head">
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
          {hasContent(actions) ? (
            <div data-bt-part="section-actions">{actions}</div>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/** `AppPage` with its `Section` part. */
export interface AppPageComponent {
  (props: AppPageProps): ReactElement;
  /** One block of the page. */
  readonly Section: typeof AppPageSection;
}

/**
 * A dashboard page in an `AppShell layout="sidebar"`: its `main` landmark, `contained` (at most 1280px wide
 * with its padding, centered in the column) or `full`, padded 16, 24 or 32 by the column's width. The
 * header comes first and the page's sections 24px under it, 32px apart; a right rail sits beside them,
 * 320px wide and 32px away, from 1280px of shell, and under them below that. With `fill`, the last block
 * takes the rest of the height so a table scrolls inside it. Its end padding leaves room for floating lanes.
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
