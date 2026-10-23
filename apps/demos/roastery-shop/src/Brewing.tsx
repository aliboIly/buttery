import { use, useState } from "react";
import type { ReactElement } from "react";
import { Grid, Stack, Surface, Text } from "@butteryui/core";
import {
  ArrowLink,
  Field,
  Section,
  SegmentedControl,
  Tabs,
} from "@butteryui/react";
import { GUIDES, coffeeOf, isGuideId } from "./data.ts";
import type { Guide, GuideId } from "./data.ts";
import { ShopContext } from "./shop-context.ts";

const CUPS = ["1", "2", "3", "4"] as const;

type Cups = (typeof CUPS)[number];

function isCups(value: string): value is Cups {
  return CUPS.some((cups) => cups === value);
}

function Recipe({ guide }: { readonly guide: Guide }): ReactElement {
  const [cups, setCups] = useState<Cups>("1");
  const { showCoffee } = use(ShopContext);
  const pairing = coffeeOf(guide.pairing);
  const times = Number(cups);
  return (
    <Grid columns={{ base: 1, lg: 2 }} gap={8}>
      <Surface level="card" pad={6}>
        <Stack gap={6}>
          <Field label="How many cups">
            {(control) => (
              <SegmentedControl
                {...control}
                layout="fill"
                label="How many cups"
                options={CUPS.map((value) => ({
                  value,
                  label: value === "1" ? "1 cup" : `${value} cups`,
                }))}
                value={cups}
                onValueChange={(next) => {
                  if (isCups(next)) setCups(next);
                }}
              />
            )}
          </Field>
          <dl className="shop-recipe">
            <div className="shop-recipe-amount">
              <Text variant="caption" tone="secondary" asChild>
                <dt>Coffee</dt>
              </Text>
              <Text variant="title-lg" tabular asChild>
                <dd>{`${String(guide.coffee * times)} g`}</dd>
              </Text>
            </div>
            <div className="shop-recipe-amount">
              <Text variant="caption" tone="secondary" asChild>
                <dt>Water</dt>
              </Text>
              <Text variant="title-lg" tabular asChild>
                <dd>{`${String(guide.water * times)} g`}</dd>
              </Text>
            </div>
            <div className="shop-recipe-detail">
              <Text variant="caption" tone="secondary" asChild>
                <dt>Grind</dt>
              </Text>
              <Text variant="body-sm" asChild>
                <dd>{guide.grind}</dd>
              </Text>
            </div>
            <div className="shop-recipe-detail">
              <Text variant="caption" tone="secondary" asChild>
                <dt>Time</dt>
              </Text>
              <Text variant="body-sm" asChild>
                <dd>{guide.time[CUPS.indexOf(cups)]}</dd>
              </Text>
            </div>
          </dl>
          <ArrowLink
            href="#coffees"
            onClick={(event) => {
              event.preventDefault();
              showCoffee(pairing.id);
            }}
          >
            {`Brew it with ${pairing.name}`}
          </ArrowLink>
        </Stack>
      </Surface>
      <ol role="list" className="shop-steps">
        {guide.steps.map((step, index) => (
          <li key={step} className="shop-step">
            <Text variant="label" tone="secondary" tabular>
              {String(index + 1)}
            </Text>
            <Text variant="body">{step}</Text>
          </li>
        ))}
      </ol>
    </Grid>
  );
}

/** Brew guides as tabs: each a recipe that scales with the number of cups, its steps and the coffee to try. */
export function Brewing({
  guide,
  onGuideChange,
}: {
  readonly guide: GuideId;
  readonly onGuideChange: (guide: GuideId) => void;
}): ReactElement {
  return (
    <Section
      id="brewing"
      title="Brew guides"
      body="The recipes we use at the roastery. Choose how many cups you're making and the amounts follow."
    >
      <Tabs
        value={guide}
        onValueChange={(next) => {
          if (isGuideId(next)) onGuideChange(next);
        }}
      >
        <Stack gap={8}>
          <Tabs.List label="Ways to brew">
            {GUIDES.map((option) => (
              <Tabs.Tab key={option.id} value={option.id}>
                {option.name}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          {GUIDES.map((option) => (
            <Tabs.Panel key={option.id} value={option.id}>
              <Recipe guide={option} />
            </Tabs.Panel>
          ))}
        </Stack>
      </Tabs>
    </Section>
  );
}
