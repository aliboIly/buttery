import {
  FloatingLanes,
  Icon,
  Morph,
  Text,
  cx,
  durations,
  easingCurves,
  hasContent,
  presencePresets,
  reducedPresence,
  useAnimationTracking,
  useButteryTransition,
  useMotionPreference,
  useStoredState,
} from "@buttery/core";
import type { MotionElementProps } from "@buttery/core";
import { ChevronDown, ChevronUp, Circle, CircleCheck, X } from "lucide-react";
import { motion } from "motion/react";
import { VisuallyHidden } from "radix-ui";
import { useCallback, useId, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { Button } from "../../components/button/Button.tsx";
import { IconButton } from "../../components/icon-button/IconButton.tsx";
import { useDismissible } from "../../parts/guidance/GuidanceParts.tsx";
import type { GuidanceAction } from "../../parts/guidance/GuidanceParts.tsx";

/** One task in a setup guide. */
export interface SetupTask {
  /** Identifies the task among the others. */
  readonly id: string;
  /** What to do, such as "Add your first coffee". */
  readonly title: string;
  /** A line more about it, under the title when the guide is unfolded. */
  readonly description?: string | undefined;
  /** Whether it's done. The app knows; the guide shows it. */
  readonly done?: boolean | undefined;
  /** Where to do it: the "Next:" link takes the task's title, and the unfolded guide shows this as a button. */
  readonly action?: GuidanceAction | undefined;
  /**
   * The group it's listed under when the guide is unfolded, such as "Take payments". Tasks in a row with the
   * same group sit under its header, which folds; the group holding the next task starts open.
   */
  readonly group?: string | undefined;
}

/** The words a `SetupGuide` shows and announces. */
export interface SetupGuideLabels {
  /** Before the next task when folded. */
  readonly next: string;
  /** Names the button that unfolds it. */
  readonly expand: string;
  /** Names the button that folds it. */
  readonly collapse: string;
  /** Names the dismiss button. */
  readonly dismiss: string;
  /** Takes the place of the next task once every task is done. */
  readonly allDone: string;
  /** Read before a done task's title. */
  readonly done: string;
  /** Read before a task still to do. */
  readonly toDo: string;
  /** The progress, read with the bar, such as "2 of 5 done". */
  readonly progress: (done: number, total: number) => string;
  /** Names the list of steps, which takes focus while it scrolls so the keyboard can scroll it. */
  readonly steps: string;
}

/** Props for `SetupGuide`. */
export interface SetupGuideProps extends Omit<
  MotionElementProps<"div">,
  "title"
> {
  /** What it's for. Defaults to `"Setup guide"`. It names the guide. */
  readonly title?: string | undefined;
  /** The tasks, in the order to do them. The first one not done is next. */
  readonly tasks: readonly SetupTask[];
  /** Whether it's unfolded, when you control it. */
  readonly open?: boolean | undefined;
  /** Whether it starts unfolded. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when it unfolds or folds. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** Remembers whether it's unfolded and whether it was dismissed under this key, across visits. */
  readonly storageKey?: string | undefined;
  /** Called once it has faded and gone. */
  readonly onDismiss?: (() => void) | undefined;
  /** What sits under the unfolded steps, past a hairline, such as a link to talk to someone. */
  readonly footer?: ReactNode;
  /** Its words, for another language or your own. */
  readonly labels?: Partial<SetupGuideLabels> | undefined;
}

const LABELS: SetupGuideLabels = {
  next: "Next:",
  expand: "Show all steps",
  collapse: "Hide steps",
  dismiss: "Dismiss",
  allDone: "You're all set.",
  done: "Done",
  toDo: "To do",
  progress: (done, total) => `${String(done)} of ${String(total)} done`,
  steps: "Steps",
};

function isFlag(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isChoices(value: unknown): value is Readonly<Record<string, boolean>> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(isFlag)
  );
}

interface TaskSection {
  readonly group: string | undefined;
  readonly tasks: readonly SetupTask[];
}

function sectionsOf(tasks: readonly SetupTask[]): readonly TaskSection[] {
  const sections: { group: string | undefined; tasks: SetupTask[] }[] = [];
  for (const task of tasks) {
    const last = sections.at(-1);
    if (last !== undefined && last.group === task.group) last.tasks.push(task);
    else sections.push({ group: task.group, tasks: [task] });
  }
  return sections;
}

const closeChevron = {
  duration: durations.fast / 1000,
  ease: easingCurves.standard,
};

function TaskLink({ task }: { readonly task: SetupTask }): ReactElement {
  const { action } = task;
  if (action?.href !== undefined)
    return (
      <a
        href={action.href}
        onClick={action.onClick}
        className="bt-focus"
        data-bt-part="next-link"
      >
        {task.title}
      </a>
    );
  if (action?.onClick !== undefined)
    return (
      <button
        type="button"
        onClick={action.onClick}
        className="bt-focus"
        data-bt-part="next-link"
      >
        {task.title}
        <span data-bt-part="hit" data-bt-hit="" aria-hidden="true" />
      </button>
    );
  return <span data-bt-part="next-title">{task.title}</span>;
}

/**
 * A floating checklist for getting started, in the `bottom-end` lane: 288 wide, it rises in as toasts do.
 * Folded, it shows its title, a progress bar and the next task as a link; unfolded, its height opens on
 * `spring.smooth` to every task, a done one checked, the next one with its action as a button, and its
 * `footer` under them. Tasks with a `group` sit under the group's header, which folds as a sidebar group
 * does; the group holding the next task starts open and is tinted while it's open. With a `storageKey` it
 * remembers being unfolded, its open groups and being dismissed across visits; which tasks are done comes
 * from the app.
 *
 * @example
 * <SetupGuide
 *   storageKey="roastery-setup"
 *   tasks={[
 *     { id: "coffee", title: "Add your first coffee", done: true },
 *     { id: "shipping", title: "Set shipping rates", action: { label: "Set rates", href: "/settings/shipping" } },
 *   ]}
 * />
 */
export function SetupGuide({
  title = "Setup guide",
  tasks,
  open,
  defaultOpen = false,
  onOpenChange,
  storageKey,
  onDismiss,
  footer,
  labels,
  className,
  ...rest
}: SetupGuideProps): ReactElement | null {
  const words = { ...LABELS, ...labels };
  const titleId = useId();
  const stepsId = useId();
  const groupsId = useId();
  const reduced = useMotionPreference() === "reduced";
  const smooth = useButteryTransition("smooth");
  const openTurn = useButteryTransition("snappy");
  const arrivalTracking = useAnimationTracking();
  const fillTracking = useAnimationTracking();
  const [stored, setStored] = useStoredState(
    storageKey === undefined
      ? undefined
      : `buttery:setup-guide-open:${storageKey}`,
    defaultOpen,
    isFlag,
  );
  const unfolded = open ?? stored;
  const [groupChoices, setGroupChoices] = useStoredState<
    Readonly<Record<string, boolean>>
  >(
    storageKey === undefined
      ? undefined
      : `buttery:setup-guide-groups:${storageKey}`,
    {},
    isChoices,
  );
  const { dismissed, dismiss, motionProps } = useDismissible({
    kind: "setup-guide",
    storageKey,
    onDismiss,
  });
  const [overflows, setOverflows] = useState(false);
  const watchSteps = useCallback((element: HTMLDivElement | null) => {
    if (!element) return undefined;
    const measure = (): void => {
      setOverflows(element.scrollHeight > element.clientHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const list of element.children) observer.observe(list);
    return () => {
      observer.disconnect();
    };
  }, []);
  if (dismissed) return null;
  const total = tasks.length;
  const finished = tasks.filter((task) => task.done === true).length;
  const next = tasks.find((task) => task.done !== true);
  const arrival = reduced ? reducedPresence : presencePresets.toast;

  const toggle = (): void => {
    const change = !unfolded;
    if (open === undefined) setStored(change);
    onOpenChange?.(change);
  };

  const steps = (list: readonly SetupTask[], id?: string): ReactElement => (
    <ol id={id} data-bt-part="steps">
      {list.map((task) => (
        <li
          key={task.id}
          data-bt-part="step"
          data-done={task.done === true ? "" : undefined}
        >
          <Icon
            icon={task.done === true ? CircleCheck : Circle}
            data-bt-part="check"
          />
          <div data-bt-part="step-text">
            <Text>
              <VisuallyHidden.Root>
                {`${task.done === true ? words.done : words.toDo}: `}
              </VisuallyHidden.Root>
              {task.title}
            </Text>
            {task.description === undefined ? null : (
              <Text variant="body-sm">{task.description}</Text>
            )}
            {task !== next || task.action === undefined ? null : (
              <span data-bt-part="step-action">
                {task.action.href === undefined ? (
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={task.action.onClick}
                  >
                    {task.action.label}
                  </Button>
                ) : (
                  <Button variant="soft" size="sm" asChild>
                    <a href={task.action.href} onClick={task.action.onClick}>
                      {task.action.label}
                    </a>
                  </Button>
                )}
              </span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );

  const section = (part: TaskSection, index: number): ReactElement => {
    const { group } = part;
    if (group === undefined)
      return <div key={`tasks-${String(index)}`}>{steps(part.tasks)}</div>;
    const listId = `${groupsId}-${String(index)}`;
    const groupOpen = groupChoices[group] ?? group === next?.group;
    return (
      <div
        key={`group-${group}`}
        data-bt-part="group"
        data-open={groupOpen ? "" : undefined}
      >
        <button
          type="button"
          aria-expanded={groupOpen}
          aria-controls={listId}
          className="bt-focus"
          data-bt-part="group-head"
          onClick={() => {
            setGroupChoices((choices) => ({ ...choices, [group]: !groupOpen }));
          }}
        >
          <span
            className="bt-text bt-truncate"
            data-role="label"
            data-bt-truncate=""
            title={group}
            data-bt-part="group-title"
          >
            {group}
          </span>
          <motion.span
            data-bt-part="group-chevron"
            initial={false}
            animate={{
              rotate: groupOpen ? 180 : 0,
              transition: groupOpen || reduced ? openTurn : closeChevron,
            }}
          >
            <Icon icon={ChevronDown} />
          </motion.span>
        </button>
        <Morph
          id={listId}
          disclosure
          contentKey={groupOpen ? "open" : "closed"}
        >
          {groupOpen ? steps(part.tasks) : null}
        </Morph>
      </div>
    );
  };

  return (
    <FloatingLanes.Item lane="bottom-end">
      <motion.div
        {...arrivalTracking}
        initial={arrival.initial}
        animate={arrival.animate}
        data-bt-part="arrival"
      >
        <motion.div
          role="region"
          aria-labelledby={titleId}
          {...rest}
          {...motionProps}
          className={cx("bt-setup-guide", className)}
          data-bt="SetupGuide"
        >
          <div data-bt-part="head">
            <Text id={titleId} variant="title-sm">
              {title}
            </Text>
            <div data-bt-part="controls">
              <IconButton
                icon={unfolded ? ChevronDown : ChevronUp}
                label={unfolded ? words.collapse : words.expand}
                size="sm"
                aria-expanded={unfolded}
                aria-controls={unfolded ? stepsId : undefined}
                onClick={toggle}
              />
              <IconButton
                icon={X}
                label={words.dismiss}
                size="sm"
                onClick={dismiss}
              />
            </div>
          </div>
          <div
            role="progressbar"
            aria-labelledby={titleId}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={finished}
            aria-valuetext={words.progress(finished, total)}
            data-bt-part="progress"
          >
            <motion.span
              {...fillTracking}
              data-bt-part="fill"
              initial={false}
              animate={{ scaleX: total === 0 ? 0 : finished / total }}
              transition={smooth}
            />
          </div>
          <Morph contentKey={unfolded ? "steps" : "next"}>
            {unfolded ? (
              <div data-bt-part="unfolded">
                <div
                  ref={watchSteps}
                  id={stepsId}
                  role="region"
                  aria-label={words.steps}
                  tabIndex={overflows ? 0 : undefined}
                  className="bt-scroll-fade"
                  data-bt-part="steps-scroll"
                >
                  {tasks.some((task) => task.group !== undefined) ? (
                    <div data-bt-part="groups">
                      {sectionsOf(tasks).map(section)}
                    </div>
                  ) : (
                    steps(tasks)
                  )}
                </div>
                {hasContent(footer) ? (
                  <div data-bt-part="footer">{footer}</div>
                ) : null}
              </div>
            ) : (
              <p className="bt-text" data-role="caption" data-bt-part="next">
                {next === undefined ? (
                  words.allDone
                ) : (
                  <>
                    {`${words.next} `}
                    <TaskLink task={next} />
                  </>
                )}
              </p>
            )}
          </Morph>
        </motion.div>
      </motion.div>
    </FloatingLanes.Item>
  );
}
