import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("does not render when closed", () => {
    render(
      <ConfirmDialog
        open={false}
        title="del?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("focuses Cancel by default", () => {
    render(
      <ConfirmDialog
        open
        title="del?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    const cancel = screen.getByRole("button", { name: "取消" });
    expect(document.activeElement).toBe(cancel);
  });

  it("renders title and description", () => {
    render(
      <ConfirmDialog
        open
        title="删除吗?"
        description="此操作不可撤销"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.getByText("删除吗?")).toBeInTheDocument();
    expect(screen.getByText("此操作不可撤销")).toBeInTheDocument();
  });
});
