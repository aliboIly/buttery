/** Rules the in-page checker runs. Accessibility and stability need a browser driver and run in `@buttery/test`. */
export type LayoutRule =
  | "overlap"
  | "overflow"
  | "clipping"
  | "scale"
  | "target-size"
  | "viewport-fit"
  | "layering";

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
    /** Offsets of the scroll containers around the element, nearest first, then the window's. */
    readonly scrolls: readonly ScrollOffset[];
  }

  interface TextRun {
    readonly node: Text;
    readonly parent: Element;
  }

  const html = document.documentElement;
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
    const lineHeight = Number.parseFloat(styleOf(parent).lineHeight);
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
            trimmed.bottom + inkDescent(node.data, parent),
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
    return element.closest("[data-bt-layer], .bt-sticky");
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
    ];
    const enabled = new Set(options.rules ?? allRules);
    const { tokens } = options;
    const violations: LayoutViolation[] = [];
    const viewportWidth = html.clientWidth;
    const viewportHeight = html.clientHeight;
    const runs =
      enabled.has("overlap") || enabled.has("clipping") ? textRuns() : [];

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
            current.hasAttribute("data-bt-hit")
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
            if (child.hasAttribute("data-bt-hit")) continue;
            const style = styleOf(child);
            if (style.display === "none" || style.position === "fixed")
              continue;
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
        if (element.closest("[data-bt-truncate], [data-bt-clip]")) continue;
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
        if (!isVisible(element)) continue;
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
        const checks: [string, string][] = [
          ["padding-top", style.paddingTop],
          ["padding-right", style.paddingRight],
          ["padding-bottom", style.paddingBottom],
          ["padding-left", style.paddingLeft],
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
          const height = element.getBoundingClientRect().height;
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
        if (!isVisible(element)) continue;
        if (
          element.tagName === "A" &&
          styleOf(element).display === "inline" &&
          inSentence(element)
        ) {
          continue;
        }
        const rect = element.getBoundingClientRect();
        let width = rect.width;
        let height = rect.height;
        const hit = element.querySelector("[data-bt-hit]");
        if (hit) {
          const area = hit.getBoundingClientRect();
          width = Math.max(width, area.width);
          height = Math.max(height, area.height);
        }
        if (element instanceof HTMLInputElement && element.labels) {
          for (const label of element.labels) {
            const area = label.getBoundingClientRect();
            width = Math.max(width, area.width);
            height = Math.max(height, area.height);
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
        const isButton =
          element.tagName === "BUTTON" ||
          element.getAttribute("role") === "button";
        if (isButton && !hit && rect.height < 27.5) {
          report({
            rule: "target-size",
            a: selectorFor(element),
            px: Math.round(rect.height),
            message: `standalone button is ${px(rect.height)} tall, under 28`,
            fix: 'Standalone buttons are at least 28 tall: use size "sm" (28) or larger. Small inline actions like chips get a [data-bt-hit] child instead.',
          });
        }
      }
    }

    if (enabled.has("viewport-fit")) {
      const surfaces = [
        ...document.querySelectorAll("[data-bt-layer] *"),
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
      result.set(element, { x: rect.left, y: rect.top, scrolls });
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
