import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>提交</Button>);
    expect(screen.getByRole("button", { name: "提交" })).toBeInTheDocument();
  });

  it("calls onClick", async () => {
    const user = userEvent.setup();
    let clicked = 0;
    render(<Button onClick={() => clicked++}>click</Button>);
    await user.click(screen.getByRole("button"));
    expect(clicked).toBe(1);
  });

  it("supports disabled", () => {
    render(<Button disabled>x</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies stamp variant classes", () => {
    render(<Button variant="stamp">save</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/bg-stamp-600/);
  });
});
