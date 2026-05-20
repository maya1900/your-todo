import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";
import { DEFAULT_FILTER } from "@/types/todo";
import { useTodoStore } from "@/store/useTodoStore";

beforeEach(() => {
  localStorage.clear();
  useTodoStore.setState({
    todos: [],
    filter: { ...DEFAULT_FILTER },
    sort: "createdAt-desc",
    ui: {
      drawer: { open: false },
      confirmDelete: { open: false },
      lastTrigger: null,
    },
  });
});

afterEach(() => {
  // ensure listeners cleaned up between renders
});

async function createTodo(
  user: ReturnType<typeof userEvent.setup>,
  opts: { title: string; category: string },
) {
  await user.click(screen.getByRole("button", { name: /新建待办/ }));
  const dialog = await screen.findByRole("dialog");
  const titleInput = within(dialog).getByLabelText(/TITLE/);
  await user.type(titleInput, opts.title);
  const categoryInput = within(dialog).getByLabelText(/CATEGORY/);
  await user.type(categoryInput, opts.category);
  await user.click(within(dialog).getByRole("button", { name: /Save|保存/ }));
}

describe("App integration — golden path", () => {
  it("shows initial empty state and can create a first todo", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByText(/你的索引还没开始/)).toBeInTheDocument();

    await createTodo(user, { title: "买牛奶", category: "生活" });

    expect(screen.queryByText(/你的索引还没开始/)).not.toBeInTheDocument();
    expect(screen.getByText("买牛奶")).toBeInTheDocument();
    expect(useTodoStore.getState().todos).toHaveLength(1);
  });

  it("toggles a todo to completed via the checkbox", async () => {
    const user = userEvent.setup();
    render(<App />);
    await createTodo(user, { title: "写报告", category: "工作" });

    const checkbox = screen.getByRole("checkbox", { name: /标记完成/ });
    await user.click(checkbox);
    const updated = useTodoStore.getState().todos[0];
    expect(updated?.status).toBe("completed");
  });

  it("filters by status and shows the filtered empty state", async () => {
    const user = userEvent.setup();
    render(<App />);
    await createTodo(user, { title: "写报告", category: "工作" });

    // Click "已完成" tab — should hide the pending todo and show filtered-empty
    const tab = screen.getByRole("tab", { name: /已完成/ });
    await user.click(tab);
    expect(screen.queryByText("写报告")).not.toBeInTheDocument();
    expect(screen.getByText(/这个组合下没有任何待办/)).toBeInTheDocument();

    // Clear filters via the empty-state CTA
    await user.click(screen.getByRole("button", { name: "重置筛选条件" }));
    expect(screen.getByText("写报告")).toBeInTheDocument();
  });

  it("deletes a todo after confirming", async () => {
    const user = userEvent.setup();
    render(<App />);
    await createTodo(user, { title: "临时事项", category: "杂项" });

    const deleteBtn = screen.getByRole("button", { name: /^删除：临时事项$/ });
    await user.click(deleteBtn);

    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText("删除这条待办？")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "删除" }));

    expect(screen.queryByText("临时事项")).not.toBeInTheDocument();
    expect(useTodoStore.getState().todos).toHaveLength(0);
  });
});
