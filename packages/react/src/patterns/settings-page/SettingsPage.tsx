import { cx } from "@buttery/core";
import type { ReactElement, ReactNode } from "react";
import { AppPage } from "../app-page/AppPage.tsx";
import type { AppPageProps } from "../app-page/AppPage.tsx";
import { PageHeader } from "../page-header/PageHeader.tsx";

/** Props for `SettingsPage`. */
export interface SettingsPageProps extends Omit<
  AppPageProps,
  "header" | "width" | "title"
> {
  /** The page's title, its `h1`. */
  readonly title: string;
  /** The trail of pages above it, a `Breadcrumbs`, such as Settings for a page under it. */
  readonly breadcrumbs?: ReactNode;
  /** A `ScopeBadge` after the title, saying what the page's settings apply to. */
  readonly badge?: ReactNode;
  /** One line under the title saying what the page is for. */
  readonly description?: ReactNode;
  /** The page's actions at the end of the title's row: `PageHeader.Action`s. */
  readonly actions?: ReactNode;
  /** `"medium"` (960px, the default) or `"narrow"` (820px), for a dense form or a preferences matrix. */
  readonly width?: "medium" | "narrow" | undefined;
}

/**
 * A settings detail page in the page grammar: an `AppPage` 960px wide (820 with `width="narrow"`) whose
 * `PageHeader` holds the breadcrumbs, the title with an optional `ScopeBadge`, one line about the page and
 * its actions, then its `SettingsSection`s 32 apart, and an optional footer under a hairline.
 *
 * @example
 * <SettingsPage
 *   title="Pickup"
 *   breadcrumbs={<Breadcrumbs items={[{ label: "Settings", href: "/settings" }]} />}
 *   description="When and where customers collect their orders."
 * >
 *   <SettingsSection title="Hours">…</SettingsSection>
 * </SettingsPage>
 */
export function SettingsPage({
  title,
  breadcrumbs,
  badge,
  description,
  actions,
  width = "medium",
  className,
  children,
  ...rest
}: SettingsPageProps): ReactElement {
  return (
    <AppPage
      data-bt="SettingsPage"
      {...rest}
      width={width}
      className={cx("bt-settings-page", className)}
      header={
        <PageHeader
          title={title}
          breadcrumbs={breadcrumbs}
          badge={badge}
          description={description}
          actions={actions}
        />
      }
    >
      {children}
    </AppPage>
  );
}
