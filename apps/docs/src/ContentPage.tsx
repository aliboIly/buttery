import { isValidElement } from "react";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { Stack, Text } from "@buttery/core";
import type { ContentEntry } from "./content.ts";
import { slugify } from "./slug.ts";

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ readonly children?: ReactNode }>(node))
    return textOf(node.props.children);
  return "";
}

/** A heading's anchor id from what it renders. */
export function slugOf(children: ReactNode): string {
  return slugify(textOf(children));
}

/** The Markdown elements an MDX page renders, as buttery's text and code. */
export const markdown = {
  h2: ({ children }: ComponentPropsWithRef<"h2">): ReactElement => (
    <Text variant="heading-2" asChild>
      <h2 id={slugOf(children)}>{children}</h2>
    </Text>
  ),
  h3: ({ children }: ComponentPropsWithRef<"h3">): ReactElement => (
    <Text variant="title" asChild>
      <h3 id={slugOf(children)}>{children}</h3>
    </Text>
  ),
  p: ({ children }: ComponentPropsWithRef<"p">): ReactElement => (
    <Text variant="body" asChild>
      <p>{children}</p>
    </Text>
  ),
  ul: ({ children }: ComponentPropsWithRef<"ul">): ReactElement => (
    <Stack gap={2} asChild>
      <ul className="docs-list">{children}</ul>
    </Stack>
  ),
  ol: ({ children }: ComponentPropsWithRef<"ol">): ReactElement => (
    <Stack gap={2} asChild>
      <ol className="docs-list">{children}</ol>
    </Stack>
  ),
  li: ({ children }: ComponentPropsWithRef<"li">): ReactElement => (
    <Text variant="body" asChild>
      <li>{children}</li>
    </Text>
  ),
  a: ({ children, href }: ComponentPropsWithRef<"a">): ReactElement => (
    <a href={href} className="docs-link bt-focus">
      {children}
    </a>
  ),
  code: ({
    children,
    className,
  }: ComponentPropsWithRef<"code">): ReactElement => (
    <code className={className ?? "docs-code"}>{children}</code>
  ),
  pre: ({
    children,
    className,
    style,
  }: ComponentPropsWithRef<"pre">): ReactElement => (
    <pre
      className={["docs-pre", className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </pre>
  ),
};

/** A page written in MDX: its title and description from its frontmatter, then its content. */
export function ContentPage({
  entry,
}: {
  readonly entry: ContentEntry;
}): ReactElement {
  const { page, Content } = entry;
  return (
    <Stack gap={8} asChild>
      <article className="docs-prose">
        <Stack gap={4}>
          <Text variant="heading-1" asChild>
            <h1>{page.title}</h1>
          </Text>
          <Text variant="body-lg">{page.description}</Text>
        </Stack>
        <Stack gap={5}>
          <Content components={markdown} />
        </Stack>
      </article>
    </Stack>
  );
}
