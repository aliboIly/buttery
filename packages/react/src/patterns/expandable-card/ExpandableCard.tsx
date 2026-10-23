import {
  Layer,
  Scrim,
  cx,
  durations,
  easingCurves,
  hasTabbable,
  presencePresets,
  reducedPresence,
  reducedTransition,
  spring,
  timing,
  useAnimationTracking,
  useControllableState,
  useLayoutAnimation,
  useMotionPreference,
} from "@butteryui/core";
import type { MotionElementProps } from "@butteryui/core";
import { Maximize2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { HTMLMotionProps, Transition } from "motion/react";
import { Dialog as RadixDialog } from "radix-ui";
import { use, useEffect, useId, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { IconButton } from "../../components/icon-button/IconButton.tsx";
import { BentoContext } from "../bento/Bento.tsx";
import type { BentoSpan } from "../bento/Bento.tsx";

const stepBack: Transition = {
  duration: durations.base / 1000,
  ease: easingCurves.standard,
};

/**
 * A part of the open card: it keeps its shape while the card grows around it, fading in once the growth is
 * under way. Closing, it goes at once, since Motion keeps the parts of a leaving surface where they were
 * rather than taking them along.
 */
function OpenPart(props: HTMLMotionProps<"div">): ReactElement {
  const reduced = useMotionPreference() === "reduced";
  const { layout, transition } = useLayoutAnimation("morph");
  return (
    <motion.div
      {...props}
      layout={layout}
      transition={transition}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: reduced
          ? reducedTransition
          : {
              delay: timing["delay-follow"] / 1000,
              duration: durations.fast / 1000,
            },
      }}
      {...(reduced ? {} : { exit: { opacity: 0, transition: spring.instant } })}
    />
  );
}

/** Props for `ExpandableCard`. */
export interface ExpandableCardProps extends Omit<
  MotionElementProps<"article">,
  "title"
> {
  /** The card's title. It travels into the dialog and names it. */
  readonly title: string;
  /** What the open card shows under its title. */
  readonly detail: ReactNode;
  /** Columns it spans in a `Bento` once the grid is 1024px wide. Defaults to `6`. */
  readonly span?: BentoSpan | undefined;
  /** Rows it spans in a `Bento`. Defaults to `1`. */
  readonly rows?: 1 | 2 | undefined;
  /** Whether it's open. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Whether it starts open when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when it opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** Names the button that opens it. Defaults to "Open" and the title. */
  readonly openLabel?: string | undefined;
  /** Names the button that closes it. Defaults to `"Close"`. */
  readonly closeLabel?: string | undefined;
}

/**
 * A bento card that opens into a dialog by turning into it: the card grows into the dialog on
 * `spring.morph`, its title travelling along, while the other cards step back and the scrim washes in; the
 * detail fades in once it's under way. Closing turns it back into the card on `spring.smooth`. A press
 * anywhere on the card opens it, and so does its expand button, which keyboards reach; Escape, the close
 * button or a press outside closes it, with focus back on the expand button. With reduced motion it
 * simply fades.
 *
 * @example
 * <Bento>
 *   <ExpandableCard title="Tilt it in 3D" span={8} detail={<TiltDetail />}>
 *     <TiltPreview />
 *   </ExpandableCard>
 * </Bento>
 */
export function ExpandableCard({
  title,
  detail,
  span = 6,
  rows = 1,
  open,
  defaultOpen = false,
  onOpenChange,
  openLabel,
  closeLabel = "Close",
  className,
  children,
  onClick,
  ...rest
}: ExpandableCardProps): ReactElement {
  const id = useId();
  const bento = use(BentoContext);
  const reduced = useMotionPreference() === "reduced";
  const tracking = useAnimationTracking();
  const cardLayout = useLayoutAnimation("smooth");
  const panelLayout = useLayoutAnimation("morph");
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [travelling, setTravelling] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const expand = useRef<HTMLButtonElement>(null);
  const setExpanded = bento?.setExpanded;
  const steppedBack =
    bento !== null && bento.expanded !== null && bento.expanded !== id;
  const fade = reduced ? reducedPresence : presencePresets.fade;

  useEffect(() => {
    if (!setExpanded) return undefined;
    if (!isOpen) return undefined;
    setExpanded(id);
    return () => {
      setExpanded(null);
    };
  }, [isOpen, id, setExpanded]);

  return (
    <RadixDialog.Root open={isOpen} onOpenChange={setOpen}>
      <motion.article
        aria-labelledby={`${id}-title`}
        {...rest}
        {...tracking}
        {...(cardLayout.layout ? { layoutId: `${id}-card` } : {})}
        animate={{
          opacity: steppedBack ? 0 : 1,
          transition: reduced ? reducedTransition : stepBack,
        }}
        transition={cardLayout.transition}
        className={cx("bt-bento-card bt-expandable-card", className)}
        data-bt="ExpandableCard"
        data-span={span}
        data-rows={rows}
        data-open={isOpen ? "" : undefined}
        data-travelling={travelling ? "" : undefined}
        onLayoutAnimationStart={() => {
          tracking.onLayoutAnimationStart();
          setTravelling(true);
        }}
        onLayoutAnimationComplete={() => {
          tracking.onLayoutAnimationComplete();
          setTravelling(false);
        }}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          if (
            event.target instanceof Node &&
            expand.current?.contains(event.target)
          )
            return;
          setOpen(true);
        }}
      >
        <header data-bt-part="head">
          <motion.h3
            {...(cardLayout.layout ? { layoutId: `${id}-title` } : {})}
            id={`${id}-title`}
            transition={cardLayout.transition}
            className="bt-text"
            data-role="heading-2"
            data-bt-part="title"
          >
            {title}
          </motion.h3>
          <div data-bt-part="affordance">
            <RadixDialog.Trigger asChild>
              <IconButton
                ref={expand}
                icon={Maximize2}
                label={openLabel ?? `Open ${title}`}
                size="sm"
              />
            </RadixDialog.Trigger>
          </div>
        </header>
        <div data-bt-part="visual" data-bt-clip="">
          {children}
        </div>
      </motion.article>
      <AnimatePresence>
        {isOpen ? (
          <Layer band="modal" key="expanded">
            <RadixDialog.Overlay forceMount asChild>
              <motion.div
                initial={fade.initial}
                animate={fade.animate}
                exit={fade.exit}
                className="bt-expandable-card-scrim"
                data-bt-part="scrim"
              >
                <Scrim />
              </motion.div>
            </RadixDialog.Overlay>
            <div className="bt-expandable-card-frame" data-bt-part="frame">
              <RadixDialog.Content
                forceMount
                asChild
                aria-describedby={undefined}
                onOpenAutoFocus={(event) => {
                  // With nothing to act on in the detail, focus the panel rather than the close button, whose tooltip would open.
                  if (hasTabbable(body.current)) return;
                  event.preventDefault();
                  panel.current?.focus();
                }}
              >
                <motion.div
                  {...tracking}
                  ref={panel}
                  {...(panelLayout.layout ? { layoutId: `${id}-card` } : {})}
                  transition={panelLayout.transition}
                  {...(panelLayout.layout
                    ? {}
                    : {
                        initial: fade.initial,
                        animate: fade.animate,
                        exit: fade.exit,
                      })}
                  aria-modal="true"
                  className="bt-expandable-card-panel bt-surface"
                  data-level="dialog"
                  data-bt-part="panel"
                >
                  <header data-bt-part="head">
                    <RadixDialog.Title asChild>
                      <motion.h2
                        {...(panelLayout.layout
                          ? { layoutId: `${id}-title` }
                          : {})}
                        transition={panelLayout.transition}
                        className="bt-text"
                        data-role="heading-2"
                        data-bt-part="title"
                      >
                        {title}
                      </motion.h2>
                    </RadixDialog.Title>
                  </header>
                  <OpenPart ref={body} data-bt-part="detail">
                    {detail}
                  </OpenPart>
                  <OpenPart data-bt-part="close" data-bt-allow-overlap="">
                    <RadixDialog.Close asChild>
                      <IconButton icon={X} label={closeLabel} size="sm" />
                    </RadixDialog.Close>
                  </OpenPart>
                </motion.div>
              </RadixDialog.Content>
            </div>
          </Layer>
        ) : null}
      </AnimatePresence>
    </RadixDialog.Root>
  );
}
