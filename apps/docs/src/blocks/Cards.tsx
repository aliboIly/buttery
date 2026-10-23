import type { ReactElement, ReactNode } from "react";
import { Grid, Icon, Stack, Surface, Text } from "@butteryui/core";
import {
  ArrowRight,
  Blocks,
  Bot,
  BookOpen,
  Code,
  Columns3,
  Droplet,
  Eye,
  FileText,
  GitBranch,
  Hexagon,
  Keyboard,
  Layers,
  LayoutGrid,
  LayoutTemplate,
  Loader,
  Monitor,
  Move,
  Package,
  Palette,
  Rows3,
  Ruler,
  Search,
  ShieldCheck,
  SquareTerminal,
  Timer,
  Type,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { withInlineCode } from "../inline-code.tsx";
import "./blocks.css";

const ICONS = {
  arrow: ArrowRight,
  blocks: Blocks,
  bot: Bot,
  book: BookOpen,
  code: Code,
  columns: Columns3,
  droplet: Droplet,
  eye: Eye,
  file: FileText,
  git: GitBranch,
  grid: LayoutGrid,
  keyboard: Keyboard,
  layers: Layers,
  loader: Loader,
  node: Hexagon,
  template: LayoutTemplate,
  monitor: Monitor,
  move: Move,
  package: Package,
  palette: Palette,
  rows: Rows3,
  ruler: Ruler,
  search: Search,
  shield: ShieldCheck,
  terminal: SquareTerminal,
  timer: Timer,
  type: Type,
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
 * heading, so cards don't crowd the page's list of headings; the page's Markdown writes it in bold, and code
 * in backticks in it shows as code.
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
            <p>{withInlineCode(title)}</p>
          </Text>
          {children === undefined ? null : (
            <Stack gap={3} className="docs-card-body">
              {children}
            </Stack>
          )}
        </Stack>
      </li>
    </Surface>
  );
}
