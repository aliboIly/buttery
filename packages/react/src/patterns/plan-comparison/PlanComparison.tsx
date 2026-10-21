import {
  Icon,
  Text,
  cx,
  hasContent,
  useControllableState,
} from "@buttery/core";
import type { CssVariables } from "@buttery/core";
import { Check, Gift } from "lucide-react";
import { useId } from "react";
import type {
  ComponentPropsWithRef,
  CSSProperties,
  ReactElement,
  ReactNode,
} from "react";
import { SegmentedControl } from "../../components/segmented-control/SegmentedControl.tsx";
import type { SegmentedControlOption } from "../../components/segmented-control/SegmentedControl.tsx";
import { Select } from "../../components/select/Select.tsx";
import type { SelectOption } from "../../components/select/Select.tsx";

/** One plan in a `PlanComparison`. */
export interface PlanComparisonPlan {
  /** Identifies the plan. */
  readonly id: string;
  /** Its name, an `h3` in `title-md`, such as "Plus". */
  readonly name: string;
  /** What it's for, in a line or two. */
  readonly description: string;
  /** Its price, written out for the period and volume chosen, such as "$14". */
  readonly price: string;
  /** What the price covers, after it, such as "per month". */
  readonly period?: string | undefined;
  /** A line under the price, such as "Overages apply" with an `InfoButton`. */
  readonly priceNote?: ReactNode;
  /** A short offer on a tab above the card, such as "30 days free". */
  readonly ribbon?: string | undefined;
  /** Its one action, full width, such as a `Button variant="primary"`. */
  readonly action: ReactNode;
  /** The checklist's heading, such as "Everything in Standard, and". */
  readonly featuresTitle: string;
  /** What it includes or adds, one line each. */
  readonly features: readonly string[];
}

/** Props for `PlanComparison`. `onVolumeChange` is its volume control's, not the media event's. */
export interface PlanComparisonProps extends Omit<
  ComponentPropsWithRef<"div">,
  "onVolumeChange"
> {
  /** The plans, cheapest first, priced for the period and volume chosen. */
  readonly plans: readonly PlanComparisonPlan[];
  /** Billing periods, as a `SegmentedControl` at the start of the control group. */
  readonly periods?: readonly SegmentedControlOption<string>[] | undefined;
  /** The period chosen. Pair with `onPeriodChange` to control it. */
  readonly period?: string | undefined;
  /** The period chosen first when uncontrolled. Defaults to the first. */
  readonly defaultPeriod?: string | undefined;
  /** Called when another period is chosen. */
  readonly onPeriodChange?: ((period: string) => void) | undefined;
  /** Names the periods' control. Defaults to `"Billing period"`. */
  readonly periodLabel?: string | undefined;
  /** Volumes, as a `Select` after the periods in the same control group. */
  readonly volumes?: readonly SelectOption[] | undefined;
  /** The volume chosen. Pair with `onVolumeChange` to control it. */
  readonly volume?: string | undefined;
  /** The volume chosen first when uncontrolled. Defaults to the first. */
  readonly defaultVolume?: string | undefined;
  /** Called when another volume is chosen. */
  readonly onVolumeChange?: ((volume: string) => void) | undefined;
  /** Names the volumes' control. Defaults to `"Volume"`. */
  readonly volumeLabel?: string | undefined;
  /** Other plans under the cards: `PlanComparison.Option`s, two columns from 640px. */
  readonly more?: ReactNode;
  /** The heading over `more`. Defaults to `"Other plans"`. */
  readonly moreTitle?: string | undefined;
}

function PlanComparisonRoot({
  plans,
  periods,
  period,
  defaultPeriod,
  onPeriodChange,
  periodLabel = "Billing period",
  volumes,
  volume,
  defaultVolume,
  onVolumeChange,
  volumeLabel = "Volume",
  more,
  moreTitle = "Other plans",
  className,
  style,
  ...rest
}: PlanComparisonProps): ReactElement {
  const moreId = useId();
  const [chosenPeriod, choosePeriod] = useControllableState({
    value: period,
    defaultValue: defaultPeriod ?? periods?.[0]?.value ?? "",
    onChange: onPeriodChange,
  });
  const [chosenVolume, chooseVolume] = useControllableState({
    value: volume,
    defaultValue: defaultVolume ?? volumes?.[0]?.value ?? "",
    onChange: onVolumeChange,
  });
  const columns: CSSProperties & CssVariables = {
    ...style,
    "--bt-plan-comparison-columns": String(Math.max(1, plans.length)),
  };
  const withPeriods = periods !== undefined && periods.length > 0;
  const withVolumes = volumes !== undefined && volumes.length > 0;
  return (
    <div
      {...rest}
      className={cx("bt-plan-comparison", className)}
      data-bt="PlanComparison"
      style={columns}
    >
      {withPeriods || withVolumes ? (
        <div role="group" aria-label="Plan options" data-bt-part="controls">
          {withPeriods ? (
            <SegmentedControl
              label={periodLabel}
              options={periods}
              value={chosenPeriod}
              onValueChange={choosePeriod}
            />
          ) : null}
          {withPeriods && withVolumes ? (
            <span data-bt-part="controls-divider" aria-hidden="true" />
          ) : null}
          {withVolumes ? (
            <Select
              label={volumeLabel}
              options={volumes}
              value={chosenVolume}
              onValueChange={chooseVolume}
            />
          ) : null}
        </div>
      ) : null}
      <div data-bt-part="plans">
        {plans.map((plan) => (
          <Plan key={plan.id} plan={plan} />
        ))}
      </div>
      {hasContent(more) ? (
        <section aria-labelledby={moreId} data-bt-part="more">
          <Text id={moreId} variant="title-md" asChild>
            <h2>{moreTitle}</h2>
          </Text>
          <div data-bt-part="options">{more}</div>
        </section>
      ) : null}
    </div>
  );
}

function Plan({ plan }: { readonly plan: PlanComparisonPlan }): ReactElement {
  const nameId = useId();
  return (
    <div data-bt-part="plan">
      <div data-bt-part="ribbon-slot">
        {plan.ribbon === undefined ? null : (
          <span className="bt-text" data-role="label" data-bt-part="ribbon">
            <Icon icon={Gift} />
            {plan.ribbon}
          </span>
        )}
      </div>
      <section
        aria-labelledby={nameId}
        className="bt-surface"
        data-level="card"
        data-bt-part="card"
        data-bt-region=""
      >
        <div data-bt-part="intro">
          <Text id={nameId} variant="title-md" asChild>
            <h3>{plan.name}</h3>
          </Text>
          <Text variant="body-sm" data-bt-part="description">
            {plan.description}
          </Text>
        </div>
        <div data-bt-part="price">
          <span className="bt-text" data-role="title-lg" data-bt-part="amount">
            {plan.price}
          </span>
          {plan.period === undefined ? null : (
            <span className="bt-text" data-role="body-sm" data-bt-part="period">
              {plan.period}
            </span>
          )}
          {hasContent(plan.priceNote) ? (
            <div
              className="bt-text"
              data-role="caption"
              data-bt-part="price-note"
            >
              {plan.priceNote}
            </div>
          ) : null}
        </div>
        <div data-bt-part="action">{plan.action}</div>
        <div data-bt-part="features">
          <Text variant="title-sm" asChild>
            <h4>{plan.featuresTitle}</h4>
          </Text>
          <ul data-bt-part="feature-list">
            {plan.features.map((feature) => (
              <li key={feature} className="bt-text" data-role="body-sm">
                <Icon icon={Check} />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

/** Props for `PlanComparison.Option`. */
export interface PlanComparisonOptionProps {
  /** The plan's name, an `h3` in `title-md`. */
  readonly name: string;
  /** What it is, in `body-sm`. */
  readonly description: ReactNode;
  /** Its action, such as a small secondary `Button`. */
  readonly action?: ReactNode;
}

/** Another plan in the row under the cards: its name, what it is and an action, on a card. */
export function PlanComparisonOption({
  name,
  description,
  action,
}: PlanComparisonOptionProps): ReactElement {
  const nameId = useId();
  return (
    <section
      aria-labelledby={nameId}
      className="bt-surface"
      data-level="card"
      data-bt-part="option"
      data-bt-region=""
    >
      <Text id={nameId} variant="title-md" asChild>
        <h3>{name}</h3>
      </Text>
      <Text variant="body-sm">{description}</Text>
      {hasContent(action) ? (
        <div data-bt-part="option-action">{action}</div>
      ) : null}
    </section>
  );
}

/** `PlanComparison` with its parts. */
export interface PlanComparisonComponent {
  (props: PlanComparisonProps): ReactElement;
  /** Another plan in the row under the cards. */
  readonly Option: typeof PlanComparisonOption;
}

/**
 * Plans side by side. A billing period (`SegmentedControl`) and a volume (`Select`) sit together in one
 * outlined control group over the plan cards, which share their rows so the prices, actions and checklists
 * line up: an optional ribbon tab above each card, its name and what it's for, its price, a full-width
 * action, then a checklist under a heading such as "Everything in Standard, and". The cards sit side by
 * side from 900px of room and stack below that; other plans follow in a row of `PlanComparison.Option`s.
 * Each card is its own region, so each may hold one primary action.
 *
 * @example
 * <PlanComparison
 *   periods={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }]}
 *   plans={plans}
 *   more={<PlanComparison.Option name="Enterprise" description="Prices for large roasteries." />}
 * />
 */
export const PlanComparison: PlanComparisonComponent = Object.assign(
  PlanComparisonRoot,
  { Option: PlanComparisonOption },
);
