import { createContext, isValidElement, use } from "react";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { Icon, Inline, Stack, Surface, Text } from "@butteryui/core";
import { ArrowLink, Breadcrumbs, Callout } from "@butteryui/react";
import { Link2 } from "lucide-react";
import { Card, Cards } from "./blocks/Cards.tsx";
import { Do, DoDont, Dont } from "./blocks/DoDont.tsx";
import { QuickStartCode, QuickStartPreview } from "./blocks/QuickStart.tsx";
import { Rule, Rules } from "./blocks/Rules.tsx";
import { StarterEntry } from "./blocks/StarterEntry.tsx";
import { Step, Steps } from "./blocks/Steps.tsx";
import { TemplateCards } from "./blocks/TemplateCards.tsx";
import { CodeBlock } from "./CodeBlock.tsx";
import { CopyPageMarkdown } from "./CopyPageMarkdown.tsx";
import { ComponentDocs } from "./ComponentDocs.tsx";
import { DocsTable } from "./DocsTable.tsx";
import { codeClass } from "./inline-code.tsx";
import { Example } from "./Example.tsx";
import "./foundations/blocks.css";
import type { ContentEntry } from "./content.ts";
import { siteHref } from "./location.ts";
import { PageFooter } from "./PageFooter.tsx";
import type { Neighbor } from "./PageFooter.tsx";
import { slugify } from "./slug.ts";

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ readonly children?: ReactNode }>(node))
    return textOf(node.props.children);
  return "";
}

/** Where a Markdown link goes: a path written from the site's root, such as `/foundations/colors`, under the base. */
function linkHref(href: string | undefined): string | undefined {
  return href !== undefined && /^\/(?!\/)/.test(href) ? siteHref(href) : href;
}

/** Whether the text is inside a note, whose Callout sets its size and line so its icon sits on the first line. */
const InNote = createContext(false);

function Paragraph({ children }: ComponentPropsWithRef<"p">): ReactElement {
  return use(InNote) ? (
    <p>{children}</p>
  ) : (
    <Text variant="body" asChild>
      <p>{children}</p>
    </Text>
  );
}

function ListItem({ children }: ComponentPropsWithRef<"li">): ReactElement {
  return use(InNote) ? (
    <li>{children}</li>
  ) : (
    <Text variant="body" asChild>
      <li>{children}</li>
    </Text>
  );
}

/** A heading's anchor id from what it renders. */
export function slugOf(children: ReactNode): string {
  return slugify(textOf(children));
}

/** The Markdown elements an MDX page renders, as buttery's text and code. */
export const markdown = {
  h2: ({ children }: ComponentPropsWithRef<"h2">): ReactElement => (
    <Text variant="heading-2" asChild>
      <h2 id={slugOf(children)} className="docs-h2">
        <a href={`#${slugOf(children)}`} className="docs-anchor">
          {children}
          <span className="docs-anchor-icon">
            <Icon icon={Link2} />
          </span>
        </a>
      </h2>
    </Text>
  ),
  h3: ({ children }: ComponentPropsWithRef<"h3">): ReactElement => (
    <Text variant="title" asChild>
      <h3 id={slugOf(children)} className="docs-h3">
        <a href={`#${slugOf(children)}`} className="docs-anchor">
          {children}
          <span className="docs-anchor-icon">
            <Icon icon={Link2} />
          </span>
        </a>
      </h3>
    </Text>
  ),
  p: Paragraph,
  ul: ({ children }: ComponentPropsWithRef<"ul">): ReactElement => (
    <Stack gap={3} asChild>
      <ul className="docs-list">{children}</ul>
    </Stack>
  ),
  ol: ({ children }: ComponentPropsWithRef<"ol">): ReactElement => (
    <Stack gap={3} asChild>
      <ol className="docs-list">{children}</ol>
    </Stack>
  ),
  li: ListItem,
  a: ({ children, href }: ComponentPropsWithRef<"a">): ReactElement => (
    <a href={linkHref(href)} className="docs-link bt-focus">
      {children}
    </a>
  ),
  code: ({
    children,
    className,
  }: ComponentPropsWithRef<"code">): ReactElement => (
    <code className={className ?? codeClass(textOf(children))}>{children}</code>
  ),
  blockquote: ({
    children,
  }: ComponentPropsWithRef<"blockquote">): ReactElement => (
    <Callout tone="info" className="docs-note">
      <InNote value>
        <Stack gap={3}>{children}</Stack>
      </InNote>
    </Callout>
  ),
  pre: CodeBlock,
  Example,
  ComponentDocs,
  DocsTable,
  Steps,
  Step,
  Cards,
  Card,
  TemplateCards,
  StarterEntry,
  QuickStartPreview,
  QuickStartCode,
  Rules,
  Rule,
  DoDont,
  Do,
  Dont,
};

/** A page a written page names as related, with what it's about. */
export interface RelatedPage {
  readonly route: string;
  readonly title: string;
  readonly description: string;
}

/** The pages a written page's frontmatter names as related, as cards under a heading of their own. */
function RelatedPages({
  pages,
}: {
  readonly pages: readonly RelatedPage[];
}): ReactElement | null {
  if (pages.length === 0) return null;
  const Heading = markdown.h2;
  return (
    <Stack gap={5} asChild>
      <section aria-labelledby="related">
        <Heading>Related</Heading>
        <ul
          role="list"
          className="docs-cards docs-card-grid"
          data-columns={pages.length % 3 === 0 ? 3 : 2}
        >
          {pages.map((related) => (
            <Surface key={related.route} level="section" pad={5} asChild>
              <li>
                <Stack gap={2} align="start">
                  <ArrowLink href={siteHref(`/${related.route}`)}>
                    {related.title}
                  </ArrowLink>
                  <Text variant="body-sm" tone="secondary">
                    {related.description}
                  </Text>
                </Stack>
              </li>
            </Surface>
          ))}
        </ul>
      </section>
    </Stack>
  );
}

/**
 * A page written in MDX: its section, its title and description from its frontmatter, its content, the pages
 * it names as related, and the pages before and after it.
 */
export function ContentPage({
  entry,
  crumbs = [],
  related = [],
  previous,
  next,
}: {
  readonly entry: ContentEntry;
  /** Its section, linking to the section's first page. */
  readonly crumbs?: readonly {
    readonly label: string;
    readonly href: string;
  }[];
  readonly related?: readonly RelatedPage[];
  readonly previous?: Neighbor | undefined;
  readonly next?: Neighbor | undefined;
}): ReactElement {
  const { page, Content } = entry;
  return (
    <Stack gap={8} asChild>
      <article className="docs-prose">
        <Stack gap={4}>
          {crumbs.length > 0 ? <Breadcrumbs items={crumbs} /> : null}
          <Text variant="heading-1" asChild>
            <h1>{page.title}</h1>
          </Text>
          <Text variant="body-lg">{page.description}</Text>
          <Inline gap={2}>
            <CopyPageMarkdown route={entry.route} />
          </Inline>
        </Stack>
        <Stack gap={5}>
          <Content components={markdown} />
        </Stack>
        <RelatedPages pages={related} />
        <PageFooter previous={previous} next={next} source={entry.source} />
      </article>
    </Stack>
  );
}
