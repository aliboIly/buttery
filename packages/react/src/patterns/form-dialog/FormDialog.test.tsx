import "@butteryui/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@butteryui/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { Button } from "../../components/button/Button.tsx";
import { TextField } from "../../components/text-field/TextField.tsx";
import { FormDialog } from "./FormDialog.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

function BackupEmail({
  onSubmit = () => undefined,
}: {
  readonly onSubmit?: (email: string) => void | Promise<void>;
}): ReactElement {
  const [email, setEmail] = useState("");
  return (
    <FormDialog
      trigger={<Button>Add a backup email</Button>}
      title="Add a backup email"
      description={
        <>
          We send sign-in codes there. <a href="#why">Why a backup?</a>
        </>
      }
      valid={email.includes("@")}
      onSubmit={() => onSubmit(email)}
      submitLabel="Add email"
    >
      <TextField
        label="Backup email"
        type="email"
        value={email}
        onValueChange={setEmail}
      />
    </FormDialog>
  );
}

async function open(): Promise<HTMLElement> {
  await userEvent.click(
    screen.getByRole("button", { name: "Add a backup email" }),
  );
  return screen.findByRole("dialog", { name: "Add a backup email" });
}

describe("FormDialog", () => {
  it("stamps its class and data-bt on its content, forwards its ref to the dialog", async () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <FormDialog
        ref={ref}
        defaultOpen
        title="Rename the view"
        onSubmit={() => undefined}
        className="custom"
      />,
    );
    await screen.findByRole("dialog");
    expect(document.querySelector("[data-bt='FormDialog']")?.className).toBe(
      "bt-form-dialog custom",
    );
    expect(ref.current?.dataset["bt"]).toBe("Dialog");
  });

  it("is named by its title over a divider, described by its copy, and opens on its field", async () => {
    render(<BackupEmail />);
    const dialog = await open();
    expect(dialog).toHaveAccessibleDescription(
      "We send sign-in codes there. Why a backup?",
    );
    const header = dialog.querySelector<HTMLElement>(".bt-dialog-text");
    if (!header) throw new Error("No header.");
    expect(getComputedStyle(header).borderBottomWidth).toBe("1px");
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByLabelText("Backup email"),
      );
    });
  });

  it("keeps Submit disabled until the form is valid, then sends it and closes", async () => {
    const onSubmit = vi.fn();
    render(<BackupEmail onSubmit={onSubmit} />);
    await open();
    const submit = screen.getByRole("button", { name: "Add email" });
    expect(submit.getAttribute("aria-disabled")).toBe("true");
    await userEvent.click(submit, { force: true });
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.fill(
      screen.getByLabelText("Backup email"),
      "rosa@halfmoon.example",
    );
    expect(submit.hasAttribute("aria-disabled")).toBe(false);
    await userEvent.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("rosa@halfmoon.example");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("waits for a promise, Submit busy, and stays open if it rejects", async () => {
    let finish: (() => void) | undefined;
    let fail: (() => void) | undefined;
    const onSubmit = vi
      .fn<() => Promise<void>>()
      .mockImplementationOnce(
        () =>
          new Promise((_resolve, reject) => {
            fail = () => {
              reject(new Error("Taken"));
            };
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      );
    render(<BackupEmail onSubmit={onSubmit} />);
    await open();
    await userEvent.fill(
      screen.getByLabelText("Backup email"),
      "rosa@halfmoon.example",
    );
    await userEvent.click(screen.getByRole("button", { name: "Add email" }));
    expect(
      screen
        .getByRole("button", { name: "Add email" })
        .getAttribute("aria-busy"),
    ).toBe("true");
    fail?.();
    await waitFor(() => {
      expect(
        screen
          .getByRole("button", { name: "Add email" })
          .hasAttribute("aria-busy"),
      ).toBe(false);
    });
    expect(screen.getByRole("dialog")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Add email" }));
    finish?.();
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("stays open while a submit is pending, whatever asks it to close", async () => {
    let finish: (() => void) | undefined;
    render(
      <BackupEmail
        onSubmit={() =>
          new Promise((resolve) => {
            finish = resolve;
          })
        }
      />,
    );
    await open();
    await userEvent.fill(
      screen.getByLabelText("Backup email"),
      "rosa@halfmoon.example",
    );
    await userEvent.click(screen.getByRole("button", { name: "Add email" }));
    await userEvent.keyboard("{Escape}");
    const cancel = screen.getByRole("button", { name: "Cancel" });
    expect(cancel.getAttribute("aria-disabled")).toBe("true");
    await userEvent.click(cancel, { force: true });
    const close = screen.getByRole("button", { name: "Close" });
    expect(close.getAttribute("aria-disabled")).toBe("true");
    await userEvent.click(close, { force: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.getByRole("dialog")).toBeTruthy();
    finish?.();
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("starts a reopened dialog idle, and a submit cut short by its owner closing it can't close the new one", async () => {
    let finish: (() => void) | undefined;
    function Owned(): ReactElement {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setOpen(true);
            }}
          >
            Reopen
          </button>
          <FormDialog
            open={open}
            onOpenChange={setOpen}
            title="Rename the view"
            onSubmit={() => {
              window.setTimeout(() => {
                setOpen(false);
              }, 0);
              return new Promise((resolve) => {
                finish = resolve;
              });
            }}
            submitLabel="Rename"
          />
        </>
      );
    }
    render(<Owned />);
    await screen.findByRole("dialog");
    await userEvent.click(screen.getByRole("button", { name: "Rename" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    await userEvent.click(screen.getByRole("button", { name: "Reopen" }));
    await screen.findByRole("dialog");
    expect(
      screen.getByRole("button", { name: "Rename" }).hasAttribute("aria-busy"),
    ).toBe(false);
    finish?.();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("closes on Cancel without sending", async () => {
    const onSubmit = vi.fn();
    render(<BackupEmail onSubmit={onSubmit} />);
    await open();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
