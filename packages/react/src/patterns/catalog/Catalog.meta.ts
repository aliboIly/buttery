import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Catalog",
  kind: "pattern",
  purpose:
    "Parts for any catalog: a root that searches, filters, sorts and pages its items, a toolbar, cards in a grid, a list or rows, and empty and no-results states.",
  useWhen: [
    "Things someone browses and picks from: a shop's products, a gallery of templates, an app's add-ons",
    "A collection that reads well as cards or as rows, with a view toggle between them",
    "Cards that link to each item's page or open into their details in place",
  ],
  avoidWhen: [
    "Records someone works through and acts on, such as orders: use DataTable with a FilterBar",
    "A whole page of categories and featured items beside a filter column: use CatalogPage, which is built from these cards",
    "A handful of feature cards in a marketing page: use Bento",
  ],
  related: [
    "CatalogPage",
    "ViewToggle",
    "SearchField",
    "EmptyState",
    "ExpandableCard",
    "DataTable",
  ],
  a11y: "The toolbar is a group named by its label (\"Filters\"); its search, filters, sort and view toggle are named controls, and the count is a polite live region that says how many items match as they change. Each card is an article named by its title, an h3: a link to the item's page with href, or a button that opens its detail with detail, while a press anywhere else on the card does the same for the pointer. An open card is a modal dialog named by the title, focus inside it and back on the title's button when it closes. Clearing a search that matched nothing moves focus to the toolbar's first control, and Show more to the first item it showed.",
  motion: "morph",
  keyboard: [
    {
      keys: "Tab",
      does: "Moves through the toolbar's controls, then each card's title and actions",
    },
    {
      keys: "Enter",
      does: "Follows a card's link, or opens its detail from its title",
    },
    { keys: "Space", does: "Opens a card's detail from its title" },
    { keys: "Escape", does: "Closes an open card, back into the card" },
  ],
  layout:
    "The root stacks its toolbar, items and states 24 apart. The toolbar puts the search and filters at its start and the count, sort and view at its end, which drops under the filters when they don't fit; under 640px of its own width the search and filters stack at its full width. The grid shows equal columns 16 apart, as many as fit up to columns, each at least 176, 216 or 264px wide for sm, md or lg cards; a list stacks cards 12 apart; rows sit in one list with a hairline between. A card's media keeps its ratio (4:3 at the top, 3:4 behind) or is a 40, 48 or 64px tile at the start; from 560px of card, a card with its media at the start puts its price and actions at the end of its row. Titles and descriptions wrap, a title link or button is at least 24px tall, and a description stops at 60ch.",
  reducedMotion:
    "An open card's dialog fades in and out in place in 100ms instead of growing out of the card, and cards don't lift on hover.",
};
