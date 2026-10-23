import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Faq",
  kind: "pattern",
  purpose:
    "Questions and answers in a titled section: groups to switch between, a search that filters as you type, a link to each question and a way to ask another.",
  useWhen: [
    "A store's or an app's questions and answers, as a page of their own or a section of a longer one",
    "A help center's questions in groups people switch between, with a search across all of them",
    "A few questions under a product, a plan or a form",
  ],
  avoidWhen: [
    "Guides or articles that run longer than an answer: give them pages of their own",
    "Parts of a record or a form that aren't questions, such as an account's settings: use Accordion",
    "Searching a whole site or app: use CommandSearch",
  ],
  related: ["Accordion", "Tabs", "SearchField", "EmptyState", "Section"],
  a11y: "Its title is a heading (an h2 unless titleAs says otherwise) and each question is a button in a heading a level below it, named by the question (and in search results by its group after it), as in Accordion. The search field is a searchbox named by its label; as you type, a polite status says how many questions match, and the matching words are marked. The groups are tabs in a tablist named by labels.groups. A link to a question's #id opens it and moves focus to it, as following an anchor does, without a ring; the no-results message's \"Show all questions\" clears the search and puts focus back in the field.",
  motion: "morph",
  keyboard: [
    {
      keys: "Tab",
      does: "Moves through the search field, the chosen tab, each question and the contact, in that order",
    },
    {
      keys: "Escape",
      does: "Clears the search from the search field, keeping focus there",
    },
    {
      keys: "Arrow Right or Arrow Left",
      does: "Moves between the tabs and shows that group's questions",
    },
    {
      keys: "Arrow Down or Arrow Up",
      does: "Moves to the next or previous question, wrapping at the ends of a column",
    },
    { keys: "Home or End", does: "Moves to the first or last question" },
    {
      keys: "Enter or Space",
      does: "Opens or closes the question whose trigger has focus",
    },
  ],
  layout:
    "It's its own size container and fills its container's width. Stacked, it's one column at most 720px wide: the intro, the questions 48px under it (64 on a page from 1024px wide), then the contact 32px under them. From 640px of room, split puts the intro and the contact in a column a third wide (240px at least) beside the questions, 48px apart, and two-column lays the questions out in two columns; under 640 both stack as stacked does. The search field fills the questions' column (at most 600px wide in two columns), the tabs fold the groups that don't fit into a More menu, and questions wrap instead of truncating. Faq.Contact puts its actions beside its words from 480px wide and under them when it's narrower.",
  reducedMotion:
    "A question opens and closes at once and its chevron turns over at once; its answer fades in and out in 100ms.",
};
