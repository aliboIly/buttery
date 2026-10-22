import { BookOpen, DoorOpen, Leaf, Wheat } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** How dark a coffee is roasted. */
export type Roast = "Light" | "Medium" | "Dark";

/** The coffees the roastery sells, by the ids the roastery's own dashboard uses. */
export type CoffeeId =
  "guji" | "nyeri" | "huila" | "huehue" | "cerrado" | "house";

export interface Coffee {
  readonly id: CoffeeId;
  readonly name: string;
  /** The country it grows in, or "Blend". */
  readonly origin: string;
  readonly region: string;
  readonly process: string;
  readonly roast: Roast;
  /** What a 12 oz bag costs, in whole dollars. */
  readonly price: number;
  readonly notes: readonly [string, string, string];
  /** Who grows it, as a list names them. */
  readonly grower: string;
  readonly altitude: string;
  readonly varieties: string;
  readonly story: string;
  /** The `@buttery/core/palettes` gradient its label is printed in. */
  readonly label: string;
  /** A note on the bag, such as a harvest that just landed. */
  readonly flag?: string;
}

export const COFFEES: readonly Coffee[] = [
  {
    id: "guji",
    name: "Guji",
    origin: "Ethiopia",
    region: "Guji zone, southern Ethiopia",
    process: "Washed",
    roast: "Light",
    price: 19,
    notes: ["Peach", "Jasmine", "Bergamot"],
    grower: "Guji smallholders",
    altitude: "1,950–2,200 m",
    varieties: "Local landraces",
    story:
      "Cherries from about 800 smallholders, washed and dried on raised beds at one station. This is our fifth harvest from them, and it reached Portland on October 3.",
    label: "apricot",
    flag: "New harvest",
  },
  {
    id: "nyeri",
    name: "Nyeri",
    origin: "Kenya",
    region: "The slopes of Mount Kenya",
    process: "Washed",
    roast: "Light",
    price: 21,
    notes: ["Blackcurrant", "Grapefruit", "Honey"],
    grower: "Nyeri cooperative",
    altitude: "1,700–1,900 m",
    varieties: "SL28, SL34, Ruiru 11",
    story:
      "A cooperative of 600 families who pick only ripe cherries and wash them twice. The brightest coffee we roast, and lovely over ice. A few weeks of this lot are left.",
    label: "violet",
    flag: "Last of the lot",
  },
  {
    id: "huila",
    name: "Huila",
    origin: "Colombia",
    region: "Hills above the Magdalena river",
    process: "Washed",
    roast: "Medium",
    price: 17,
    notes: ["Red apple", "Caramel", "Cocoa"],
    grower: "Rosales family",
    altitude: "1,600–1,800 m",
    varieties: "Caturra, Castillo",
    story:
      "The Rosales family and eleven neighbors share one wet mill, and we've bought from them for seven harvests. Sweet and round, easy to like black or with milk.",
    label: "rose",
  },
  {
    id: "huehue",
    name: "Huehuetenango",
    origin: "Guatemala",
    region: "The western highlands",
    process: "Washed",
    roast: "Medium",
    price: 18,
    notes: ["Plum", "Milk chocolate", "Almond"],
    grower: "Velásquez family",
    altitude: "1,500–1,900 m",
    varieties: "Bourbon, Catuai",
    story:
      "The Velásquez family grows it high, where dry winds off the plains let the cherries ripen slowly. A steady cup that holds up well in a drip machine.",
    label: "sea",
  },
  {
    id: "cerrado",
    name: "Cerrado",
    origin: "Brazil",
    region: "The plateau of Minas Gerais",
    process: "Natural",
    roast: "Medium",
    price: 15,
    notes: ["Hazelnut", "Dark chocolate", "Molasses"],
    grower: "Moreira estate",
    altitude: "1,000–1,200 m",
    varieties: "Yellow Catuai, Mundo Novo",
    story:
      "The Moreira estate dries it whole in the cherry on open patios for three weeks, which gives it a heavy body and low acidity. Our pick for espresso.",
    label: "honey",
  },
  {
    id: "house",
    name: "Halfmoon House",
    origin: "Blend",
    region: "Brazil and Colombia",
    process: "Natural and washed",
    roast: "Dark",
    price: 14,
    notes: ["Cocoa", "Toffee", "Toasted walnut"],
    grower: "Moreira and Rosales",
    altitude: "1,000–1,800 m",
    varieties: "Catuai, Caturra",
    story:
      "Two parts Cerrado to one part Huila, roasted a little darker. It's what we drink at the roastery every day, and it holds up best in milk.",
    label: "espresso",
  },
];

/** A coffee's tasting notes as a phrase, such as "Peach, jasmine, bergamot". */
export function notesOf(coffee: Coffee): string {
  const [first, ...rest] = coffee.notes;
  return [first, ...rest.map((note) => note.toLowerCase())].join(", ");
}

/** The coffee with `id`. */
export function coffeeOf(id: CoffeeId): Coffee {
  const coffee = COFFEES.find((candidate) => candidate.id === id);
  if (coffee === undefined) throw new Error(`No coffee ${id}`);
  return coffee;
}

/** Whether a value is one of the coffees' ids. */
export function isCoffeeId(value: unknown): value is CoffeeId {
  return COFFEES.some((coffee) => coffee.id === value);
}

/** The coffee the shop puts first this week: the harvest that just landed. */
export const THIS_WEEK: CoffeeId = "guji";

export const ROASTS: readonly Roast[] = ["Light", "Medium", "Dark"];

/** Where the coffees grow, in the order the filter lists them. */
export const ORIGINS: readonly string[] = [
  ...new Set(COFFEES.map((coffee) => coffee.origin)),
];

/** The bag sizes the shop sells. */
export type SizeId = "12oz" | "2lb" | "5lb";

export const SIZES: readonly { readonly id: SizeId; readonly label: string }[] =
  [
    { id: "12oz", label: "12 oz" },
    { id: "2lb", label: "2 lb" },
    { id: "5lb", label: "5 lb" },
  ];

export function sizeLabel(id: SizeId): string {
  return SIZES.find((size) => size.id === id)?.label ?? id;
}

export function isSizeId(value: unknown): value is SizeId {
  return SIZES.some((size) => size.id === value);
}

/** How the roastery grinds a bag: whole, or for a brewer. */
export type GrindId =
  "whole" | "espresso" | "moka" | "pour-over" | "drip" | "press" | "cold-brew";

export const GRINDS: readonly {
  readonly value: GrindId;
  readonly label: string;
  /** How a sentence says it, such as "ground for a moka pot". */
  readonly phrase: string;
}[] = [
  { value: "whole", label: "Whole bean", phrase: "whole bean" },
  { value: "espresso", label: "Espresso", phrase: "ground for espresso" },
  { value: "moka", label: "Moka pot", phrase: "ground for a moka pot" },
  { value: "pour-over", label: "Pour-over", phrase: "ground for pour-over" },
  { value: "drip", label: "Drip machine", phrase: "ground for a drip machine" },
  {
    value: "press",
    label: "French press",
    phrase: "ground for a French press",
  },
  { value: "cold-brew", label: "Cold brew", phrase: "ground for cold brew" },
];

export function grindLabel(id: GrindId): string {
  return GRINDS.find((grind) => grind.value === id)?.label ?? id;
}

export function grindPhrase(id: GrindId): string {
  return GRINDS.find((grind) => grind.value === id)?.phrase ?? id;
}

export function isGrindId(value: unknown): value is GrindId {
  return GRINDS.some((grind) => grind.value === value);
}

/** Cafés around Portland that pour the roastery's coffee, each with the mark on its sign. */
export const CAFES: readonly {
  readonly name: string;
  readonly icon: LucideIcon;
}[] = [
  { name: "Blue Door", icon: DoorOpen },
  { name: "Little Fern", icon: Leaf },
  { name: "Reading Room", icon: BookOpen },
  { name: "Juniper & Rye", icon: Wheat },
];

/** A way to brew at home, with the recipe the roastery uses for one cup. */
export interface Guide {
  readonly id: GuideId;
  readonly name: string;
  /** Grams of coffee for one cup. */
  readonly coffee: number;
  /** Grams of water for one cup. */
  readonly water: number;
  readonly grind: string;
  /** How long it takes for one, two, three and four cups. */
  readonly time: readonly [string, string, string, string];
  readonly steps: readonly string[];
  /** The coffee that suits it best. */
  readonly pairing: CoffeeId;
}

export type GuideId = "pour-over" | "press" | "moka" | "cold-brew";

export const GUIDES: readonly Guide[] = [
  {
    id: "pour-over",
    name: "Pour-over",
    coffee: 15,
    water: 250,
    grind: "Medium-fine, like table salt",
    time: ["3 to 3½ min", "3½ to 4 min", "4 to 4½ min", "4½ to 5 min"],
    steps: [
      "Rinse the filter with hot water and pour that water away.",
      "Add the coffee and pour twice its weight of water just off the boil. Wait 30 seconds while it blooms.",
      "Pour the rest in slow circles, keeping the bed about half full.",
      "Let it drain. If it runs much past the time on the left, grind a little coarser next time.",
    ],
    pairing: "guji",
  },
  {
    id: "press",
    name: "French press",
    coffee: 18,
    water: 300,
    grind: "Coarse, like sea salt",
    time: ["4 min", "4 min", "4 min", "4 min"],
    steps: [
      "Warm the press with hot water and pour it out.",
      "Add the coffee, then all the water just off the boil, and stir once.",
      "Put the lid on with the plunger up and wait four minutes.",
      "Skim the foam off the top, press down gently and pour it all out so it stops brewing.",
    ],
    pairing: "huehue",
  },
  {
    id: "moka",
    name: "Moka pot",
    coffee: 16,
    water: 160,
    grind: "Fine, a little coarser than espresso",
    time: ["4 to 5 min", "4 to 5 min", "5 to 6 min", "5 to 6 min"],
    steps: [
      "Fill the bottom chamber with hot water up to the valve.",
      "Fill the basket with coffee and level it without pressing down.",
      "Screw the pot together and set it on medium heat with the lid open.",
      "Take it off the heat as soon as the coffee turns pale and starts to sputter.",
    ],
    pairing: "house",
  },
  {
    id: "cold-brew",
    name: "Cold brew",
    coffee: 30,
    water: 250,
    grind: "Extra coarse, like cracked pepper",
    time: [
      "14 to 16 hours",
      "14 to 16 hours",
      "14 to 16 hours",
      "14 to 16 hours",
    ],
    steps: [
      "Stir the coffee into cold water in a jar until it's all wet.",
      "Cover it and leave it in the fridge overnight, 14 to 16 hours.",
      "Strain it through a paper filter.",
      "Serve it over ice, cut with as much water or milk as you like. It keeps for a week.",
    ],
    pairing: "cerrado",
  },
];

export function guideOf(id: GuideId): Guide {
  const guide = GUIDES.find((candidate) => candidate.id === id);
  if (guide === undefined) throw new Error(`No guide ${id}`);
  return guide;
}

export function isGuideId(value: unknown): value is GuideId {
  return GUIDES.some((guide) => guide.id === value);
}

/** A question customers ask, and the roastery's answer. */
export interface Question {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

export const QUESTIONS: readonly Question[] = [
  {
    id: "arrival",
    question: "When will my coffee arrive?",
    answer:
      "We roast Monday to Friday. Order by noon and your coffee is roasted the next morning and shipped that afternoon. Most orders arrive in two to four days anywhere in the US.",
  },
  {
    id: "shipping",
    question: "How much is shipping?",
    answer:
      "Standard shipping is $6, and free once your order reaches $40. Subscriptions always ship free. Next-day delivery is $14.",
  },
  {
    id: "skip",
    question: "Can I skip or pause a subscription?",
    answer:
      "Yes. Skip a delivery, change the coffee or pause from your account, up to the day before it roasts. Nothing is charged while it's paused.",
  },
  {
    id: "grind",
    question: "Should I buy whole beans or ground coffee?",
    answer:
      "Whole beans stay fresh longest. If you don't have a grinder, choose your brewer and we grind for it the morning we roast.",
  },
  {
    id: "storage",
    question: "How should I store my coffee?",
    answer:
      "Keep the bag sealed in a cupboard, away from heat and light, and skip the fridge. Coffee tastes best from about four days to four weeks after its roast date.",
  },
  {
    id: "returns",
    question: "What if I don't like a coffee?",
    answer:
      "Tell us within 30 days, however much is left in the bag, and we'll send you a different coffee or give your money back.",
  },
  {
    id: "wholesale",
    question: "Do you sell to cafés and offices?",
    answer:
      "We do, in 5 lb bags delivered weekly around Portland. Write to wholesale@halfmoon.example and we'll set up a tasting.",
  },
];
