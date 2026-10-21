import { Morph, Skeleton, Text, cx } from "@buttery/core";
import type { TextStackTitleElement } from "@buttery/core";
import { ArrowDown, ArrowUp, ArrowUpRight } from "lucide-react";
import { VisuallyHidden } from "radix-ui";
import { useId } from "react";
import type { ComponentPropsWithRef, MouseEvent, ReactElement } from "react";
import { ArrowLink } from "../../components/arrow-link/ArrowLink.tsx";
import type { ChartSeries } from "../../components/chart-frame/ChartFrame.tsx";
import { IconButton } from "../../components/icon-button/IconButton.tsx";
import { InfoButton } from "../../components/info-button/InfoButton.tsx";
import { LineChart } from "../../components/line-chart/LineChart.tsx";
import { StatusBadge } from "../../components/status-badge/StatusBadge.tsx";

/** Props for `MetricCard`. */
export interface MetricCardProps extends Omit<
  ComponentPropsWithRef<"div">,
  "title"
> {
  /** What it measures, such as "Sales". It names the card and its chart. */
  readonly title: string;
  /** The title's element. Defaults to `"h3"`, under an `AppPage.Section`'s `h2`. */
  readonly titleAs?: TextStackTitleElement | undefined;
  /** What the metric means, behind an `InfoButton` after the title: a tooltip on hover and focus, a popover on a press or a tap. */
  readonly info?: string | undefined;
  /** The value, written out, such as "$12,480.00". Leave it out while loading. */
  readonly value?: string | undefined;
  /** The change against the previous period as a fraction: `0.124` for +12.4%. */
  readonly delta?: number | undefined;
  /** What the change is measured against. Defaults to `"vs previous period"`. */
  readonly deltaLabel?: string | undefined;
  /**
   * Whether the card compares with an earlier period, so its change line keeps its place while loading
   * and shows "—" when there's no change to work out. Defaults to whether `series` has a comparison series.
   */
  readonly compared?: boolean | undefined;
  /** Shows a fall as good news (`success`) and a rise as bad. Defaults to `false`. */
  readonly lowerIsBetter?: boolean | undefined;
  /** The chart's labels, such as the period's days. With `series`, the card shows a small `LineChart`. */
  readonly labels?: readonly string[] | undefined;
  /** The chart's series: the period, and the previous period with `comparison: true`. */
  readonly series?: readonly ChartSeries[] | undefined;
  /** Writes a value in the chart's tooltip. Defaults to the number. */
  readonly formatValue?: ((value: number) => string) | undefined;
  /** Writes a gridline's value in the chart. Defaults to a short form, such as 1.2K. */
  readonly formatTick?: ((value: number) => string) | undefined;
  /** When the numbers were last updated, such as "Updated 4 min ago". */
  readonly updated?: string | undefined;
  /** The metric's details page: the footer's link and the expand button go there. */
  readonly href?: string | undefined;
  /** What the footer's link says. Defaults to `"Details"`. */
  readonly detailsLabel?: string | undefined;
  /** Runs as either link is followed, where a router can take over. */
  readonly onNavigate?:
    ((href: string, event: MouseEvent<HTMLAnchorElement>) => void) | undefined;
  /** Shows the card's skeleton: the same parts in the same places, and the chart's loading pill. */
  readonly loading?: boolean | undefined;
}

const signedPercent = new Intl.NumberFormat(undefined, {
  style: "percent",
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

/**
 * One metric on a card (r12, padded 16): its title with an info button and an expand link, the value in
 * `title-lg` with its change against the previous period as a badge, a small `LineChart` of the period
 * over the one before, and a footer with when it was updated and a link to its details. While loading,
 * each part is a skeleton in its own place, so nothing moves when the numbers arrive.
 *
 * @example
 * <MetricCard
 *   title="Sales"
 *   info="Every sale, before refunds and fees."
 *   value="$12,480.00"
 *   delta={0.124}
 *   labels={days}
 *   series={[thisPeriod, { ...lastPeriod, comparison: true }]}
 *   updated="Updated 4 min ago"
 *   href="/reports/sales"
 * />
 */
export function MetricCard({
  title,
  titleAs: Title = "h3",
  info,
  value,
  delta,
  deltaLabel = "vs previous period",
  compared,
  lowerIsBetter = false,
  labels,
  series,
  formatValue,
  formatTick,
  updated,
  href,
  detailsLabel = "Details",
  onNavigate,
  loading = false,
  className,
  ...rest
}: MetricCardProps): ReactElement {
  const titleId = useId();
  const follow = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (href !== undefined) onNavigate?.(href, event);
  };
  const trend =
    delta === undefined
      ? undefined
      : Math.abs(delta) < 0.0005
        ? "flat"
        : delta > 0
          ? "rise"
          : "fall";
  const good = trend === "rise" ? !lowerIsBetter : lowerIsBetter;
  const change =
    delta === undefined
      ? undefined
      : `${signedPercent.format(delta)} ${deltaLabel}`;
  const phase = loading ? "loading" : "ready";
  const showsChange =
    delta !== undefined ||
    (compared ?? series?.some((entry) => entry.comparison === true) ?? false);
  return (
    <div
      role="group"
      aria-labelledby={titleId}
      aria-busy={loading ? true : undefined}
      {...rest}
      className={cx("bt-metric-card", className)}
      data-bt="MetricCard"
    >
      <div data-bt-part="head">
        <div data-bt-part="title-row">
          <div data-bt-part="title">
            <Text id={titleId} tone="secondary" truncate asChild>
              <Title title={title}>{title}</Title>
            </Text>
            {info === undefined ? null : <InfoButton info={info} />}
          </div>
          {href === undefined ? null : (
            <IconButton
              asChild
              icon={ArrowUpRight}
              label={`${detailsLabel}: ${title}`}
              size="sm"
            >
              <a
                href={href}
                onClick={follow}
                aria-label={`${detailsLabel}: ${title}`}
                tabIndex={-1}
                aria-hidden="true"
              />
            </IconButton>
          )}
        </div>
        <Morph contentKey={phase}>
          {loading ? (
            <Skeleton variant="title-lg" text={value ?? "$00,000.00"} />
          ) : (
            <Text variant="title-lg" tabular>
              {value ?? "—"}
            </Text>
          )}
        </Morph>
        {showsChange ? (
          <Morph contentKey={phase}>
            {loading ? (
              <Skeleton data-bt-part="delta-skeleton" />
            ) : (
              <div data-bt-part="delta">
                <StatusBadge
                  tone={
                    trend === undefined || trend === "flat"
                      ? "neutral"
                      : good
                        ? "success"
                        : "danger"
                  }
                  icon={
                    trend === "rise"
                      ? ArrowUp
                      : trend === "fall"
                        ? ArrowDown
                        : undefined
                  }
                >
                  {delta === undefined ? (
                    <>
                      <span aria-hidden="true">—</span>
                      <VisuallyHidden.Root>
                        No change to show
                      </VisuallyHidden.Root>
                    </>
                  ) : (
                    signedPercent.format(delta)
                  )}
                </StatusBadge>
                <Text variant="caption">{deltaLabel}</Text>
              </div>
            )}
          </Morph>
        ) : null}
      </div>
      {labels === undefined || series === undefined ? null : (
        <LineChart
          label={title}
          summary={change}
          labels={labels}
          series={series}
          size="sm"
          formatValue={formatValue}
          formatTick={formatTick}
          lowerIsBetter={lowerIsBetter}
          loading={loading}
        />
      )}
      {updated === undefined && href === undefined ? null : (
        <div data-bt-part="foot">
          {updated === undefined ? null : (
            <Morph contentKey={phase}>
              {loading ? (
                <Skeleton variant="caption" text={updated} />
              ) : (
                <Text variant="caption">{updated}</Text>
              )}
            </Morph>
          )}
          {href === undefined ? null : (
            <ArrowLink href={href} onClick={follow}>
              {detailsLabel}
              <VisuallyHidden.Root> for {title}</VisuallyHidden.Root>
            </ArrowLink>
          )}
        </div>
      )}
    </div>
  );
}
