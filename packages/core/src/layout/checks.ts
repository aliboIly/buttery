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
  readonly rule: ButteryRule;
  /** Selector of the offending element. */
  readonly a: string;
  /** Selector of the second element, for overlaps. */
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

export interface LayoutCheckOptions {
  readonly tokens: LayoutCheckTokens;
  /** Rules to run. Defaults to all of them. */
  readonly rules?: readonly LayoutRule[] | undefined;
}

/**
 * Checks the current document against buttery's layout rules and returns every violation. It's fully
 * self-contained (no imports or outer variables), so `expectButtery` can serialize it into a page with
 * Playwright and `LayoutGuard` can call it directly.
 */
export function runLayoutChecks(
  options: LayoutCheckOptions,
): LayoutViolation[] {
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
    readonly component: Element | null;
  }

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
  const html = document.documentElement;
  const viewportWidth = html.clientWidth;
  const viewportHeight = html.clientHeight;
  const styles = new Map<Element, CSSStyleDeclaration>();

  function styleOf(element: Element): CSSStyleDeclaration {
    let style = styles.get(element);
    if (!style) {
      style = getComputedStyle(element);
      styles.set(element, style);
    }
    return style;
  }

  function report(violation: LayoutViolation): void {
    violations.push(violation);
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

  function visibleBox(element: Element, rect: DOMRect): Box | null {
    const box: Box = {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
    };
    if (styleOf(element).position !== "fixed") {
      for (
        let node = element.parentElement;
        node && node !== html && !node.hasAttribute("data-bt-layer");
        node = node.parentElement
      ) {
        const style = styleOf(node);
        if (style.overflowX !== "visible" || style.overflowY !== "visible") {
          const clip = node.getBoundingClientRect();
          if (style.overflowX !== "visible") {
            box.left = Math.max(box.left, clip.left);
            box.right = Math.min(box.right, clip.right);
          }
          if (style.overflowY !== "visible") {
            box.top = Math.max(box.top, clip.top);
            box.bottom = Math.min(box.bottom, clip.bottom);
          }
        }
        if (style.position === "fixed") break;
      }
    }
    return box.right - box.left > 0 && box.bottom - box.top > 0 ? box : null;
  }

  function layerOf(element: Element): Element | null {
    return element.closest('[data-bt-layer], [data-bt="Sticky"]');
  }

  function componentOf(element: Element): Element | null {
    return element.closest("[data-bt]");
  }

  function px(value: number): string {
    return `${String(Math.round(value * 10) / 10)}px`;
  }

  if (enabled.has("overlap")) {
    const skip = new Set(["Layer", "Scrim", "FloatingLanes"]);
    const measured: Measured[] = [];
    for (const element of document.querySelectorAll(
      "[data-bt], [data-bt-part]",
    )) {
      const name = element.getAttribute("data-bt");
      if (name && skip.has(name)) continue;
      if (element.getAttribute("data-bt-part") === "lane") continue;
      if (!isVisible(element)) continue;
      const box = visibleBox(element, element.getBoundingClientRect());
      if (!box) continue;
      measured.push({
        element,
        box,
        layer: layerOf(element),
        component: componentOf(element),
      });
    }
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      if (!parent || !node.textContent?.trim()) continue;
      if (parent.closest("script, style, template, svg, noscript")) continue;
      if (!isVisible(parent)) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const box = visibleBox(parent, range.getBoundingClientRect());
      if (!box) continue;
      measured.push({
        element: parent,
        box,
        layer: layerOf(parent),
        component: componentOf(parent),
      });
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
        if (a.component && a.component === b.component) continue;
        if (
          a.element.closest("[data-bt-allow-overlap]") ||
          b.element.closest("[data-bt-allow-overlap]")
        ) {
          continue;
        }
        const width =
          Math.min(a.box.right, b.box.right) - Math.max(a.box.left, b.box.left);
        const height =
          Math.min(a.box.bottom, b.box.bottom) - Math.max(a.box.top, b.box.top);
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
    const overflowing: { element: Element; excess: number; axis: string }[] =
      [];
    const hitAreas = [
      ...document.querySelectorAll<HTMLElement>("[data-bt-hit]"),
    ].map((element) => ({
      element,
      display: element.style.getPropertyValue("display"),
    }));
    for (const { element } of hitAreas) {
      element.style.setProperty("display", "none");
    }
    for (const element of document.body.querySelectorAll("*")) {
      if (skippedTags.has(element.tagName) || element.closest("svg")) continue;
      if (element.closest("[data-bt-truncate], [data-bt-clip]")) continue;
      const style = styleOf(element);
      if (
        style.display === "inline" ||
        style.display === "contents" ||
        style.display === "none"
      ) {
        continue;
      }
      const wide =
        style.overflowX === "visible"
          ? element.scrollWidth - element.clientWidth
          : 0;
      let tall =
        style.overflowY === "visible"
          ? element.scrollHeight - element.clientHeight
          : 0;
      if (
        tall > 1 &&
        element instanceof HTMLElement &&
        style.getPropertyValue("text-box-trim") !== "none" &&
        style.getPropertyValue("text-box-trim") !== ""
      ) {
        const previous = element.style.getPropertyValue("text-box-trim");
        element.style.setProperty("text-box-trim", "none");
        tall = element.scrollHeight - element.clientHeight;
        if (previous) element.style.setProperty("text-box-trim", previous);
        else element.style.removeProperty("text-box-trim");
      }
      if (wide <= 1 && tall <= 1) continue;
      if (!isVisible(element)) continue;
      overflowing.push({
        element,
        excess: Math.max(wide, tall),
        axis: wide > 1 && tall > 1 ? "both" : wide > 1 ? "width" : "height",
      });
    }
    for (const { element, display } of hitAreas) {
      if (display) element.style.setProperty("display", display);
      else element.style.removeProperty("display");
    }
    for (const item of overflowing) {
      const containsAnother = overflowing.some(
        (other) => other !== item && item.element.contains(other.element),
      );
      if (containsAnother) continue;
      report({
        rule: "overflow",
        a: selectorFor(item.element),
        px: Math.round(item.excess),
        message: `content overflows its ${item.axis === "both" ? "width and height" : item.axis} by ${px(item.excess)}`,
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
      const holder =
        element.closest("button, a, [role], [data-bt-tooltip]") ?? element;
      const labelled = [element, holder].some(
        (candidate) =>
          Boolean(candidate.getAttribute("title")?.trim()) ||
          Boolean(candidate.getAttribute("aria-label")?.trim()) ||
          candidate.hasAttribute("data-bt-tooltip"),
      );
      if (declared && labelled) continue;
      report({
        rule: "clipping",
        a: selectorFor(element),
        message: declared
          ? "is truncated but its full text isn't available"
          : "is truncated without declaring it",
        fix: "Truncated text needs data-bt-truncate and its full text in a title or Tooltip; <Text truncate> does both. Or give the text room.",
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
      if (!isVisible(element)) continue;
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
    const interactive = [
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
    for (const element of document.querySelectorAll(interactive)) {
      if (element.matches(":disabled, [aria-disabled=true]")) continue;
      if (element.closest('[data-bt-target="group"]')) continue;
      if (!isVisible(element)) continue;
      const style = styleOf(element);
      if (element.tagName === "A" && style.display === "inline") continue;
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
          fix: "Make the hit area at least 24 × 24: use a 28px or larger control size, or give small visuals a [data-bt-hit] child that extends the target without changing layout.",
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
    const skip = new Set(["Layer", "Scrim", "FloatingLanes"]);
    for (const element of document.querySelectorAll(
      "[data-bt-layer] [data-bt]",
    )) {
      const name = element.getAttribute("data-bt");
      if (name && skip.has(name)) continue;
      if (element.closest('[data-bt-layer="dev"]')) continue;
      if (!isVisible(element)) continue;
      const box = visibleBox(element, element.getBoundingClientRect());
      if (!box) continue;
      const excess = Math.max(
        8 - box.left,
        8 - box.top,
        box.right - (viewportWidth - 8),
        box.bottom - (viewportHeight - 8),
      );
      if (excess <= 0.5) continue;
      report({
        rule: "viewport-fit",
        a: selectorFor(element),
        px: Math.round(excess),
        message: `floating UI comes within ${px(8 - excess)} of the viewport edge (keep 8px)`,
        fix: "Keep floating UI 8px inside the viewport: Popover does it with collision padding; cap other floating surfaces with min(their size, 100% - 16px).",
      });
    }
  }

  if (enabled.has("layering")) {
    const allowed = new Set(tokens.zIndex.map(String));
    for (const element of document.querySelectorAll("*")) {
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
