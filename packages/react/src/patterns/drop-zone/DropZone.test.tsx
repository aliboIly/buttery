import "@buttery/core/styles.css";
import "../../styles.css";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "../../components/button/Button.tsx";
import { DropZone, fileMatches } from "./DropZone.tsx";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const apple = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
const mod = apple ? "Meta" : "Control";

function image(name = "backdrop.png"): File {
  return new File(["png"], name, { type: "image/png" });
}

function holding(...files: File[]): DataTransfer {
  const data = new DataTransfer();
  for (const file of files) data.items.add(file);
  return data;
}

function drag(type: string, target: Element, data: DataTransfer): void {
  act(() => {
    target.dispatchEvent(
      new DragEvent(type, {
        bubbles: true,
        cancelable: true,
        dataTransfer: data,
      }),
    );
  });
}

function zone(): HTMLElement {
  const element = document.querySelector<HTMLElement>('[data-bt="DropZone"]');
  if (!element) throw new Error("No drop zone.");
  return element;
}

describe("DropZone", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <DropZone
        ref={ref}
        onFiles={() => undefined}
        className="custom"
        data-testid="zone"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("DropZone");
    expect(ref.current?.className).toBe("bt-drop-zone custom");
    expect(ref.current?.dataset["testid"]).toBe("zone");
  });

  it("matches files against accept by type, wildcard and extension", () => {
    expect(fileMatches(image(), "image/*")).toBe(true);
    expect(fileMatches(image(), "image/jpeg")).toBe(false);
    expect(fileMatches(image("a.PNG"), ".png,.jpg")).toBe(true);
    expect(
      fileMatches(
        new File(["x"], "notes.txt", { type: "text/plain" }),
        "image/*",
      ),
    ).toBe(false);
    expect(fileMatches(image(), undefined)).toBe(true);
  });

  it("tints and says what a drop does while a file is held over it, then hands over what's dropped", () => {
    const onFiles = vi.fn();
    render(
      <DropZone
        accept="image/*"
        onFiles={onFiles}
        style={{ blockSize: "240px" }}
      >
        <p>Add a card</p>
      </DropZone>,
    );
    const data = holding(
      image(),
      new File(["x"], "notes.txt", { type: "text/plain" }),
    );
    drag("dragenter", zone(), data);
    expect(zone().hasAttribute("data-over")).toBe(true);
    expect(screen.getByText("Drop to add")).toBeTruthy();
    drag("dragenter", screen.getByText("Add a card"), data);
    drag("dragleave", screen.getByText("Add a card"), data);
    expect(zone().hasAttribute("data-over")).toBe(true);
    drag("drop", zone(), data);
    expect(zone().hasAttribute("data-over")).toBe(false);
    expect(onFiles).toHaveBeenCalledTimes(1);
    expect(
      (onFiles.mock.calls[0]?.[0] as File[]).map((file) => file.name),
    ).toEqual(["backdrop.png"]);
  });

  it("opens the file picker from its Open button and from ⌘O", async () => {
    render(
      <DropZone onFiles={() => undefined}>
        <DropZone.Open>
          <Button>Choose image</Button>
        </DropZone.Open>
      </DropZone>,
    );
    const input = zone().querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) throw new Error("No file input.");
    const click = vi.spyOn(input, "click").mockImplementation(() => undefined);
    await userEvent.click(screen.getByRole("button", { name: "Choose image" }));
    expect(click).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(`{${mod}>}o{/${mod}}`);
    expect(click).toHaveBeenCalledTimes(2);
  });

  it("hands over picked files", () => {
    const onFiles = vi.fn();
    render(<DropZone accept="image/*" onFiles={onFiles} />);
    const input = zone().querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) throw new Error("No file input.");
    fireEvent.change(input, { target: { files: holding(image()).files } });
    expect(onFiles).toHaveBeenCalledTimes(1);
  });

  it("takes no files while disabled", () => {
    const onFiles = vi.fn();
    render(<DropZone onFiles={onFiles} disabled />);
    const data = holding(image());
    drag("dragenter", zone(), data);
    expect(zone().hasAttribute("data-over")).toBe(false);
    drag("drop", zone(), data);
    expect(onFiles).not.toHaveBeenCalled();
  });
});
