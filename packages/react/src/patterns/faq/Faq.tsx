import {
  TextStack,
  cx,
  hasContent,
  opensElsewhere,
  scrollToSection,
  useControllableState,
  warnOnce,
} from "@butteryui/core";
import type { TextStackTitleElement } from "@butteryui/core";
import { SearchX } from "lucide-react";
import { VisuallyHidden } from "radix-ui";
import {
  isValidElement,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { Accordion } from "../../components/accordion/Accordion.tsx";
import type {
  AccordionHeadingLevel,
  AccordionSize,
  AccordionVariant,
} from "../../components/accordion/Accordion.tsx";
import { Button } from "../../components/button/Button.tsx";
import { SearchField } from "../../components/search-field/SearchField.tsx";
import { Tabs } from "../../components/tabs/Tabs.tsx";
import { SearchHighlight } from "../command-search/CommandSearch.tsx";
import { matchesSearch } from "../command-search/search.ts";
import { EmptyState } from "../empty-state/EmptyState.tsx";

/** One question and its answer. */
export interface FaqQuestion {
  /**
   * Identifies the question: the anchor that opens it and scrolls to it from a `#id` link, and what `value`
   * holds while it's open. Unique on the page, as any element id is.
   */
  readonly id: string;
  /** The question, as its trigger's words. */
  readonly question: string;
  /** The answer: words, or anything else, such as a paragraph with a link in it. */
  readonly answer: ReactNode;
  /** The `value` of the group it's in, when the FAQ has `groups`. */
  readonly group?: string | undefined;
  /** More words the search matches, such as the words people use for it: "refund" for a returns question. */
  readonly keywords?: string | undefined;
}

/** A group of questions, such as a topic, that a tab shows. */
export interface FaqGroup {
  /** Identifies the group: what each of its questions names as its `group`. */
  readonly value: string;
  /** The tab's words, such as "Orders and shipping". */
  readonly label: string;
}

/**
 * How an FAQ arranges its parts: `"stacked"`, one column; `"split"`, the intro beside the questions; or
 * `"two-column"`, the questions in two columns under the intro.
 */
export type FaqLayout = "stacked" | "split" | "two-column";

/** The words an FAQ shows, for another language or your own. */
export interface FaqLabels {
  /** Names the search field and shows as its placeholder, such as "Search questions". */
  readonly search: string;
  /** Names the tabs for screen readers, such as "Topics". */
  readonly groups: string;
  /** How many questions match a search, read out as the results change, such as "3 questions match". */
  readonly results: (count: number) => string;
  /** The title of what shows when nothing matches, such as `No questions match "decaf"`. */
  readonly noResults: (search: string) => string;
  /** The line under it. */
  readonly noResultsHint: string;
  /** The button under it that clears the search, such as "Show all questions". */
  readonly showAll: string;
}

/** Props for `Faq`. */
export interface FaqProps extends Omit<
  ComponentPropsWithRef<"div">,
  "title" | "defaultValue" | "children"
> {
  /** The heading over the questions, such as "Questions, answered". */
  readonly title?: ReactNode;
  /** A line or two under the heading. */
  readonly intro?: ReactNode;
  /** What the heading renders as. Defaults to `"h2"`; the questions are headings a level below it. */
  readonly titleAs?: TextStackTitleElement | undefined;
  /** The questions, in the order they show. */
  readonly questions: readonly FaqQuestion[];
  /** The groups the questions are in, in tab order. With two or more, tabs switch between them; each question names its own. */
  readonly groups?: readonly FaqGroup[] | undefined;
  /** The open questions' ids. Pair with `onValueChange` to control them. */
  readonly value?: readonly string[] | undefined;
  /** The questions open at first when uncontrolled. Defaults to none. */
  readonly defaultValue?: readonly string[] | undefined;
  /** Called with the open questions' ids each time one opens or closes. */
  readonly onValueChange?: ((value: readonly string[]) => void) | undefined;
  /** The group shown. Pair with `onGroupChange` to control it. */
  readonly group?: string | undefined;
  /** The group shown at first when uncontrolled. Defaults to the first. */
  readonly defaultGroup?: string | undefined;
  /** Called with the group a person shows: by its tab, or by following a link to a question in it. */
  readonly onGroupChange?: ((group: string) => void) | undefined;
  /** Shows a search field over the questions that filters every group's as you type. Defaults to `false`. */
  readonly search?: boolean | undefined;
  /**
   * How the parts are arranged: `"stacked"` (the default), one column at most 720px wide; `"split"`, the intro
   * and `contact` beside the questions; or `"two-column"`, the questions in two columns. Split and two columns
   * take 640px of room and stack under that.
   */
  readonly layout?: FaqLayout | undefined;
  /** How the questions are drawn, as `Accordion`'s `variant`. Defaults to `"divided"`. */
  readonly variant?: AccordionVariant | undefined;
  /** How big the questions are, as `Accordion`'s `size`. Defaults to `"md"`. */
  readonly size?: AccordionSize | undefined;
  /** What closes the FAQ, such as a `Faq.Contact` with a way to ask a question it doesn't answer. */
  readonly contact?: ReactNode;
  /** Its words, for another language or your own. */
  readonly labels?: Partial<FaqLabels> | undefined;
}

const LABELS: FaqLabels = {
  search: "Search questions",
  groups: "Topics",
  results: (count) =>
    count === 0
      ? "No questions match"
      : count === 1
        ? "1 question matches"
        : `${String(count)} questions match`,
  noResults: (search) => `No questions match "${search}"`,
  noResultsHint: "Try fewer words, or other words for the same thing.",
  showAll: "Show all questions",
};

const NONE: readonly string[] = [];

const NO_GROUPS: readonly FaqGroup[] = [];

const HEADINGS = {
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
} as const satisfies Record<AccordionHeadingLevel, TextStackTitleElement>;

const LEVELS = {
  h1: 2,
  h2: 3,
  h3: 4,
  h4: 5,
  h5: 6,
  h6: 6,
  p: 3,
} as const satisfies Record<TextStackTitleElement, AccordionHeadingLevel>;

/** The words in a React node: its strings and numbers, and those of the elements inside it. */
function wordsIn(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node))
    return node.map((child: ReactNode) => wordsIn(child)).join(" ");
  if (isValidElement<{ readonly children?: ReactNode }>(node))
    return wordsIn(node.props.children);
  return "";
}

function matches(question: FaqQuestion, search: string): boolean {
  return matchesSearch(
    search,
    question.question,
    wordsIn(question.answer),
    question.keywords,
  );
}

/**
 * An answer that scrolls its question under the sticky bars as it shows, when a link to the question opened
 * it: only then is the question in the page, once its group's tab panel has mounted.
 */
function Answer({
  id,
  takeArrival,
  children,
}: {
  readonly id: string;
  readonly takeArrival: (id: string) => boolean;
  readonly children: ReactNode;
}): ReactNode {
  const arrive = useEffectEvent(() => {
    if (takeArrival(id)) scrollToSection(id);
  });
  useLayoutEffect(() => {
    arrive();
  }, []);
  return children;
}

function halves<T>(items: readonly T[]): readonly (readonly T[])[] {
  const middle = Math.ceil(items.length / 2);
  return [items.slice(0, middle), items.slice(middle)];
}

function FaqRoot({
  title,
  intro,
  titleAs = "h2",
  questions,
  groups = NO_GROUPS,
  value,
  defaultValue,
  onValueChange,
  group,
  defaultGroup,
  onGroupChange,
  search = false,
  layout = "stacked",
  variant = "divided",
  size = "md",
  contact,
  labels,
  className,
  ...rest
}: FaqProps): ReactElement {
  const words = { ...LABELS, ...labels };
  const [open, setOpen] = useControllableState({
    value,
    defaultValue: defaultValue ?? NONE,
    onChange: onValueChange,
  });
  const [picked, setPicked] = useState(defaultGroup ?? groups[0]?.value ?? "");
  const chosen = group ?? picked;
  const [query, setQuery] = useState("");
  const searchField = useRef<HTMLInputElement>(null);
  const arriving = useRef<string | null>(null);
  const switching = groups.length > 1;
  const searching = search && query.trim() !== "";
  const shown = searching
    ? questions.filter((question) => matches(question, query))
    : switching
      ? questions.filter((question) => question.group === chosen)
      : questions;
  const headingLevel = hasContent(title) ? LEVELS[titleAs] : 3;

  const choose = (next: string): void => {
    if (group === undefined) setPicked(next);
    onGroupChange?.(next);
  };

  // A question opened through `value` from outside shows; a controlled `group` is left to its owner.
  const [seen, setSeen] = useState(open);
  if (seen !== open) {
    setSeen(open);
    const arrived = questions.find(
      (question) =>
        open.includes(question.id) &&
        !seen.includes(question.id) &&
        !shown.includes(question),
    );
    if (arrived !== undefined) {
      if (searching && !matches(arrived, query)) setQuery("");
      if (
        switching &&
        group === undefined &&
        arrived.group !== undefined &&
        (!searching || !matches(arrived, query))
      )
        setPicked(arrived.group);
    }
  }

  const takeArrival = (id: string): boolean => {
    if (arriving.current !== id) return false;
    arriving.current = null;
    return true;
  };

  const reveal = useEffectEvent((id: string): void => {
    const question = questions.find((candidate) => candidate.id === id);
    if (question === undefined) return;
    const hidden = searching && !matches(question, query);
    let changed = false;
    if (hidden) {
      setQuery("");
      changed = true;
    }
    if (
      switching &&
      (hidden || !searching) &&
      question.group !== undefined &&
      question.group !== chosen
    ) {
      choose(question.group);
      changed = true;
    }
    if (!open.includes(id)) {
      setOpen([...open, id]);
      changed = true;
    }
    if (changed) arriving.current = id;
    else scrollToSection(id);
  });

  // A link to the address the page is already at changes no hash, so only its click says it was followed.
  useEffect(() => {
    const follow = (hash: string): void => {
      if (hash.length > 1) reveal(decodeURIComponent(hash.slice(1)));
    };
    const onHashChange = (): void => {
      follow(window.location.hash);
    };
    const onClick = (event: MouseEvent): void => {
      if (event.defaultPrevented || opensElsewhere(event)) return;
      const link =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;
      if (
        link instanceof HTMLAnchorElement &&
        link.hash !== "" &&
        link.href === window.location.href
      )
        follow(link.hash);
    };
    const first = requestAnimationFrame(onHashChange);
    window.addEventListener("hashchange", onHashChange);
    document.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(first);
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const lost = switching
    ? questions.find(
        (question) =>
          !groups.some((candidate) => candidate.value === question.group),
      )
    : undefined;
  useEffect(() => {
    if (lost === undefined) return;
    warnOnce(
      "Faq",
      `The question "${lost.question}" is in the group "${String(lost.group)}", which groups doesn't list, so only a search finds it. Fix: set its group to one of ${groups.map((candidate) => `"${candidate.value}"`).join(", ")}, or add that group.`,
    );
  }, [lost, groups]);

  const clear = (): void => {
    setQuery("");
    searchField.current?.focus();
  };

  const list = (items: readonly FaqQuestion[]): ReactElement => {
    const accordion = (part: readonly FaqQuestion[], key?: number) => (
      <Accordion
        key={key}
        type="multiple"
        value={open}
        onValueChange={setOpen}
        variant={variant}
        size={size}
        headingLevel={headingLevel}
      >
        {part.map((question) => (
          <Accordion.Item
            key={question.id}
            id={question.id}
            value={question.id}
            title={
              searching ? (
                <SearchHighlight text={question.question} query={query} />
              ) : (
                question.question
              )
            }
            description={
              searching && switching
                ? groups.find((candidate) => candidate.value === question.group)
                    ?.label
                : undefined
            }
          >
            <Answer id={question.id} takeArrival={takeArrival}>
              {typeof question.answer === "string" ? (
                <p data-bt-part="faq-answer">
                  {searching ? (
                    <SearchHighlight text={question.answer} query={query} />
                  ) : (
                    question.answer
                  )}
                </p>
              ) : (
                question.answer
              )}
            </Answer>
          </Accordion.Item>
        ))}
      </Accordion>
    );
    return layout === "two-column" ? (
      <div data-bt-part="faq-columns">
        {halves(items)
          .filter((part) => part.length > 0)
          .map((part, index) => accordion(part, index))}
      </div>
    ) : (
      accordion(items)
    );
  };

  const questionsShown = searching ? (
    shown.length > 0 ? (
      list(shown)
    ) : (
      <div data-bt-part="faq-empty">
        <EmptyState
          icon={SearchX}
          title={words.noResults(query.trim())}
          description={words.noResultsHint}
          titleAs={HEADINGS[headingLevel]}
          actions={
            <Button variant="soft" onClick={clear}>
              {words.showAll}
            </Button>
          }
        />
      </div>
    )
  ) : switching ? (
    <Tabs value={chosen} onValueChange={choose}>
      <Tabs.List label={words.groups}>
        {groups.map((candidate) => (
          <Tabs.Tab key={candidate.value} value={candidate.value}>
            {candidate.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {groups.map((candidate) => (
        <Tabs.Panel key={candidate.value} value={candidate.value}>
          {list(
            questions.filter((question) => question.group === candidate.value),
          )}
        </Tabs.Panel>
      ))}
    </Tabs>
  ) : (
    list(questions)
  );

  const header = hasContent(title) ? (
    <TextStack size="section" title={title} body={intro} titleAs={titleAs} />
  ) : hasContent(intro) ? (
    <p data-bt-part="faq-lead">{intro}</p>
  ) : null;

  return (
    <div
      {...rest}
      className={cx("bt-faq", className)}
      data-bt="Faq"
      data-layout={layout}
      data-variant={variant}
    >
      <div data-bt-part="faq-grid">
        {header === null ? null : <div data-bt-part="faq-intro">{header}</div>}
        <div data-bt-part="faq-body">
          {search ? (
            <SearchField
              ref={searchField}
              label={words.search}
              value={query}
              onValueChange={setQuery}
            />
          ) : null}
          {questionsShown}
          <VisuallyHidden.Root role="status">
            {searching ? words.results(shown.length) : ""}
          </VisuallyHidden.Root>
        </div>
        {hasContent(contact) ? (
          <div data-bt-part="faq-contact">{contact}</div>
        ) : null}
      </div>
    </div>
  );
}

/** Props for `Faq.Contact`. */
export interface FaqContactProps extends Omit<
  ComponentPropsWithRef<"div">,
  "title" | "children"
> {
  /** The heading. Defaults to `"Still have a question?"`. */
  readonly title?: ReactNode;
  /** A line under it, such as who answers and how soon. */
  readonly description?: ReactNode;
  /** The ways to ask, such as a `Button` with `asChild` around a link to an email address. */
  readonly actions?: ReactNode;
  /** What the heading renders as. Defaults to `"h3"`. */
  readonly titleAs?: TextStackTitleElement | undefined;
}

/**
 * A way to ask what the FAQ doesn't answer, for its `contact`: a card with a heading, a line and the actions,
 * which sit beside the words once the card is 480px wide and under them when it's narrower.
 */
export function FaqContact({
  title = "Still have a question?",
  description,
  actions,
  titleAs = "h3",
  className,
  ...rest
}: FaqContactProps): ReactElement {
  return (
    <div
      {...rest}
      className={cx("bt-faq-contact", className)}
      data-bt-part="faq-contact-card"
    >
      <div data-bt-part="faq-contact-inner">
        <TextStack
          size="empty"
          title={title}
          body={description}
          titleAs={titleAs}
        />
        {hasContent(actions) ? (
          <div data-bt-part="faq-contact-actions">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}

/** `Faq` with its part. */
export interface FaqComponent {
  (props: FaqProps): ReactElement;
  /** A way to ask what the FAQ doesn't answer, for its `contact`. */
  readonly Contact: typeof FaqContact;
}

/**
 * Questions and answers in a titled section: an optional intro, groups that tabs switch between, a search
 * that filters every group's questions as you type (with what shows when none match), and an optional
 * `contact`, such as a `Faq.Contact`, that closes it. Each question's `id` is an anchor: a `#id` link, or an
 * address that ends in one, opens the question, shows its group, clears a search that hides it and scrolls
 * it under the sticky bars. `layout` arranges it stacked, split (the intro beside the questions) or in two
 * columns; `variant` and `size` draw the questions as `Accordion` does.
 *
 * @example
 * <Faq
 *   title="Questions, answered"
 *   layout="split"
 *   search
 *   groups={[{ value: "orders", label: "Orders" }, { value: "coffee", label: "Coffee" }]}
 *   questions={[{ id: "shipping", group: "orders", question: "How much is shipping?", answer: "It's $6, and free from $40." }]}
 *   contact={<Faq.Contact description="Write to us and we'll answer within a day." actions={<Button asChild><a href="mailto:hello@halfmoon.example">Email us</a></Button>} />}
 * />
 */
export const Faq: FaqComponent = Object.assign(FaqRoot, {
  Contact: FaqContact,
});
