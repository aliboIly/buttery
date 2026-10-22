import type { ReactElement, ReactNode } from "react";
import { Grid, Icon, Stack, Surface, Text } from "@buttery/core";
import {
  Blocks,
  Bot,
  BookOpen,
  Code,
  FileText,
  GitBranch,
  Hexagon,
  LayoutTemplate,
  Monitor,
  Package,
  Palette,
  ShieldCheck,
  SquareTerminal,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "./blocks.css";

const ICONS = {
  blocks: Blocks,
  bot: Bot,
  book: BookOpen,
  code: Code,
  file: FileText,
  git: GitBranch,
  node: Hexagon,
  template: LayoutTemplate,
  monitor: Monitor,
  package: Package,
  palette: Palette,
  shield: ShieldCheck,
  terminal: SquareTerminal,
  wrench: Wrench,
} as const satisfies Readonly<Record<string, LucideIcon>>;

/** The icon a `<Card>` shows over its title, by name. */
export type CardIcon = keyof typeof ICONS;

/** Cards on a written page, a column of them on a phone and `columns` to a row where there's room. */
export function Cards({
  columns = 2,
  children,
}: {
  /** How many to a row from 640px of room. Defaults to 2. */
  readonly columns?: 2 | 3;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <Grid columns={{ base: 1, md: columns }} gap={4} asChild>
      <ul role="list" className="docs-cards">
        {children}
      </ul>
    </Grid>
  );
}

/**
 * One card: an icon, a title and the Markdown inside it. The title is a line of its own rather than a
 * heading, so cards don't crowd the page's list of headings; the page's Markdown writes it in bold.
 */
export function Card({
  icon,
  title,
  children,
}: {
  readonly icon?: CardIcon;
  readonly title: string;
  readonly children?: ReactNode;
}): ReactElement {
  return (
    <Surface level="card" pad={5} asChild>
      <li className="docs-card">
        <Stack gap={3} align="start">
          {icon === undefined ? null : (
            <span className="docs-card-icon">
              <Icon icon={ICONS[icon]} />
            </span>
          )}
          <Text variant="title" asChild>
            <p>{title}</p>
          </Text>
          {children === undefined ? null : (
            <Stack gap={2} className="docs-card-body">
              {children}
            </Stack>
          )}
        </Stack>
      </li>
    </Surface>
  );
}
