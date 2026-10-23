import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Inline, Stack, Stagger, Surface, Text } from "@butteryui/core";
import {
  Button,
  Field,
  SegmentedControl,
  Select,
  StatusBadge,
} from "@butteryui/react";
import { Sparkles } from "lucide-react";
import { useAddToBag } from "./add-to-bag.ts";
import { Shelf } from "./BagArt.tsx";
import { GRINDS, SIZES, THIS_WEEK, coffeeOf, notesOf } from "./data.ts";
import type { GrindId, SizeId } from "./data.ts";
import { money } from "./format.ts";
import { bagPrice } from "./pricing.ts";

/** This week's coffee as the hero's picture: its bag, its notes and its own size and grind, ready to add. */
export function ThisWeek(): ReactElement {
  const coffee = coffeeOf(THIS_WEEK);
  const [size, setSize] = useState<SizeId>("12oz");
  const [grind, setGrind] = useState<GrindId>("whole");
  const { addCoffee } = useAddToBag();
  return (
    <Stagger.Item>
      <Surface level="card" className="shop-feature">
        <Shelf label={coffee.label} className="shop-feature-shelf" />
        <Stack gap={5} pad={6}>
          <Stack gap={3}>
            <Inline gap={2} justify="between">
              <StatusBadge tone="success" icon={Sparkles}>
                {`This week · ${coffee.flag ?? "Fresh"}`}
              </StatusBadge>
              <Text variant="caption" tone="secondary">
                Next roast Thursday
              </Text>
            </Inline>
            <Inline gap={4} justify="between" align="baseline">
              <Text variant="title-md">{`${coffee.name}, ${coffee.origin}`}</Text>
              <Text variant="title-md" tabular className="shop-price">
                {money(bagPrice(coffee.id, size))}
              </Text>
            </Inline>
            <Text variant="body-sm" tone="secondary">
              {`${notesOf(coffee)}. ${coffee.process}, ${coffee.roast.toLowerCase()} roast.`}
            </Text>
          </Stack>
          <Grid columns={{ base: 1, md: 2 }} gap={4}>
            <Field label="Size">
              {(control) => (
                <SegmentedControl<SizeId>
                  {...control}
                  layout="fill"
                  label="Size"
                  options={SIZES.map((option) => ({
                    value: option.id,
                    label: option.label,
                  }))}
                  value={size}
                  onValueChange={setSize}
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
                  onValueChange={setGrind}
                />
              )}
            </Field>
          </Grid>
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
      </Surface>
    </Stagger.Item>
  );
}
