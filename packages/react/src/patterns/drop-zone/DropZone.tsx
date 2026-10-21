import { cx, isTypingField, useMergedRefs, useShortcut } from "@buttery/core";
import type { Shortcut } from "@buttery/core";
import { Slot } from "radix-ui";
import { createContext, use, useEffect, useRef, useState } from "react";
import type { ComponentPropsWithRef, Context, ReactElement } from "react";

/** The words a `DropZone` shows, for other languages. */
export interface DropZoneLabels {
  /** Shown while a file is held over it. */
  readonly drop: string;
}

/** Props for `DropZone`. */
export interface DropZoneProps extends ComponentPropsWithRef<"div"> {
  /** Called with the files dropped, pasted or picked that match `accept`. */
  readonly onFiles: (files: readonly File[]) => void;
  /** The kinds of file it takes, as for an input, such as `"image/*"` or `".png,.jpg"`. Defaults to any. */
  readonly accept?: string | undefined;
  /** Whether the file picker takes several files. Defaults to `false`. */
  readonly multiple?: boolean | undefined;
  /** Whether files pasted anywhere in the window land here, unless typing in a field. Defaults to `true`. */
  readonly paste?: boolean | undefined;
  /** The shortcut that opens the file picker, or `false` for none. Defaults to `"mod+o"`. */
  readonly openShortcut?: Shortcut | false | undefined;
  /** Takes no files while set. */
  readonly disabled?: boolean | undefined;
  /** Words to use instead of the English ones. */
  readonly labels?: Partial<DropZoneLabels> | undefined;
}

const LABELS: DropZoneLabels = { drop: "Drop to add" };

const OpenContext: Context<(() => void) | null> = createContext<
  (() => void) | null
>(null);

/** Whether a file is one of the kinds `accept` lists. */
export function fileMatches(file: File, accept: string | undefined): boolean {
  if (accept === undefined || accept.trim() === "") return true;
  return accept.split(",").some((entry) => {
    const kind = entry.trim().toLowerCase();
    if (kind.startsWith(".")) return file.name.toLowerCase().endsWith(kind);
    if (kind.endsWith("/*"))
      return file.type.toLowerCase().startsWith(kind.slice(0, -1));
    return file.type.toLowerCase() === kind;
  });
}

function DropZoneRoot({
  onFiles,
  accept,
  multiple = false,
  paste = true,
  openShortcut = "mod+o",
  disabled = false,
  labels,
  className,
  children,
  ref,
  ...rest
}: DropZoneProps): ReactElement {
  const words = { ...LABELS, ...labels };
  const input = useRef<HTMLInputElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const refs = useMergedRefs(ref, area);
  const [over, setOver] = useState(false);
  const latest = useRef(onFiles);

  useEffect(() => {
    latest.current = onFiles;
  });

  const deliver = (files: readonly File[]): void => {
    const taken = files.filter((file) => fileMatches(file, accept));
    if (taken.length > 0) latest.current(multiple ? taken : taken.slice(0, 1));
  };
  const open = (): void => {
    if (!disabled) input.current?.click();
  };

  useShortcut(openShortcut === false ? undefined : openShortcut, open, {
    enabled: openShortcut !== false && !disabled,
  });

  useEffect(() => {
    if (!paste || disabled) return undefined;
    const take = (event: ClipboardEvent): void => {
      if (isTypingField(event.target)) return;
      const files = [...(event.clipboardData?.files ?? [])];
      const taken = files.filter((file) => fileMatches(file, accept));
      if (taken.length === 0) return;
      event.preventDefault();
      latest.current(multiple ? taken : taken.slice(0, 1));
    };
    window.addEventListener("paste", take);
    return () => {
      window.removeEventListener("paste", take);
    };
  }, [paste, disabled, accept, multiple]);

  useEffect(() => {
    const element = area.current;
    if (!element || disabled) return undefined;
    let depth = 0;
    const holdsFiles = (event: DragEvent): boolean =>
      event.dataTransfer?.types.includes("Files") === true;
    const enter = (event: DragEvent): void => {
      if (!holdsFiles(event)) return;
      event.preventDefault();
      depth += 1;
      setOver(true);
    };
    const hover = (event: DragEvent): void => {
      if (!holdsFiles(event) || !event.dataTransfer) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    };
    const leave = (event: DragEvent): void => {
      if (!holdsFiles(event)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setOver(false);
    };
    const drop = (event: DragEvent): void => {
      if (!holdsFiles(event)) return;
      event.preventDefault();
      depth = 0;
      setOver(false);
      const files = [...(event.dataTransfer?.files ?? [])].filter((file) =>
        fileMatches(file, accept),
      );
      if (files.length > 0)
        latest.current(multiple ? files : files.slice(0, 1));
    };
    element.addEventListener("dragenter", enter);
    element.addEventListener("dragover", hover);
    element.addEventListener("dragleave", leave);
    element.addEventListener("drop", drop);
    return () => {
      element.removeEventListener("dragenter", enter);
      element.removeEventListener("dragover", hover);
      element.removeEventListener("dragleave", leave);
      element.removeEventListener("drop", drop);
    };
  }, [disabled, accept, multiple]);

  return (
    <OpenContext value={open}>
      <div
        {...rest}
        ref={refs}
        className={cx("bt-drop-zone", className)}
        data-bt="DropZone"
        data-over={over && !disabled ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
      >
        {children}
        <input
          ref={input}
          type="file"
          accept={accept}
          multiple={multiple}
          hidden
          tabIndex={-1}
          onChange={(event) => {
            deliver([...(event.target.files ?? [])]);
            event.target.value = "";
          }}
        />
        {over && !disabled ? (
          <div data-bt-part="drop-hint" aria-hidden="true">
            <span className="bt-text" data-role="label">
              {words.drop}
            </span>
          </div>
        ) : null}
      </div>
    </OpenContext>
  );
}

/** Props for `DropZone.Open`. */
export interface DropZoneOpenProps {
  /** The control that opens the file picker, such as a "Pick a picture" button. */
  readonly children: ReactElement;
}

/** Makes its child, such as a button, open the drop zone's file picker when pressed. */
export function DropZoneOpen({ children }: DropZoneOpenProps): ReactElement {
  const open = use(OpenContext);
  if (!open) {
    throw new Error(
      "[buttery:DropZone] DropZone.Open has to be inside a <DropZone>. Fix: <DropZone onFiles={…}><DropZone.Open><Button>Pick a picture</Button></DropZone.Open></DropZone>",
    );
  }
  return <Slot.Root onClick={open}>{children}</Slot.Root>;
}

/** `DropZone` with its `Open` part. */
export interface DropZoneComponent {
  (props: DropZoneProps): ReactElement;
  /** Makes its child open the file picker. */
  readonly Open: typeof DropZoneOpen;
}

/**
 * An area that takes files: dropped on it, pasted anywhere in the window (⌘V, unless typing in a field)
 * or picked after ⌘O or a press on its `DropZone.Open` button. While a file is held over it, it tints and
 * draws a dashed edge with "Drop to add". Only files matching `accept` reach `onFiles`.
 *
 * @example
 * <DropZone accept="image/*" onFiles={([image]) => setBackground(image)}>
 *   <EmptyState
 *     title="Add a card"
 *     description="Drag a picture onto the canvas, or paste it from your clipboard."
 *     actions={<DropZone.Open><Button variant="primary">Pick a picture</Button></DropZone.Open>}
 *   />
 * </DropZone>
 */
export const DropZone: DropZoneComponent = Object.assign(DropZoneRoot, {
  Open: DropZoneOpen,
});
