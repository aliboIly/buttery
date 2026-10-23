import { Text, cx, hasContent } from "@butteryui/core";
import { useId } from "react";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";

/** Props for `Inspector`. */
export interface InspectorProps extends ComponentPropsWithRef<"div"> {
  /** Names the panel for screen readers, such as "Slide settings". */
  readonly label: string;
  /** What stays at the bottom while the sections scroll, such as `<Inspector.Footer>` with Copy and Export. */
  readonly footer?: ReactNode;
}

function InspectorRoot({
  label,
  footer,
  className,
  children,
  ...rest
}: InspectorProps): ReactElement {
  return (
    <div
      role="region"
      aria-label={label}
      {...rest}
      className={cx("bt-inspector bt-surface", className)}
      data-level="panel"
      data-bt="Inspector"
    >
      <div className="bt-scroll-fade" data-bt-part="body">
        {children}
      </div>
      {footer}
    </div>
  );
}

/** Props for `Inspector.Section`. */
export interface InspectorSectionProps extends Omit<
  ComponentPropsWithRef<"section">,
  "title"
> {
  /** The section's heading, such as "Background". */
  readonly title: string;
  /** Puts back the section's defaults. Given, the header shows a Reset action. */
  readonly onReset?: (() => void) | undefined;
  /** Whether anything in it differs from its defaults; while it doesn't, Reset is dimmed. Defaults to `true`. */
  readonly resettable?: boolean | undefined;
  /** The Reset action's word. Defaults to `"Reset"`; it's read with the title, as in "Reset Background". */
  readonly resetLabel?: string | undefined;
}

/**
 * A titled group of rows: a header (the title, and Reset when `onReset` is given) over a card holding
 * the rows, divided by lines.
 */
export function InspectorSection({
  title,
  onReset,
  resettable = true,
  resetLabel = "Reset",
  className,
  children,
  ...rest
}: InspectorSectionProps): ReactElement {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      {...rest}
      className={cx("bt-inspector-section bt-surface", className)}
      data-level="section"
      data-bt-part="section"
    >
      <div data-bt-part="header">
        <Text id={titleId} variant="caption" truncate asChild>
          <h2 data-bt-part="title">{title}</h2>
        </Text>
        {onReset ? (
          <button
            type="button"
            className="bt-text bt-press bt-focus"
            data-role="caption"
            data-bt-part="reset"
            aria-label={`${resetLabel} ${title}`}
            aria-disabled={!resettable || undefined}
            onClick={() => {
              if (resettable) onReset();
            }}
          >
            {resetLabel}
          </button>
        ) : null}
      </div>
      <div className="bt-surface" data-level="card" data-bt-part="card">
        {children}
      </div>
    </section>
  );
}

/** Props for `Inspector.Row`. */
export interface InspectorRowProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children"
> {
  /** What the row sets, shown at its start. Leave it out when the control brings its own, as `Slider` does. */
  readonly label?: ReactNode;
  /** Something beside the label, such as a `Chip` that resets this row. */
  readonly extra?: ReactNode;
  /** Lets the row grow to fit what it holds, such as a swatch grid, padded 16 on every side. */
  readonly block?: boolean | undefined;
  /** The control. Without a label, it fills the row. */
  readonly children?: ReactNode;
}

/** One 50px row: a label (and anything beside it) at the start and the control at the end, or a `block` that grows to fit. */
export function InspectorRow({
  label,
  extra,
  block = false,
  className,
  children,
  ...rest
}: InspectorRowProps): ReactElement {
  const labelled = hasContent(label) || hasContent(extra);
  return (
    <div
      {...rest}
      className={cx("bt-inspector-row", className)}
      data-bt-part="row"
      data-labelled={labelled ? "" : undefined}
      data-block={block ? "" : undefined}
    >
      {labelled ? (
        <div data-bt-part="lead">
          {hasContent(label) ? (
            <Text variant="label" truncate>
              {label}
            </Text>
          ) : null}
          {extra}
        </div>
      ) : null}
      {children}
    </div>
  );
}

/** Props for `Inspector.RowSplit`. */
export type InspectorRowSplitProps = ComponentPropsWithRef<"div">;

/** Two rows side by side with a line between them, 64px tall, for compact controls such as a tilt pad and an anchor grid. */
export function InspectorRowSplit({
  className,
  ...rest
}: InspectorRowSplitProps): ReactElement {
  return (
    <div
      {...rest}
      className={cx("bt-inspector-split", className)}
      data-bt-part="split"
    />
  );
}

/** Props for `Inspector.Footer`. */
export type InspectorFooterProps = ComponentPropsWithRef<"div">;

/** The bar under the sections, over a line: the panel's main actions, 8px apart. Pass it as `footer`. */
export function InspectorFooter({
  className,
  ...rest
}: InspectorFooterProps): ReactElement {
  return (
    <div
      {...rest}
      className={cx("bt-inspector-footer", className)}
      data-bt-part="footer"
    />
  );
}

/** `Inspector.Row` with its `Split` variant. */
export interface InspectorRowComponent {
  (props: InspectorRowProps): ReactElement;
  /** Two rows side by side. */
  readonly Split: typeof InspectorRowSplit;
}

/** `Inspector` with its parts. */
export interface InspectorComponent {
  (props: InspectorProps): ReactElement;
  /** A titled group of rows. */
  readonly Section: typeof InspectorSection;
  /** One row; `Inspector.Row.Split` puts two side by side. */
  readonly Row: InspectorRowComponent;
  /** The bar for the panel's main actions. */
  readonly Footer: typeof InspectorFooter;
}

/**
 * A settings panel, 340px wide: titled sections of rows on nested surfaces, scrolling with faded edges,
 * and a footer that stays put for the main actions. Sections reset to their defaults from their header.
 *
 * @example
 * <Inspector
 *   label="Slide settings"
 *   footer={
 *     <Inspector.Footer>
 *       <Button iconStart={Copy}>Copy</Button>
 *       <SplitButton onClick={exportPng} menuLabel="More export options" items={formats}>Export PNG</SplitButton>
 *     </Inspector.Footer>
 *   }
 * >
 *   <Inspector.Section title="Picture" onReset={resetPicture} resettable={changed}>
 *     <Inspector.Row label="Edge">
 *       <SegmentedControl label="Edge" options={edges} value={edge} onValueChange={setEdge} />
 *     </Inspector.Row>
 *     <Inspector.Row>
 *       <Slider label="Scale" format="%" value={scale} onValueChange={setScale} />
 *     </Inspector.Row>
 *   </Inspector.Section>
 * </Inspector>
 */
export const Inspector: InspectorComponent = Object.assign(InspectorRoot, {
  Section: InspectorSection,
  Row: Object.assign(InspectorRow, { Split: InspectorRowSplit }),
  Footer: InspectorFooter,
});
