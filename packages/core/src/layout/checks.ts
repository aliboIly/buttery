/** Rules the in-page checker runs. Accessibility and stability need a browser driver and run in `@buttery/test`. */
export type LayoutRule =
  | "overlap"
  | "overflow"
  | "clipping"
  | "scale"
  | "target-size"
  | "viewport-fit"
  | "layering"
  | "reach"
  | "emphasis"
  | "crowding"
  | "wrapping"
  | "alignment";

/** Every rule `expectButtery` reports. */
export type ButteryRule = LayoutRule | "accessibility" | "stability";

/** One problem, in the format `LayoutGuard`, `expectButtery` and `buttery check --json` share. */
export interface LayoutViolation {
  /** The rule that failed, such as `"overlap"`. */
  readonly rule: ButteryRule;
  /** Selector of the offending element. */
  readonly a: string;
  /** Selector of the second element: the other one in an overlap, or the one that cuts off clipped text. */
  readonly b?: string;
  /** How far off it is, in CSS pixels, where that applies. */
  readonly px?: number;
  /** What's wrong, measured. */
  readonly message: string;
  /** How to fix it. */
  readonly fix: string;
}

/** Token values the checker compares against. `layoutCheckTokens()` builds them from the token tables. */
export interface LayoutCheckTokens {
  /** The spacing scale in px. */
  readonly space: readonly number[];
  /** CSS variables holding the control heights, read per element so scoped densities work. */
  readonly heightVars: readonly string[];
  /** Every z-index token value. */
  readonly zIndex: readonly number[];
}

/** Options for `check` and `runLayoutChecks`. */
export interface LayoutCheckOptions {
  /** The token values to compare against, from `layoutCheckTokens()`. */
  readonly tokens: LayoutCheckTokens;
  /** Rules to run. Defaults to all of them. */
  readonly rules?: readonly LayoutRule[] | undefined;
}

/** Options for `moved`. */
export interface MovedOptions {
  /** Selectors of elements that are meant to move, along with everything inside them. */
  readonly allow?: readonly string[] | undefined;
  /** When the movement happened, for the report, such as "after Open the menu". */
  readonly during: string;
}

/** The checker's functions, sharing selector and visibility helpers. */
export interface LayoutToolkit {
  /** Runs the layout rules against the document. */
  readonly check: (options: LayoutCheckOptions) => LayoutViolation[];
  /** Records where every buttery element is, for `moved`. */
  readonly snapshot: () => void;
  /**
   * Reports buttery elements that moved more than 1px since the last `snapshot`, measured from whichever
   * scroll container they hold still in: scrolling a container moves its content on screen, and a stuck
   * sticky bar holds still on screen while the content under it scrolls, so neither counts.
   */
  readonly moved: (options: MovedOptions) => LayoutViolation[];
}

/**
 * Builds buttery's in-page layout checker. It's fully self-contained (no imports or outer variables), so
 * `expectButtery` can serialize it into a page and `LayoutGuard` can call it directly.
 */
export function createLayoutToolkit(): LayoutToolkit {
  interface Box {
    left: number;
    top: number;
    right: number;
    bottom: number;
  }

  interface Measured {
    readonly element: Element;
    readonly box: Box;
    readonly layer: Element | null;
    readonly partOwner: Element | null;
  }

  interface ScrollOffset {
    /** The scroll container, or `null` for the window. */
    readonly container: Element | null;
    readonly x: number;
    readonly y: number;
  }

  interface Position {
    readonly x: number;
    readonly y: number;
    /** Whether it had no box, so there was nothing to see move. */
    readonly empty: boolean;
    /** Offsets of the scroll containers around the element, nearest first, then the window's. */
    readonly scrolls: readonly ScrollOffset[];
  }

  interface TextRun {
    readonly node: Text;
    readonly parent: Element;
  }

  const html = document.documentElement;
  /** Roles that make a button one item of a larger control, held to the 24px minimum but not to 28. */
  const ITEM_ROLES = new Set([
    "radio",
    "tab",
    "menuitem",
    "menuitemradio",
    "menuitemcheckbox",
    "option",
  ]);

  const INTERACTIVE = [
    "a[href]",
    "button",
    "input:not([type=hidden])",
    "select",
    "textarea",
    "summary",
    "[role=button]",
    "[role=link]",
    "[role=checkbox]",
    "[role=radio]",
    "[role=switch]",
    "[role=slider]",
    "[role=tab]",
    "[role=menuitem]",
    "[role=menuitemcheckbox]",
    "[role=menuitemradio]",
    "[role=option]",
    '[tabindex]:not([tabindex="-1"])',
  ].join(", ");
  const INTERACTIVE_WITHOUT_TABINDEX = INTERACTIVE.replace(
    ', [tabindex]:not([tabindex="-1"])',
    "",
  );
  const LAYER_FURNITURE = "[data-bt-layer], .bt-scrim, .bt-floating-lanes";
  const FOCUS_CONTAINERS =
    "dialog, [role=dialog], [role=alertdialog], [role=tabpanel], [role=region], [role=document], [role=group], [role=application], [role=log], [role=feed]";
  const PAGE_CHROME =
    "header, nav, [role=banner], [role=navigation], .bt-sticky";
  let styles = new Map<Element, CSSStyleDeclaration>();
  let positions = new Map<Element, Position>();
  let inkContext: CanvasRenderingContext2D | null | undefined;

  /** How far the glyphs of `text` hang below its baseline, in px, in the element's font. */
  function inkDescent(text: string, element: Element): number {
    inkContext ??= document.createElement("canvas").getContext("2d");
    if (!inkContext) return 0;
    const { fontStyle, fontWeight, fontSize, fontFamily } = styleOf(element);
    inkContext.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
    return Math.max(0, inkContext.measureText(text).actualBoundingBoxDescent);
  }

  function styleOf(element: Element): CSSStyleDeclaration {
    let style = styles.get(element);
    if (!style) {
      style = getComputedStyle(element);
      styles.set(element, style);
    }
    return style;
  }

  function selectorFor(element: Element): string {
    if (element === html) return "html";
    if (element === document.body) return "body";
    const parts: string[] = [];
    for (
      let node: Element | null = element;
      node && node !== document.body && node !== html;
      node = node.parentElement
    ) {
      const id = node.getAttribute("id");
      if (id && document.querySelectorAll(`#${CSS.escape(id)}`).length === 1) {
        parts.unshift(`#${CSS.escape(id)}`);
        break;
      }
      const testId = node.getAttribute("data-testid");
      const bt = node.getAttribute("data-bt");
      const part = node.getAttribute("data-bt-part");
      let segment = testId
        ? `[data-testid="${testId}"]`
        : bt
          ? `[data-bt="${bt}"]`
          : part
            ? `[data-bt-part="${part}"]`
            : node.tagName.toLowerCase();
      const parent: Element | null = node.parentElement;
      if (parent) {
        const siblings = [...parent.children];
        if (siblings.filter((child) => child.matches(segment)).length > 1) {
          segment += `:nth-child(${String(siblings.indexOf(node) + 1)})`;
        }
      }
      parts.unshift(segment);
      if (document.querySelectorAll(parts.join(" > ")).length === 1) break;
    }
    return parts.join(" > ");
  }

  function isVisible(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    return element.checkVisibility({
      opacityProperty: true,
      visibilityProperty: true,
    });
  }

  /** A screen-reader-only element: a box of 1px or less with its overflow hidden. */
  function isVisuallyHidden(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.width <= 1 &&
      rect.height <= 1 &&
      styleOf(element).overflow === "hidden"
    );
  }

  /** Whether `element` is, or sits inside, a screen-reader-only element, which draws nothing to overflow. */
  function withinVisuallyHidden(element: Element): boolean {
    for (let node: Element | null = element; node; node = node.parentElement)
      if (isVisuallyHidden(node)) return true;
    return false;
  }

  /**
   * How far a preview draws `element` from its own size: the factor a `[data-bt-preview]` around it gives,
   * such as a docs page's scaled-down desktop example, or 1. Sizes it lays out at are measured drawn / factor.
   */
  function drawnScale(element: Element): number {
    const factor = Number(
      element.closest("[data-bt-preview]")?.getAttribute("data-bt-preview"),
    );
    return factor > 0 ? factor : 1;
  }

  function isTooling(element: Element): boolean {
    return (
      element.closest('[data-bt-layer="dev"], [data-bt-annotations]') !== null
    );
  }

  function isTrimmed(element: Element): boolean {
    const trim = styleOf(element).getPropertyValue("text-box-trim");
    return trim !== "" && trim !== "none";
  }

  function isInline(element: Element): boolean {
    const { display } = styleOf(element);
    return display === "inline" || display === "contents";
  }

  /** The box of the nearest trimmed element from `element` up to its block container, if there is one. */
  function trimmedBoxOf(element: Element): DOMRect | null {
    for (
      let node: Element | null = element;
      node && node !== html;
      node = node.parentElement
    ) {
      if (isTrimmed(node)) return node.getBoundingClientRect();
      if (!isInline(node)) return null;
    }
    return null;
  }

  function toBox(rect: DOMRect): Box {
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
    };
  }

  /**
   * A text node's boxes, one per line: glyph extents across, the line box down (glyphs overhang tight line
   * heights by design). Text trimmed with `text-box` keeps to its trimmed box, except that the last line
   * still owns its descenders, which hang below the trimmed baseline.
   */
  function lineBoxes({ node, parent }: TextRun): Box[] {
    const range = document.createRange();
    range.selectNodeContents(node);
    const factor = drawnScale(parent);
    const lineHeight = Number.parseFloat(styleOf(parent).lineHeight) * factor;
    const trimmed = trimmedBoxOf(parent);
    const boxes: Box[] = [];
    for (const rect of range.getClientRects()) {
      if (rect.width < 0.5 || rect.height < 0.5) continue;
      const middle = (rect.top + rect.bottom) / 2;
      let top = Number.isNaN(lineHeight) ? rect.top : middle - lineHeight / 2;
      let bottom = Number.isNaN(lineHeight)
        ? rect.bottom
        : middle + lineHeight / 2;
      if (trimmed) {
        const lastLine = bottom >= trimmed.bottom - 0.5;
        top = Math.max(top, trimmed.top);
        bottom = Math.min(bottom, trimmed.bottom);
        if (lastLine) {
          bottom = Math.max(
            bottom,
            trimmed.bottom + inkDescent(node.data, parent) * factor,
          );
        }
      }
      if (bottom - top < 0.5) continue;
      boxes.push({ left: rect.left, top, right: rect.right, bottom });
    }
    return boxes;
  }

  function textRuns(): TextRun[] {
    const found: TextRun[] = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      if (!parent || !(node instanceof Text) || !node.data.trim()) continue;
      if (parent.closest("script, style, template, svg, noscript")) continue;
      if (isTooling(parent) || !isVisible(parent)) continue;
      found.push({ node, parent });
    }
    return found;
  }

  function visibleBox(
    element: Element,
    box: Box,
    clipBySelf = false,
  ): Box | null {
    const visible: Box = { ...box };
    if (styleOf(element).position !== "fixed") {
      for (
        let node = clipBySelf ? element : element.parentElement;
        node && node !== html && !node.hasAttribute("data-bt-layer");
        node = node.parentElement
      ) {
        const style = styleOf(node);
        if (style.overflowX !== "visible" || style.overflowY !== "visible") {
          const clip = node.getBoundingClientRect();
          if (style.overflowX !== "visible") {
            visible.left = Math.max(visible.left, clip.left);
            visible.right = Math.min(visible.right, clip.right);
          }
          if (style.overflowY !== "visible") {
            visible.top = Math.max(visible.top, clip.top);
            visible.bottom = Math.min(visible.bottom, clip.bottom);
          }
        }
        if (style.position === "fixed") break;
      }
    }
    return visible.right - visible.left > 0 && visible.bottom - visible.top > 0
      ? visible
      : null;
  }

  function layerOf(element: Element): Element | null {
    return element.closest("[data-bt-layer], .bt-sticky, [data-bt-float]");
  }

  /** The component owning the part `element` sits in, or `null` when its nearest marker is a component. */
  function partOwnerOf(element: Element): Element | null {
    for (let node: Element | null = element; node; node = node.parentElement) {
      if (node.hasAttribute("data-bt-part"))
        return node.parentElement?.closest("[data-bt]") ?? null;
      if (node.hasAttribute("data-bt")) return null;
    }
    return null;
  }

  function alphaOf(color: string): number {
    if (color === "transparent") return 0;
    const modern = /\/\s*([\d.]+)(%?)\s*\)$/.exec(color);
    if (modern?.[1]) return Number(modern[1]) / (modern[2] === "%" ? 100 : 1);
    const legacy = /^rgba\((?:[^,]+,){3}\s*([\d.]+)\s*\)$/.exec(color);
    return legacy?.[1] ? Number(legacy[1]) : 1;
  }

  function isPainted(element: Element): boolean {
    const style = styleOf(element);
    const borders: readonly (readonly [string, string])[] = [
      [style.borderTopWidth, style.borderTopColor],
      [style.borderRightWidth, style.borderRightColor],
      [style.borderBottomWidth, style.borderBottomColor],
      [style.borderLeftWidth, style.borderLeftColor],
    ];
    return (
      alphaOf(style.backgroundColor) > 0 ||
      style.backgroundImage !== "none" ||
      style.boxShadow !== "none" ||
      (style.backdropFilter !== "" && style.backdropFilter !== "none") ||
      borders.some(
        ([width, color]) => Number.parseFloat(width) > 0 && alphaOf(color) > 0,
      )
    );
  }

  function px(value: number): string {
    return `${String(Math.round(value * 10) / 10)}px`;
  }

  /** The element a run of text lays out in: its nearest ancestor that isn't inline. */
  function blockOf(element: Element): Element {
    let block = element;
    while (isInline(block) && block.parentElement) block = block.parentElement;
    return block;
  }

  /** How far below the top of `element`'s glyph boxes its capitals start: its font's ascent less its cap height. */
  function capInset(element: Element): number {
    inkContext ??= document.createElement("canvas").getContext("2d");
    if (!inkContext) return 0;
    const { fontStyle, fontWeight, fontSize, fontFamily } = styleOf(element);
    inkContext.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
    const metrics = inkContext.measureText("H");
    return Math.max(
      0,
      metrics.fontBoundingBoxAscent - metrics.actualBoundingBoxAscent,
    );
  }

  /** A text node's glyph boxes (its font's ascent to descent), one per line fragment, kept to what shows. */
  function inkBoxes(run: TextRun): Box[] {
    const range = document.createRange();
    range.selectNodeContents(run.node);
    const boxes: Box[] = [];
    for (const rect of range.getClientRects()) {
      if (rect.width < 0.5 || rect.height < 0.5) continue;
      const box = visibleBox(run.parent, toBox(rect), true);
      if (box) boxes.push(box);
    }
    return boxes;
  }

  /** Whether `a` or `b` is placed out of the flow below the element holding both: a badge, an overlay, a sticky bar. */
  function placedApart(a: Element, b: Element): boolean {
    let common = a.parentElement;
    while (common && !common.contains(b)) common = common.parentElement;
    for (const start of [a, b]) {
      for (
        let node: Element | null = start;
        node && node !== common;
        node = node.parentElement
      ) {
        const { position } = styleOf(node);
        if (
          position === "absolute" ||
          position === "fixed" ||
          position === "sticky"
        )
          return true;
      }
    }
    return false;
  }

  function check(options: LayoutCheckOptions): LayoutViolation[] {
    styles = new Map();
    const allRules: readonly LayoutRule[] = [
      "overlap",
      "overflow",
      "clipping",
      "scale",
      "target-size",
      "viewport-fit",
      "layering",
      "reach",
      "emphasis",
      "crowding",
      "wrapping",
      "alignment",
    ];
    const enabled = new Set(options.rules ?? allRules);
    const { tokens } = options;
    const violations: LayoutViolation[] = [];
    const viewportWidth = html.clientWidth;
    const viewportHeight = html.clientHeight;
    const textRules: readonly LayoutRule[] = [
      "overlap",
      "clipping",
      "crowding",
      "wrapping",
    ];
    const runs = textRules.some((rule) => enabled.has(rule)) ? textRuns() : [];

    function report(violation: LayoutViolation): void {
      violations.push(violation);
    }

    if (enabled.has("overlap")) {
      const measured: Measured[] = [];
      for (const element of document.querySelectorAll(
        "[data-bt], [data-bt-part]",
      )) {
        if (element.matches(LAYER_FURNITURE)) continue;
        if (element.getAttribute("data-bt-part") === "lane") continue;
        if (isTooling(element) || !isVisible(element)) continue;
        const box = visibleBox(element, toBox(element.getBoundingClientRect()));
        if (!box) continue;
        measured.push({
          element,
          box,
          layer: layerOf(element),
          partOwner: partOwnerOf(element),
        });
      }
      for (const run of runs) {
        const layer = layerOf(run.parent);
        const partOwner = partOwnerOf(run.parent);
        for (const line of lineBoxes(run)) {
          const box = visibleBox(run.parent, line, true);
          if (box)
            measured.push({ element: run.parent, box, layer, partOwner });
        }
      }
      measured.sort((a, b) => a.box.left - b.box.left);
      const seen = new Set<string>();
      for (let i = 0; i < measured.length; i += 1) {
        const a = measured[i];
        if (!a) continue;
        for (let j = i + 1; j < measured.length; j += 1) {
          const b = measured[j];
          if (!b) continue;
          if (b.box.left >= a.box.right) break;
          if (a.layer !== b.layer) continue;
          if (a.element.contains(b.element) || b.element.contains(a.element))
            continue;
          if (
            a.partOwner?.contains(b.element) ||
            b.partOwner?.contains(a.element)
          ) {
            continue;
          }
          if (
            a.element.closest("[data-bt-allow-overlap]") ||
            b.element.closest("[data-bt-allow-overlap]")
          ) {
            continue;
          }
          const width =
            Math.min(a.box.right, b.box.right) -
            Math.max(a.box.left, b.box.left);
          const height =
            Math.min(a.box.bottom, b.box.bottom) -
            Math.max(a.box.top, b.box.top);
          if (width <= 1 || height <= 1) continue;
          const first = selectorFor(a.element);
          const second = selectorFor(b.element);
          const key = [first, second].sort().join("|");
          if (seen.has(key)) continue;
          seen.add(key);
          report({
            rule: "overlap",
            a: first,
            b: second,
            px: Math.round(Math.min(width, height)),
            message: `overlaps ${second} by ${px(width)} × ${px(height)}`,
            fix: "Lay them out with Stack, Inline or Grid and a gap, or move extra items into OverflowCluster. If the overlap is intended (artwork, a close button over media), mark the container data-bt-allow-overlap.",
          });
        }
      }

      const laneItems = [
        ...document.querySelectorAll('[data-bt-part="lane"] > *'),
      ].filter((item) => !isTooling(item) && isVisible(item));
      const chromeControls =
        laneItems.length === 0
          ? []
          : [...document.querySelectorAll(INTERACTIVE)].filter(
              (control) =>
                control.closest(PAGE_CHROME) !== null &&
                control.closest("[data-bt-layer]") === null &&
                isVisible(control),
            );
      for (const item of laneItems) {
        const box = toBox(item.getBoundingClientRect());
        for (const control of chromeControls) {
          const target = visibleBox(
            control,
            toBox(control.getBoundingClientRect()),
          );
          if (!target) continue;
          const width =
            Math.min(box.right, target.right) - Math.max(box.left, target.left);
          const height =
            Math.min(box.bottom, target.bottom) - Math.max(box.top, target.top);
          if (width <= 1 || height <= 1) continue;
          const covered = selectorFor(control);
          report({
            rule: "overlap",
            a: selectorFor(item),
            b: covered,
            px: Math.round(Math.min(width, height)),
            message: `floating UI covers ${covered} in the page's header or navigation`,
            fix: "Floating lanes keep clear of Sticky bars and of elements registered with useFloatingObstacle. Make the header a Sticky or register it as an obstacle, so notices and toasts sit beside its controls instead of over them.",
          });
        }
      }
    }

    if (enabled.has("overflow")) {
      const skippedTags = new Set([
        "INPUT",
        "TEXTAREA",
        "SELECT",
        "IMG",
        "VIDEO",
        "CANVAS",
        "IFRAME",
        "OBJECT",
        "EMBED",
        "PICTURE",
      ]);
      /** A box with opacity 0 draws nothing, nor does anything inside it, so it can't overflow. */
      const transparent = (style: CSSStyleDeclaration): boolean =>
        Number(style.opacity) === 0;
      const hiddenWithin = (node: Element, container: Element): boolean => {
        for (
          let current: Element | null = node;
          current && current !== container;
          current = current.parentElement
        ) {
          const style = styleOf(current);
          if (
            style.overflowX !== "visible" ||
            style.overflowY !== "visible" ||
            style.position === "fixed" ||
            transparent(style) ||
            current.hasAttribute("data-bt-hit") ||
            current.hasAttribute("data-bt-allow-overlap")
          ) {
            return true;
          }
        }
        return false;
      };
      const hasTrimmedAncestor = (
        node: Element,
        container: Element,
      ): boolean => {
        for (
          let current = node.parentElement;
          current;
          current = current.parentElement
        ) {
          if (isTrimmed(current)) return true;
          if (current === container) break;
        }
        return false;
      };
      const extentOf = (
        element: Element,
      ): { right: number; bottom: number } => {
        let right = Number.NEGATIVE_INFINITY;
        let bottom = Number.NEGATIVE_INFINITY;
        const visit = (node: Element): void => {
          for (const child of node.children) {
            if (
              child.hasAttribute("data-bt-hit") ||
              child.hasAttribute("data-bt-allow-overlap") ||
              child.hasAttribute("data-bt-float")
            ) {
              continue;
            }
            const style = styleOf(child);
            if (
              style.display === "none" ||
              style.position === "fixed" ||
              transparent(style)
            ) {
              continue;
            }
            const box = child.getBoundingClientRect();
            if (box.width > 0 || box.height > 0) {
              right = Math.max(right, box.right);
              const insideTrimmedText =
                style.display === "inline" &&
                hasTrimmedAncestor(child, element);
              if (!insideTrimmedText) bottom = Math.max(bottom, box.bottom);
            }
            const clips =
              style.overflowX !== "visible" || style.overflowY !== "visible";
            if (!clips && child.tagName.toLowerCase() !== "svg") visit(child);
          }
        };
        visit(element);
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const parent = node.parentElement;
          if (!parent || !node.textContent?.trim()) continue;
          if (parent !== element && hiddenWithin(parent, element)) continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          const box = range.getBoundingClientRect();
          if (box.width === 0 && box.height === 0) continue;
          right = Math.max(right, box.right);
          const trimmed =
            isTrimmed(parent) || hasTrimmedAncestor(parent, element);
          if (!trimmed) bottom = Math.max(bottom, box.bottom);
        }
        return { right, bottom };
      };
      const overflowing: { element: Element; wide: number; tall: number }[] =
        [];
      for (const element of document.body.querySelectorAll("*")) {
        if (skippedTags.has(element.tagName) || element.closest("svg"))
          continue;
        if (isTooling(element)) continue;
        if (
          element.closest(
            "[data-bt-truncate], [data-bt-clip], [data-bt-allow-overlap]",
          )
        ) {
          continue;
        }
        const style = styleOf(element);
        if (
          style.display === "inline" ||
          style.display === "contents" ||
          style.display === "none"
        ) {
          continue;
        }
        const scrollsWide =
          style.overflowX === "visible" &&
          element.scrollWidth > element.clientWidth + 1;
        const scrollsTall =
          style.overflowY === "visible" &&
          element.scrollHeight > element.clientHeight + 1;
        if (!scrollsWide && !scrollsTall) continue;
        if (!isVisible(element) || withinVisuallyHidden(element)) continue;
        const rect = element.getBoundingClientRect();
        const extent = extentOf(element);
        const wide = scrollsWide
          ? extent.right -
            (rect.right - Number.parseFloat(style.borderRightWidth))
          : 0;
        const tall = scrollsTall
          ? extent.bottom -
            (rect.bottom - Number.parseFloat(style.borderBottomWidth))
          : 0;
        if (wide <= 1 && tall <= 1) continue;
        overflowing.push({ element, wide, tall });
      }
      for (const item of overflowing) {
        const containsAnother = overflowing.some(
          (other) => other !== item && item.element.contains(other.element),
        );
        if (containsAnother) continue;
        const axis =
          item.wide > 1 && item.tall > 1
            ? "width and height"
            : item.wide > 1
              ? "width"
              : "height";
        const excess = Math.max(item.wide, item.tall);
        report({
          rule: "overflow",
          a: selectorFor(item.element),
          px: Math.round(excess),
          message: `content overflows its ${axis} by ${px(excess)}`,
          fix: "Give it room, let it shrink (min-width: 0 comes with Stack, Inline and Grid), wrap the text, or truncate it with <Text truncate>.",
        });
      }
      if (html.scrollWidth > html.clientWidth + 1) {
        report({
          rule: "overflow",
          a: "html",
          px: html.scrollWidth - html.clientWidth,
          message: `the page scrolls sideways by ${px(html.scrollWidth - html.clientWidth)}`,
          fix: "Something is wider than the viewport; fix the overflow violations above, or let the widest element shrink.",
        });
      }
    }

    if (enabled.has("clipping")) {
      for (const element of document.body.querySelectorAll("*")) {
        if (isTooling(element)) continue;
        const style = styleOf(element);
        const ellipsized =
          style.textOverflow === "ellipsis" &&
          style.overflowX !== "visible" &&
          element.scrollWidth > element.clientWidth + 1;
        const clamped =
          style.getPropertyValue("-webkit-line-clamp") !== "none" &&
          style.getPropertyValue("-webkit-line-clamp") !== "" &&
          element.scrollHeight > element.clientHeight + 1;
        if (!ellipsized && !clamped) continue;
        if (!isVisible(element)) continue;
        const declared = element.hasAttribute("data-bt-truncate");
        const holder = element.parentElement?.closest(INTERACTIVE) ?? null;
        const titled = [element, holder].some(
          (candidate) =>
            candidate !== null &&
            (Boolean(candidate.getAttribute("title")?.trim()) ||
              candidate.hasAttribute("data-bt-tooltip")),
        );
        if (declared && titled) continue;
        report({
          rule: "clipping",
          a: selectorFor(element),
          message: declared
            ? "is truncated, but its full text isn't in a title or tooltip"
            : "is truncated without declaring it",
          fix: "Truncated text needs data-bt-truncate and its full text in a title or Tooltip, on the text or the control around it; <Text truncate> does both. Or give the text room.",
        });
      }

      const cutOff = new Set<Element>();
      for (const run of runs) {
        if (cutOff.has(run.parent)) continue;
        if (run.parent.closest("[data-bt-clip], [data-bt-truncate]")) continue;
        const lines = lineBoxes(run);
        let cut: { readonly by: Element; readonly excess: number } | null =
          null;
        for (
          let container: Element | null = run.parent;
          container &&
          container !== html &&
          !container.hasAttribute("data-bt-layer");
          container = container.parentElement
        ) {
          const style = styleOf(container);
          const hidesAcross =
            style.overflowX === "hidden" || style.overflowX === "clip";
          const hidesDown =
            style.overflowY === "hidden" || style.overflowY === "clip";
          if ((hidesAcross || hidesDown) && style.textOverflow !== "ellipsis") {
            if (container.clientWidth <= 2 || container.clientHeight <= 2)
              break;
            const rect = container.getBoundingClientRect();
            const left = rect.left + container.clientLeft;
            const top = rect.top + container.clientTop;
            const right = left + container.clientWidth;
            const bottom = top + container.clientHeight;
            for (const line of lines) {
              const across = hidesAcross
                ? Math.max(left - line.left, line.right - right)
                : 0;
              const down = hidesDown
                ? Math.max(top - line.top, line.bottom - bottom)
                : 0;
              const excess = Math.max(across, down);
              if (excess > 1 && excess > (cut?.excess ?? 0))
                cut = { by: container, excess };
            }
            if (cut) break;
          }
          const scrolls = [style.overflowX, style.overflowY].some(
            (overflow) => overflow === "auto" || overflow === "scroll",
          );
          if (scrolls || style.position === "fixed") break;
        }
        if (!cut) continue;
        cutOff.add(run.parent);
        const by = cut.by === run.parent ? null : selectorFor(cut.by);
        report({
          rule: "clipping",
          a: selectorFor(run.parent),
          ...(by === null ? {} : { b: by }),
          px: Math.round(cut.excess),
          message:
            by === null
              ? `text is cut off by ${px(cut.excess)} with no ellipsis`
              : `text is cut off by ${px(cut.excess)} with no ellipsis where ${by} hides its overflow`,
          fix: "Text is never cut off: give it room, let it wrap, or truncate it with <Text truncate>, which adds an ellipsis and keeps the full text in a title. Mark an intended clip (a bleed visual, the stage) with data-bt-clip.",
        });
      }
    }

    if (enabled.has("scale")) {
      const scale = new Set([1, ...tokens.space]);
      const onScale = (value: number): boolean =>
        [...scale].some((step) => Math.abs(step - value) < 0.5);
      const nearest = (value: number): string => {
        const steps = [...tokens.space].sort((a, b) => a - b);
        const below = steps.filter((step) => step <= value).at(-1);
        const above = steps.find((step) => step >= value);
        return [below, above]
          .filter((step): step is number => step !== undefined)
          .map((step) => px(step))
          .join(" or ");
      };
      for (const element of document.querySelectorAll("[data-bt]")) {
        if (isTooling(element) || !isVisible(element)) continue;
        const style = styleOf(element);
        // A Container's side padding centers its column: half the room the page width leaves, not a gap.
        const centers = element.getAttribute("data-bt") === "Container";
        const checks: [string, string][] = [
          ["padding-top", style.paddingTop],
          ["padding-bottom", style.paddingBottom],
          ...(centers
            ? []
            : ([
                ["padding-right", style.paddingRight],
                ["padding-left", style.paddingLeft],
              ] satisfies [string, string][])),
        ];
        if (/flex|grid/.test(style.display)) {
          if (style.rowGap !== "normal") checks.push(["row-gap", style.rowGap]);
          if (style.columnGap !== "normal")
            checks.push(["column-gap", style.columnGap]);
        }
        for (const [property, raw] of checks) {
          const value = Number.parseFloat(raw);
          if (Number.isNaN(value) || onScale(value)) continue;
          report({
            rule: "scale",
            a: selectorFor(element),
            px: Math.round(value * 10) / 10,
            message: `${property} is ${px(value)}, which isn't on the spacing scale`,
            fix: `Use a spacing step: gap={n} or pad={n} on a primitive, or var(--bt-space-*) in CSS. Nearest: ${nearest(value)}.`,
          });
        }
        if (element.hasAttribute("data-bt-control")) {
          const height =
            element.getBoundingClientRect().height / drawnScale(element);
          const allowed = tokens.heightVars
            .map((name) => Number.parseFloat(style.getPropertyValue(name)))
            .filter((value) => !Number.isNaN(value));
          if (!allowed.some((value) => Math.abs(value - height) < 0.5)) {
            report({
              rule: "scale",
              a: selectorFor(element),
              px: Math.round(height * 10) / 10,
              message: `control is ${px(height)} tall, which isn't a control height`,
              fix: `Size controls with a height token (${tokens.heightVars.join(", ")}), usually through the component's size prop.`,
            });
          }
        }
      }
    }

    if (enabled.has("target-size")) {
      const inSentence = (link: Element): boolean => {
        let block = link.parentElement;
        while (block && isInline(block)) block = block.parentElement;
        const own = link.textContent.trim().length;
        const around = block?.textContent.trim().length ?? 0;
        return around > own;
      };
      for (const element of document.querySelectorAll(INTERACTIVE)) {
        if (isTooling(element)) continue;
        if (element.matches(":disabled, [aria-disabled=true]")) continue;
        // Tab panels, dialogs and focusable scroll regions take focus for keyboards, but no one taps them.
        if (element.matches(FOCUS_CONTAINERS)) continue;
        if (
          !element.matches(INTERACTIVE_WITHOUT_TABINDEX) &&
          ["auto", "scroll"].includes(styleOf(element).overflowY)
        ) {
          continue;
        }
        if (element.closest('[data-bt-target="group"]')) continue;
        // Screen-reader-only targets, such as a toast region's focus proxies, are reached by keyboard only.
        if (isVisuallyHidden(element)) continue;
        if (!isVisible(element)) continue;
        if (
          element.tagName === "A" &&
          styleOf(element).display === "inline" &&
          inSentence(element)
        ) {
          continue;
        }
        const factor = drawnScale(element);
        const rect = element.getBoundingClientRect();
        let width = rect.width / factor;
        let height = rect.height / factor;
        const hit = element.querySelector("[data-bt-hit]");
        if (hit) {
          const area = hit.getBoundingClientRect();
          width = Math.max(width, area.width / factor);
          height = Math.max(height, area.height / factor);
        }
        if (element instanceof HTMLInputElement && element.labels) {
          for (const label of element.labels) {
            const area = label.getBoundingClientRect();
            width = Math.max(width, area.width / factor);
            height = Math.max(height, area.height / factor);
          }
        }
        if (width < 23.5 || height < 23.5) {
          report({
            rule: "target-size",
            a: selectorFor(element),
            px: Math.round(Math.min(width, height)),
            message: `hit area is ${px(width)} × ${px(height)}, under 24 × 24`,
            fix: "Make the hit area at least 24 × 24: use a 28px or larger control size, or give small visuals a [data-bt-hit] child that extends the target without changing layout. Only links inside a sentence can be smaller.",
          });
          continue;
        }
        // A segment, tab, menu item or option is a <button> with an item's role: part of a control, not a standalone button.
        const role = element.getAttribute("role");
        const isButton =
          role === "button" ||
          (element.tagName === "BUTTON" && !ITEM_ROLES.has(role ?? ""));
        if (isButton && !hit && rect.height / factor < 27.5) {
          report({
            rule: "target-size",
            a: selectorFor(element),
            px: Math.round(rect.height / factor),
            message: `standalone button is ${px(rect.height / factor)} tall, under 28`,
            fix: 'Standalone buttons are at least 28 tall: use size "sm" (28) or larger. Small inline actions like chips get a [data-bt-hit] child instead.',
          });
        }
      }
    }

    if (enabled.has("reach")) {
      const pinned = (element: Element): Element | null => {
        for (
          let node: Element | null = element;
          node && node !== html;
          node = node.parentElement
        ) {
          const { position } = styleOf(node);
          if (position === "sticky" || position === "fixed") return node;
        }
        return null;
      };
      const pastViewport = (top: number, bottom: number): number =>
        Math.max(bottom - viewportHeight, -top, 0);
      // A child with display: contents has no box of its own, so its children stand in for it.
      const contentBoxes = (parent: Element): DOMRect[] =>
        [...parent.children].flatMap((child) => {
          const childStyle = styleOf(child);
          if (childStyle.position === "fixed") return [];
          if (childStyle.display === "contents") return contentBoxes(child);
          return child.getClientRects().length > 0
            ? [child.getBoundingClientRect()]
            : [];
        });
      for (const element of document.body.querySelectorAll("*")) {
        if (isTooling(element) || element.closest(LAYER_FURNITURE)) continue;
        const style = styleOf(element);
        if (style.display === "none" || !isVisible(element)) continue;
        const rect = element.getBoundingClientRect();
        if (rect.height < 1) continue;
        const stickTop = Number.parseFloat(style.top);
        const stickBottom = Number.parseFloat(style.bottom);
        // A box that sticks only sideways, such as a table's first column, still scrolls with the page.
        const staysPut =
          style.position === "fixed" ||
          (style.position === "sticky" &&
            !(Number.isNaN(stickTop) && Number.isNaN(stickBottom)));
        if (staysPut) {
          let top = rect.top;
          if (style.position === "sticky") {
            if (!Number.isNaN(stickTop)) top = stickTop;
            else if (!Number.isNaN(stickBottom))
              top = viewportHeight - stickBottom - rect.height;
          }
          const past = pastViewport(top, top + rect.height);
          if (past > 1) {
            report({
              rule: "reach",
              a: selectorFor(element),
              px: Math.round(past),
              message: `this ${style.position} box runs ${px(past)} past the viewport where it stays put, so no one can scroll to its end`,
              fix: 'Cap its height to the space it has and let it scroll inside. <Sticky variant="aside"> does that for sidebars: max-block-size: calc(100dvh - var(--bt-sticky-top) - var(--bt-sticky-bottom)) with overflow-y: auto.',
            });
            continue;
          }
        }
        const scrollsY =
          style.overflowY === "auto" || style.overflowY === "scroll";
        const scrollsX =
          style.overflowX === "auto" || style.overflowX === "scroll";
        if (scrollsY || scrollsX) {
          const originTop =
            rect.top +
            Number.parseFloat(style.borderTopWidth) -
            element.scrollTop;
          const originLeft =
            rect.left +
            Number.parseFloat(style.borderLeftWidth) -
            element.scrollLeft;
          // Reversed flows scroll from their far end, where overflowing content is still reachable.
          const flex = style.display.includes("flex");
          const checksY =
            scrollsY && !(flex && style.flexDirection === "column-reverse");
          const checksX =
            scrollsX &&
            style.direction !== "rtl" &&
            !(flex && style.flexDirection === "row-reverse");
          let before = 0;
          for (const box of contentBoxes(element)) {
            if (checksY) before = Math.max(before, originTop - box.top);
            if (checksX) before = Math.max(before, originLeft - box.left);
          }
          if (before > 1) {
            report({
              rule: "reach",
              a: selectorFor(element),
              px: Math.round(before),
              message: `its content starts ${px(before)} before the point this scroll area can scroll back to, so that part can't be reached`,
              fix: "Don't center or end-align content that can overflow a scroll area (align-items: center, justify-content: center or end push it past the start). Align it to the start, or use margin-block: auto on the content instead.",
            });
            continue;
          }
        }
        const scrolls =
          scrollsY && element.scrollHeight > element.clientHeight + 1;
        if (!scrolls || style.overscrollBehaviorY === "auto") continue;
        if (!pinned(element)) continue;
        const hidden = pastViewport(rect.top, rect.bottom);
        if (hidden > 1) {
          report({
            rule: "reach",
            a: selectorFor(element),
            px: Math.round(hidden),
            message: `this scroll area stays put and runs ${px(hidden)} past the viewport, and overscroll-behavior keeps the page from scrolling to its end`,
            fix: 'Keep a contained scroll area inside the viewport: put a sidebar in <Sticky variant="aside"> under a sticky header so it starts where it sticks, or size the shell to 100dvh.',
          });
        }
      }
    }

    if (enabled.has("viewport-fit")) {
      const surfaces = [
        ...document.querySelectorAll("[data-bt-layer] *, [data-bt-float]"),
      ].filter(
        (element) =>
          !element.matches(LAYER_FURNITURE) &&
          !isTooling(element) &&
          isVisible(element) &&
          isPainted(element),
      );
      const painted = new Set(surfaces);
      for (const element of surfaces) {
        let outermost = true;
        for (
          let node = element.parentElement;
          node && !node.hasAttribute("data-bt-layer");
          node = node.parentElement
        ) {
          if (painted.has(node)) {
            outermost = false;
            break;
          }
        }
        if (!outermost) continue;
        const box = visibleBox(element, toBox(element.getBoundingClientRect()));
        if (!box) continue;
        const distance = Math.min(
          box.left,
          box.top,
          viewportWidth - box.right,
          viewportHeight - box.bottom,
        );
        if (distance >= 7.5) continue;
        report({
          rule: "viewport-fit",
          a: selectorFor(element),
          px: Math.round(8 - distance),
          message:
            distance < 0
              ? `floating surface runs ${px(-distance)} past the viewport edge (keep it 8px inside)`
              : `floating surface is ${px(distance)} from the viewport edge, under 8px`,
          fix: "Keep floating UI 8px inside the viewport: Popover does it with collision padding; cap other floating surfaces with min(their size, 100% - 16px).",
        });
      }
    }

    if (enabled.has("layering")) {
      const allowed = new Set(tokens.zIndex.map(String));
      for (const element of document.querySelectorAll("*")) {
        if (isTooling(element)) continue;
        const { zIndex } = styleOf(element);
        if (zIndex === "auto" || allowed.has(zIndex)) continue;
        report({
          rule: "layering",
          a: selectorFor(element),
          message: `z-index ${zIndex} isn't a z token`,
          fix: "Use a z token, such as var(--bt-z-dropdown), or render the element in a Layer, which picks the band for you.",
        });
      }
    }

    if (enabled.has("emphasis")) {
      const regions = new Map<Element, Element[]>();
      for (const button of document.querySelectorAll(
        '[data-bt="Button"][data-variant="primary"], [data-bt="IconButton"][data-variant="primary"]',
      )) {
        if (isTooling(button) || !isVisible(button)) continue;
        const region = button.closest('[data-bt-region], [role="dialog"]');
        if (!region) continue;
        regions.set(region, [...(regions.get(region) ?? []), button]);
      }
      for (const [region, buttons] of regions) {
        if (buttons.length < 2) continue;
        const names = buttons
          .map((button) =>
            (button.getAttribute("aria-label") ?? button.textContent).trim(),
          )
          .map((name) => `"${name}"`)
          .join(", ");
        report({
          rule: "emphasis",
          a: selectorFor(region),
          message: `${String(buttons.length)} primary buttons in one region: ${names}`,
          fix: "Keep one primary button per region (a page header, a section, a dialog, a panel, a plan); make the others secondary, ghost or a link.",
        });
      }
    }

    if (enabled.has("crowding")) {
      interface TextBlock {
        box: Box;
        capTop: number;
      }
      const blocks = new Map<Element, TextBlock>();
      for (const run of runs) {
        if (run.parent.closest("[data-bt-allow-overlap]")) continue;
        const block = blockOf(run.parent);
        const inset = capInset(run.parent) * drawnScale(run.parent);
        for (const box of inkBoxes(run)) {
          const known = blocks.get(block);
          blocks.set(
            block,
            known
              ? {
                  box: {
                    left: Math.min(known.box.left, box.left),
                    top: Math.min(known.box.top, box.top),
                    right: Math.max(known.box.right, box.right),
                    bottom: Math.max(known.box.bottom, box.bottom),
                  },
                  capTop: Math.min(known.capTop, box.top + inset),
                }
              : { box, capTop: box.top + inset },
          );
        }
      }
      const texts = [...blocks].map(([element, { box, capTop }]) => ({
        element,
        box,
        capTop,
        layer: layerOf(element),
      }));
      for (const upper of texts) {
        for (const lower of texts) {
          if (lower === upper || lower.layer !== upper.layer) continue;
          if (
            upper.element.contains(lower.element) ||
            lower.element.contains(upper.element)
          )
            continue;
          if (lower.box.top <= upper.box.top) continue;
          // From the bottom of the upper text's descenders to the top of the lower text's capitals.
          const room =
            (lower.capTop - upper.box.bottom) / drawnScale(upper.element);
          if (room >= 2 || room < -12) continue;
          const across =
            Math.min(upper.box.right, lower.box.right) -
            Math.max(upper.box.left, lower.box.left);
          const narrower = Math.min(
            upper.box.right - upper.box.left,
            lower.box.right - lower.box.left,
          );
          if (across < 0.3 * narrower) continue;
          if (placedApart(upper.element, lower.element)) continue;
          report({
            rule: "crowding",
            a: selectorFor(upper.element),
            b: selectorFor(lower.element),
            px: Math.round((2 - room) * 10) / 10,
            message: `text leaves ${px(room)} between its descenders and the capitals of the text under it`,
            fix: "Put at least 8px between stacked text up to 16px, and 12px under a larger title (the Heading ↔ body relationship), or stack it with TextStack, whose gaps clear descenders.",
          });
        }
      }
    }

    if (enabled.has("wrapping")) {
      for (const run of runs) {
        if (run.parent.closest("[data-bt-truncate]")) continue;
        const range = document.createRange();
        range.selectNodeContents(run.node);
        const lines = [...range.getClientRects()].filter(
          (rect) => rect.width > 0.5,
        );
        const first = lines[0];
        if (
          !first ||
          lines.every((rect) => Math.abs(rect.top - first.top) <= 2)
        )
          continue;
        const block = blockOf(run.parent);
        const blockStyle = styleOf(block);
        const room =
          block.clientWidth -
          Number.parseFloat(blockStyle.paddingLeft) -
          Number.parseFloat(blockStyle.paddingRight);
        for (const match of run.node.data.matchAll(/[\p{L}\p{N}_]{2,}/gu)) {
          const start = match.index;
          range.setStart(run.node, start);
          range.setEnd(run.node, start + match[0].length);
          const pieces = [...range.getClientRects()].filter(
            (rect) => rect.width > 0.5,
          );
          const head = pieces[0];
          if (
            !head ||
            pieces.every((rect) => Math.abs(rect.top - head.top) <= 2)
          )
            continue;
          const width = pieces.reduce((sum, rect) => sum + rect.width, 0);
          // A long address or hash wider than its box has to break; a short word never does, however the
          // box was squeezed, because a column cut down to it is what's wrong.
          if (width > room && match[0].length > 12) continue;
          report({
            rule: "wrapping",
            a: selectorFor(block),
            px: Math.round(width),
            message:
              width > room
                ? `"${match[0]}" breaks across lines in a box squeezed to ${px(room)}, narrower than the word`
                : `"${match[0]}" breaks across lines, though at ${px(width)} it fits on one`,
            fix: "Let text wrap between words: drop word-break: break-all and overflow-wrap: anywhere, give the column room for its longest word (a min-width, or let the table scroll sideways), or truncate it with data-bt-truncate and a title.",
          });
          break;
        }
      }
    }

    if (enabled.has("alignment")) {
      const controls = [
        ...document.querySelectorAll("[data-bt-control]"),
      ].filter(
        (element) =>
          !isTooling(element) &&
          isVisible(element) &&
          visibleBox(element, toBox(element.getBoundingClientRect())) !== null,
      );
      const outermost = controls.filter(
        (element) =>
          !controls.some(
            (other) => other !== element && other.contains(element),
          ),
      );
      for (let i = 0; i < outermost.length; i += 1) {
        const first = outermost[i];
        if (!first) continue;
        const a = first.getBoundingClientRect();
        for (let j = i + 1; j < outermost.length; j += 1) {
          const second = outermost[j];
          if (!second || layerOf(first) !== layerOf(second)) continue;
          const b = second.getBoundingClientRect();
          if (Math.abs(a.height - b.height) > 2) continue;
          const shared = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (shared < 0.3 * Math.min(a.height, b.height)) continue;
          if (Math.min(a.right, b.right) > Math.max(a.left, b.left)) continue;
          let common = first.parentElement;
          while (common && !common.contains(second))
            common = common.parentElement;
          if (!common) continue;
          // Fields in a row sit within two levels of it; controls deeper down belong to components of their own.
          const levels = (control: Element): number => {
            let count = 0;
            for (
              let node = control.parentElement;
              node && node !== common;
              node = node.parentElement
            )
              count += 1;
            return count;
          };
          if (levels(first) > 1 || levels(second) > 1) continue;
          const { display } = styleOf(common);
          if (!display.includes("grid") && !display.includes("flex")) continue;
          // Controls in two cards side by side follow their cards, which line up on their own terms.
          const inOwnSurface = (control: Element): boolean => {
            for (
              let node = control.parentElement;
              node && node !== common;
              node = node.parentElement
            )
              if (node.classList.contains("bt-surface")) return true;
            return false;
          };
          if (inOwnSurface(first) || inOwnSurface(second)) continue;
          const offset = (b.top - a.top) / drawnScale(first);
          if (Math.abs(offset) <= 1) continue;
          report({
            rule: "alignment",
            a: selectorFor(first),
            b: selectorFor(second),
            px: Math.round(Math.abs(offset) * 10) / 10,
            message: `two controls ${px(a.height)} tall side by side start ${px(Math.abs(offset))} apart`,
            fix: "Line up controls that share a row: label them alike (each in a Field, or none), or align the row to its controls (align-items: end).",
          });
        }
      }
    }

    return violations;
  }

  /** Where each buttery element is on screen, with the scroll offsets of every container around it. */
  function measurePositions(): Map<Element, Position> {
    const computed = new Map<Element, CSSStyleDeclaration>();
    const style = (element: Element): CSSStyleDeclaration => {
      let value = computed.get(element);
      if (!value) {
        value = getComputedStyle(element);
        computed.set(element, value);
      }
      return value;
    };
    const scrollsContent = (element: Element): boolean =>
      [style(element).overflowX, style(element).overflowY].some(
        (overflow) => overflow !== "visible" && overflow !== "clip",
      );
    const result = new Map<Element, Position>();
    for (const element of document.querySelectorAll("[data-bt]")) {
      const rect = element.getBoundingClientRect();
      const scrolls: ScrollOffset[] = [];
      let fixed = style(element).position === "fixed";
      for (
        let node = element.parentElement;
        node && node !== html && node !== document.body && !fixed;
        node = node.parentElement
      ) {
        // A popover's fixed wrapper follows its trigger, so a page scroll carries it along with the trigger.
        if (node.hasAttribute("data-radix-popper-content-wrapper")) break;
        if (scrollsContent(node))
          scrolls.push({
            container: node,
            x: node.scrollLeft,
            y: node.scrollTop,
          });
        fixed = style(node).position === "fixed";
      }
      if (!fixed)
        scrolls.push({ container: null, x: window.scrollX, y: window.scrollY });
      result.set(element, {
        x: rect.left,
        y: rect.top,
        empty: rect.width === 0 && rect.height === 0,
        scrolls,
      });
    }
    return result;
  }

  /**
   * How far an element moved, from the scroll container it moved least relative to: the screen, or a
   * container whose scrolling (and every one's outside it) is added back.
   */
  function movementOf(
    before: Position,
    after: Position,
  ): { dx: number; dy: number } {
    const size = (delta: { dx: number; dy: number }): number =>
      Math.max(Math.abs(delta.dx), Math.abs(delta.dy));
    let best = { dx: after.x - before.x, dy: after.y - before.y };
    const sameContainers =
      before.scrolls.length === after.scrolls.length &&
      before.scrolls.every(
        (offset, index) => offset.container === after.scrolls[index]?.container,
      );
    if (!sameContainers) return best;
    let scrolledX = 0;
    let scrolledY = 0;
    for (let index = after.scrolls.length - 1; index >= 0; index -= 1) {
      const was = before.scrolls[index];
      const is = after.scrolls[index];
      if (!was || !is) continue;
      scrolledX += is.x - was.x;
      scrolledY += is.y - was.y;
      const candidate = {
        dx: after.x - before.x + scrolledX,
        dy: after.y - before.y + scrolledY,
      };
      if (size(candidate) < size(best)) best = candidate;
    }
    return best;
  }

  function snapshot(): void {
    positions = measurePositions();
  }

  function moved({ allow = [], during }: MovedOptions): LayoutViolation[] {
    const allowed = allow.length > 0 ? allow.join(", ") : null;
    const now = measurePositions();
    const shifted: { element: Element; dx: number; dy: number }[] = [];
    for (const [element, before] of positions) {
      const after = now.get(element);
      if (!after) continue;
      // With no box before or after, it appeared or went: a list that was empty and hidden isn't a shift.
      if (before.empty || after.empty) continue;
      if (allowed && element.closest(allowed)) continue;
      if (element.closest('[data-bt="Loop"], [data-bt-layer="dev"]')) continue;
      const shift = movementOf(before, after);
      if (Math.max(Math.abs(shift.dx), Math.abs(shift.dy)) > 1)
        shifted.push({ element, ...shift });
    }
    return shifted
      .filter(
        (item) =>
          !shifted.some(
            (other) =>
              other !== item &&
              other.element.contains(item.element) &&
              Math.abs(other.dx - item.dx) < 1 &&
              Math.abs(other.dy - item.dy) < 1,
          ),
      )
      .map(({ element, dx, dy }) => ({
        rule: "stability",
        a: selectorFor(element),
        px: Math.round(Math.max(Math.abs(dx), Math.abs(dy))),
        message: `moved ${px(dx)} across and ${px(dy)} down ${during}`,
        fix: "Keep surrounding UI still: reserve space for loading states, swap labels inside fixed-width controls, and animate size changes with Morph or Motion layout instead of shifting siblings. If it's meant to move, list it in allowMove.",
      }));
  }

  return { check, snapshot, moved };
}

/** Checks the current document against buttery's layout rules and returns every violation. */
export function runLayoutChecks(
  options: LayoutCheckOptions,
): LayoutViolation[] {
  return createLayoutToolkit().check(options);
}
