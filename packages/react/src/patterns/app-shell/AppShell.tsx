import {
  Layer,
  Scrim,
  cx,
  presencePresets,
  reducedPresence,
  useAnimationTracking,
  useControllableState,
  useMergedRefs,
  useMotionPreference,
} from "@buttery/core";
import { AnimatePresence, motion } from "motion/react";
import { Dialog, VisuallyHidden } from "radix-ui";
import { useLayoutEffect, useRef, useState } from "react";
import type {
  ComponentPropsWithRef,
  ReactElement,
  ReactNode,
  RefObject,
} from "react";
import { Button } from "../../components/button/Button.tsx";

/** Props for `AppShell`. */
export interface AppShellProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children"
> {
  /** The bar at the top of the work area, such as a `HeaderBar`. */
  readonly header: ReactNode;
  /** The settings beside the work area, such as an `Inspector`. On narrow screens it opens as a sheet. */
  readonly inspector: ReactNode;
  /** Names the inspector's sheet on narrow screens, such as "Card settings". */
  readonly inspectorLabel: string;
  /** The button that opens the sheet on narrow screens. Defaults to `"Edit"`. */
  readonly openInspectorLabel?: string | undefined;
  /** Whether the inspector's sheet is open on a narrow screen. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Whether the sheet starts open when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when the sheet opens or closes, including when the screen widens and the inspector moves back beside the stage. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** The work area, such as a `Stage`. */
  readonly children: ReactNode;
}

/** Narrower than this, the inspector no longer fits beside a useful stage and opens as a sheet. */
const SHEET_BELOW = 840;

function Sheet({
  label,
  sheet,
  children,
}: {
  readonly label: string;
  readonly sheet: RefObject<HTMLDivElement | null>;
  readonly children: ReactNode;
}): ReactElement {
  const reduced = useMotionPreference() === "reduced";
  const tracking = useAnimationTracking();
  const preset = reduced ? reducedPresence : presencePresets.rise;
  const fade = reduced ? reducedPresence : presencePresets.fade;
  return (
    <Layer band="modal" key="sheet">
      <Dialog.Overlay forceMount asChild>
        <motion.div
          initial={fade.initial}
          animate={fade.animate}
          exit={fade.exit}
          className="bt-app-shell-scrim"
          data-bt-part="sheet-scrim"
        >
          <Scrim />
        </motion.div>
      </Dialog.Overlay>
      <Dialog.Content forceMount asChild aria-describedby={undefined}>
        <motion.div
          {...tracking}
          ref={sheet}
          initial={preset.initial}
          animate={preset.animate}
          exit={preset.exit}
          className="bt-app-shell-sheet"
          data-bt-part="sheet"
        >
          <VisuallyHidden.Root asChild>
            <Dialog.Title>{label}</Dialog.Title>
          </VisuallyHidden.Root>
          {children}
        </motion.div>
      </Dialog.Content>
    </Layer>
  );
}

/**
 * A whole editor screen inside the app's background: the header and the stage in one column and the
 * inspector, full height, beside them, the whole thing at most 1380px wide and centered. On a narrow
 * screen (under 840px) the inspector moves into a sheet that rises from the bottom, opened by a button
 * under the stage, so nothing ever overlaps or squeezes. When the screen widens again the sheet closes
 * and the inspector goes back beside the stage, taking focus along if it was in the sheet.
 *
 * @example
 * <AppShell header={<HeaderBar title="Launch card" />} inspector={<Inspector label="Card settings">…</Inspector>} inspectorLabel="Card settings">
 *   <Stage label="Card preview" size={size}>…</Stage>
 * </AppShell>
 */
export function AppShell({
  header,
  inspector,
  inspectorLabel,
  openInspectorLabel = "Edit",
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
  ref,
  ...rest
}: AppShellProps): ReactElement {
  const root = useRef<HTMLDivElement>(null);
  const refs = useMergedRefs(ref, root);
  const sheet = useRef<HTMLDivElement>(null);
  const inline = useRef<HTMLDivElement>(null);
  const refocus = useRef(false);
  const [narrow, setNarrow] = useState(false);
  const [sheetOpen, setSheetOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const closeSheet = useRef(setSheetOpen);

  useLayoutEffect(() => {
    closeSheet.current = setSheetOpen;
  });

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return undefined;
    const measure = (): void => {
      const isNarrow = element.clientWidth < SHEET_BELOW;
      if (!isNarrow) {
        if (sheet.current?.contains(document.activeElement) === true) {
          refocus.current = true;
        }
        closeSheet.current(false);
      }
      setNarrow(isNarrow);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    if (narrow || !refocus.current) return;
    refocus.current = false;
    inline.current
      ?.querySelector<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
      )
      ?.focus();
  }, [narrow]);

  return (
    <div
      {...rest}
      ref={refs}
      className={cx("bt-app-shell", className)}
      data-bt="AppShell"
      data-narrow={narrow ? "" : undefined}
    >
      <div data-bt-part="header">{header}</div>
      <div data-bt-part="stage">{children}</div>
      {narrow ? (
        <Dialog.Root open={sheetOpen} onOpenChange={setSheetOpen}>
          <div data-bt-part="sheet-bar">
            <Dialog.Trigger asChild>
              <Button variant="primary" size="cta" shape="rounded">
                {openInspectorLabel}
              </Button>
            </Dialog.Trigger>
          </div>
          <AnimatePresence>
            {sheetOpen ? (
              <Sheet key="sheet" label={inspectorLabel} sheet={sheet}>
                {inspector}
              </Sheet>
            ) : null}
          </AnimatePresence>
        </Dialog.Root>
      ) : (
        <div ref={inline} data-bt-part="inspector">
          {inspector}
        </div>
      )}
    </div>
  );
}
