import "../../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Center } from "./Center.tsx";

afterEach(cleanup);

describe("Center", () => {
  it("centers its content on both axes", () => {
    render(
      <Center
        style={{ inlineSize: "200px", blockSize: "100px" }}
        data-testid="box"
      >
        <span
          data-testid="child"
          style={{ display: "block", inlineSize: "40px", blockSize: "20px" }}
        />
      </Center>,
    );
    const box = screen.getByTestId("box").getBoundingClientRect();
    const child = screen.getByTestId("child").getBoundingClientRect();
    expect(child.left - box.left).toBe(80);
    expect(child.top - box.top).toBe(40);
  });
});
