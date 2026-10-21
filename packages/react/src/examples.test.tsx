import "@buttery/core/styles.css";
import "./styles.css";
import { publishSettled } from "@buttery/core";
import type { ExamplePlay, ExamplePlayContext } from "@buttery/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ComponentType } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { ButteryProvider } from "./provider/ButteryProvider.tsx";

const modules = import.meta.glob<Readonly<Record<string, unknown>>>(
  "./**/examples/*.tsx",
  { eager: true },
);

function isPlay(value: unknown): value is ExamplePlay {
  return typeof value === "function";
}

function isComponent(value: unknown): value is ComponentType {
  return typeof value === "function";
}

const context: ExamplePlayContext = {
  press: async (role, name) => {
    await userEvent.click(await screen.findByRole(role, { name }));
  },
  type: async (label, text) => {
    await userEvent.type(await screen.findByLabelText(label), text);
  },
  key: async (key) => {
    await userEvent.keyboard(`{${key}}`);
  },
  see: async (text) => {
    await waitFor(
      () => {
        expect(screen.getAllByText(text).length).toBeGreaterThan(0);
      },
      { timeout: 3000 },
    );
  },
};

const played = Object.entries(modules).flatMap(([path, module]) => {
  const { play, ...rest } = module;
  if (!isPlay(play)) return [];
  const Example = Object.values(rest).find(isComponent);
  return Example === undefined ? [] : [{ path, play, Example }];
});

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

describe("examples", () => {
  it("finds the package's examples", () => {
    expect(Object.keys(modules).length).toBeGreaterThan(0);
  });

  it.each(played)("$path plays through", async ({ play, Example }) => {
    render(
      <ButteryProvider>
        <Example />
      </ButteryProvider>,
    );
    await play(context);
  });
});
