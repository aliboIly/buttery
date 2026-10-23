import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import {
  Bento,
  Button,
  EmptyState,
  ExpandableCard,
  Field,
  Section,
  SegmentedControl,
  Select,
  StatusBadge,
  TagChip,
} from "@buttery/react";
import { Coffee as CoffeeIcon, Plus } from "lucide-react";
import { useAddToBag } from "./add-to-bag.ts";
import { Shelf } from "./BagArt.tsx";
import { COFFEES, GRINDS, ORIGINS, ROASTS, SIZES, notesOf } from "./data.ts";
import type { Coffee, CoffeeId, GrindId, Roast, SizeId } from "./data.ts";
import { dollars, money } from "./format.ts";
import { bagPrice, sizePrices } from "./pricing.ts";

/** The roast the coffees are filtered to, or every roast. */
export type RoastFilter = Roast | "all";

/** The origin the coffees are filtered to, or every origin. */
export type OriginFilter = string;

const ALL_ORIGINS = "all";

const ROAST_OPTIONS: readonly { value: RoastFilter; label: string }[] = [
  { value: "all", label: "All" },
  ...ROASTS.map((roast) => ({ value: roast, label: roast })),
];

const ORIGIN_OPTIONS = [
  { value: ALL_ORIGINS, label: "All origins" },
  ...ORIGINS.map((origin) => ({ value: origin, label: origin })),
];

function CoffeeDetail({
  coffee,
  size,
  grind,
  onSizeChange,
  onGrindChange,
}: {
  readonly coffee: Coffee;
  readonly size: SizeId;
  readonly grind: GrindId;
  readonly onSizeChange: (size: SizeId) => void;
  readonly onGrindChange: (grind: GrindId) => void;
}): ReactElement {
  const { addCoffee } = useAddToBag();
  const facts = [
    ["Grown by", coffee.grower],
    ["Region", coffee.region],
    ["Process", coffee.process],
    ["Altitude", coffee.altitude],
    ["Varieties", coffee.varieties],
  ] as const;
  return (
    <div className="shop-detail">
      <Shelf label={coffee.label} className="shop-detail-shelf" />
      <Stack gap={6} className="shop-detail-buy">
        <Stack gap={3}>
          <Inline gap={2}>
            <TagChip>{`${coffee.roast} roast`}</TagChip>
            <TagChip>{coffee.origin}</TagChip>
          </Inline>
          <Text variant="title-md">{notesOf(coffee)}</Text>
          <Text variant="body" tone="secondary">
            {coffee.story}
          </Text>
        </Stack>
        <Stack gap={4}>
          <Field label="Size" hint={sizePrices(coffee.id)}>
            {(control) => (
              <SegmentedControl<SizeId>
                {...control}
                label="Size"
                options={SIZES.map((option) => ({
                  value: option.id,
                  label: option.label,
                }))}
                value={size}
                onValueChange={onSizeChange}
              />
            )}
          </Field>
          <Field label="Grind">
            {(control) => (
              <Select<GrindId>
                {...control}
                label="Grind"
                variant="outline"
                options={GRINDS}
                value={grind}
                onValueChange={onGrindChange}
              />
            )}
          </Field>
        </Stack>
        <Button
          variant="primary"
          size="cta"
          shape="rounded"
          onClick={() => {
            addCoffee({ coffee: coffee.id, size, grind });
          }}
        >
          {`Add to bag · ${money(bagPrice(coffee.id, size))}`}
        </Button>
      </Stack>
      <dl className="shop-facts">
        {facts.map(([term, value]) => (
          <div key={term} className="shop-fact">
            <Text variant="caption" tone="secondary" asChild>
              <dt>{term}</dt>
            </Text>
            <Text variant="body-sm" asChild>
              <dd>{value}</dd>
            </Text>
          </div>
        ))}
      </dl>
    </div>
  );
}

function CoffeeCard({
  coffee,
  open,
  onOpenChange,
}: {
  readonly coffee: Coffee;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}): ReactElement {
  const [size, setSize] = useState<SizeId>("12oz");
  const [grind, setGrind] = useState<GrindId>("whole");
  const { addCoffee } = useAddToBag();
  return (
    <ExpandableCard
      title={coffee.name}
      span={4}
      open={open}
      onOpenChange={onOpenChange}
      detail={
        <CoffeeDetail
          coffee={coffee}
          size={size}
          grind={grind}
          onSizeChange={setSize}
          onGrindChange={setGrind}
        />
      }
    >
      <div className="shop-card-visual">
        <Stack gap={3} padX={6}>
          <Inline gap={3} justify="between">
            <Text variant="body-sm" tone="secondary" truncate>
              {`${coffee.origin} · ${coffee.process} · ${coffee.roast} roast`}
            </Text>
            {coffee.flag === undefined ? null : (
              <StatusBadge tone={coffee.id === "nyeri" ? "warning" : "success"}>
                {coffee.flag}
              </StatusBadge>
            )}
          </Inline>
          <Text variant="label" truncate>
            {notesOf(coffee)}
          </Text>
          <Inline gap={3} justify="between">
            <Text variant="label" tabular tone="secondary">
              {`From ${dollars(bagPrice(coffee.id, "12oz"))}`}
            </Text>
            <Button
              size="sm"
              iconStart={Plus}
              aria-label={`Add to bag: ${coffee.name}, 12 oz, whole bean`}
              onClick={(event) => {
                event.preventDefault();
                addCoffee({ coffee: coffee.id, size: "12oz", grind: "whole" });
              }}
            >
              Add to bag
            </Button>
          </Inline>
        </Stack>
        <div className="shop-card-shelf-frame">
          <Shelf label={coffee.label} className="shop-card-shelf" />
        </div>
      </div>
    </ExpandableCard>
  );
}

/** The coffees, filtered by roast and origin, each opening into its details with a size, a grind and Add to bag. */
export function Coffees({
  roast,
  origin,
  onRoastChange,
  onOriginChange,
  open,
  onOpenChange,
}: {
  readonly roast: RoastFilter;
  readonly origin: OriginFilter;
  readonly onRoastChange: (roast: RoastFilter) => void;
  readonly onOriginChange: (origin: OriginFilter) => void;
  /** The coffee whose card is open, if one is. */
  readonly open: CoffeeId | null;
  readonly onOpenChange: (open: CoffeeId | null) => void;
}): ReactElement {
  const shown = COFFEES.filter(
    (coffee) =>
      (roast === "all" || coffee.roast === roast) &&
      (origin === ALL_ORIGINS || coffee.origin === origin),
  );
  return (
    <Section
      id="coffees"
      title="The coffees"
      body="Every one roasted to order. The light roasts are bright and fruity; the medium and dark ones lean toward chocolate and nuts."
    >
      <Stack gap={6}>
        <div className="shop-filters">
          <div className="shop-filter-controls">
            <SegmentedControl<RoastFilter>
              label="Roast"
              options={ROAST_OPTIONS}
              value={roast}
              onValueChange={onRoastChange}
            />
            <div className="shop-filter-origin">
              <Select
                label="Origin"
                variant="outline"
                options={ORIGIN_OPTIONS}
                value={origin}
                onValueChange={onOriginChange}
              />
            </div>
          </div>
          <Text variant="label" tone="secondary" tabular aria-live="polite">
            {shown.length === 1
              ? "1 coffee"
              : `${String(shown.length)} coffees`}
          </Text>
        </div>
        {shown.length === 0 ? (
          <EmptyState
            icon={CoffeeIcon}
            title="No coffee matches both"
            description="Try another roast or origin, or see them all."
            actions={
              <Button
                variant="primary"
                onClick={() => {
                  onRoastChange("all");
                  onOriginChange(ALL_ORIGINS);
                }}
              >
                Show all six coffees
              </Button>
            }
          />
        ) : (
          <Bento>
            {shown.map((coffee) => (
              <CoffeeCard
                key={coffee.id}
                coffee={coffee}
                open={open === coffee.id}
                onOpenChange={(next) => {
                  onOpenChange(next ? coffee.id : null);
                }}
              />
            ))}
          </Bento>
        )}
      </Stack>
    </Section>
  );
}
