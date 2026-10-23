import type { ReactElement, ReactNode } from "react";
import {
  Center,
  Grid,
  Icon,
  Inline,
  Stack,
  Surface,
  Text,
} from "@buttery/core";
import { Bento, Section, Stat, StatStrip } from "@buttery/react";
import { BagArt, backdrop, swatch } from "./BagArt.tsx";
import type { Backdrop } from "./BagArt.tsx";
import { ROAST_DAY, coffeeOf } from "./data.ts";
import type { CoffeeId } from "./data.ts";

/** A picture rising from the bottom of a bento card, inset from its sides, on a backdrop from the palettes. */
function Picture({
  tint,
  children,
}: {
  /** The palette gradients behind it, in each theme. */
  readonly tint: Backdrop;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <div className="shop-picture">
      <Center
        className="shop-picture-panel shop-backdrop"
        style={backdrop(tint)}
      >
        {children}
      </Center>
    </div>
  );
}

const ROAST_PLAN: readonly {
  readonly time: string;
  readonly coffee: CoffeeId;
  readonly batch: string;
}[] = [
  { time: "7:00", coffee: "guji", batch: "12 kg" },
  { time: "8:10", coffee: "house", batch: "12 kg" },
  { time: "9:20", coffee: "huila", batch: "10 kg" },
];

const HARVESTS: readonly {
  readonly coffee: CoffeeId;
  readonly harvest: string;
}[] = [
  { coffee: "huila", harvest: "7th harvest" },
  { coffee: "guji", harvest: "5th harvest" },
  { coffee: "cerrado", harvest: "4th harvest" },
];

function Dot({ coffee }: { readonly coffee: CoffeeId }): ReactElement {
  return (
    <span
      className="shop-dot"
      style={{ backgroundColor: swatch(coffeeOf(coffee).label) }}
      aria-hidden="true"
    />
  );
}

/** How the roastery works, in a bento: the roast days, the growers, the roast date and an order's day; then its numbers. */
export function Story(): ReactElement {
  return (
    <>
      <Section
        id="story"
        title="How we roast"
        body="One twelve-kilo roaster in an old machine shop on SE Water Avenue. We roast what's been ordered, so nothing waits on a shelf."
      >
        <Bento>
          <Bento.Card title="Roasted on weekdays" span={8}>
            <Picture tint={{ light: "cream", dark: "espresso" }}>
              <Surface level="card" pad={4} className="shop-roast-plan">
                <Stack gap={3}>
                  <Inline gap={3} justify="between">
                    <Text variant="label">Thursday's roast</Text>
                    <Text variant="caption" tone="secondary">
                      3 batches
                    </Text>
                  </Inline>
                  <Stack gap={2} asChild>
                    <ul role="list">
                      {ROAST_PLAN.map((batch) => (
                        <li key={batch.time} className="shop-roast-row">
                          <Text variant="label" tabular tone="secondary">
                            {batch.time}
                          </Text>
                          <Inline gap={2}>
                            <Dot coffee={batch.coffee} />
                            <Text variant="label">
                              {coffeeOf(batch.coffee).name}
                            </Text>
                          </Inline>
                          <Text variant="label" tabular tone="secondary">
                            {batch.batch}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  </Stack>
                </Stack>
              </Surface>
            </Picture>
          </Bento.Card>
          <Bento.Card title="Growers we go back to" span={4}>
            <Picture tint={{ light: "mint", dark: "forest" }}>
              <Stack gap={2} className="shop-harvests">
                {HARVESTS.map((farm) => {
                  const coffee = coffeeOf(farm.coffee);
                  return (
                    <Surface key={farm.coffee} level="card" padX={4} padY={2}>
                      <div className="shop-harvest">
                        <Dot coffee={farm.coffee} />
                        <Stack gap={1}>
                          <Text variant="label" truncate>
                            {coffee.grower}
                          </Text>
                          <Text variant="caption" tone="secondary" truncate>
                            {`${coffee.name}, ${coffee.origin}`}
                          </Text>
                        </Stack>
                        <Text variant="caption" tone="secondary">
                          {farm.harvest}
                        </Text>
                      </div>
                    </Surface>
                  );
                })}
              </Stack>
            </Picture>
          </Bento.Card>
          <Bento.Card title="Every bag is dated" span={4}>
            <Picture tint={{ light: "peach", dark: "rust" }}>
              <Inline gap={4}>
                <BagArt label="apricot" className="shop-story-bag" />
                <Surface level="card" padX={4} padY={3}>
                  <Stack gap={2}>
                    <Text variant="caption" tone="secondary">
                      Roasted on
                    </Text>
                    <Text variant="title-md" tabular>
                      Oct 20
                    </Text>
                  </Stack>
                </Surface>
              </Inline>
            </Picture>
          </Bento.Card>
          <Bento.Card title="Out the door by four" span={8}>
            <Picture tint={{ light: "mist", dark: "navy" }}>
              <Grid columns={{ base: 2, md: 4 }} gap={3} className="shop-day">
                {ROAST_DAY.map((moment) => (
                  <Surface key={moment.step} level="card" pad={3}>
                    <Stack gap={2}>
                      <Icon icon={moment.icon} />
                      <Stack gap={1}>
                        <Text variant="label">{moment.step}</Text>
                        <Text variant="caption" tone="secondary" tabular>
                          {moment.time}
                        </Text>
                      </Stack>
                    </Stack>
                  </Surface>
                ))}
              </Grid>
            </Picture>
          </Bento.Card>
        </Bento>
      </Section>
      <Section
        id="numbers"
        size="sm"
        tone="muted"
        aria-label="Halfmoon in numbers"
      >
        <StatStrip>
          <Stat value={1850} label="bags of coffee sent last month" />
          <Stat value={5} label="countries we buy from" />
          <Stat
            value={8}
            suffix=" hours"
            label="from the roaster to the post office"
          />
          <Stat value={12} suffix=" kg" label="in our biggest batch" />
        </StatStrip>
      </Section>
    </>
  );
}
