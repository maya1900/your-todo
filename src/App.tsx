import { useRef } from "react";
import { useTodoStore, useConfirmDeleteState } from "@/store/useTodoStore";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { StatsBar } from "@/components/stats/StatsBar";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { TodoList } from "@/components/list/TodoList";
import { TodoDrawer } from "@/components/forms/TodoDrawer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ToastHost } from "@/components/ui/ToastHost";
import { emitToast } from "@/components/feedback/toastBus";
import { useHotkey } from "@/hooks/useHotkey";
import { exportToFile, ImportError, parseImport } from "@/utils/io";

export default function App() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const openCreate = useTodoStore((s) => s.openCreate);
  const closeDrawer = useTodoStore((s) => s.closeDrawer);
  const closeConfirm = useTodoStore((s) => s.closeConfirm);
  const deleteTodo = useTodoStore((s) => s.deleteTodo);
  const importAll = useTodoStore((s) => s.importAll);
  const confirmDelete = useConfirmDeleteState();
  const drawer = useTodoStore((s) => s.ui.drawer);

  // Hotkeys
  useHotkey("mod+k", (e) => {
    e.preventDefault();
    searchInputRef.current?.focus();
  });
  useHotkey("mod+n", (e) => {
    e.preventDefault();
    openCreate(null);
  });
  useHotkey("n", (e) => {
    if (drawer.open) return;
    e.preventDefault();
    openCreate(null);
  }, { ignoreInEditable: true });

  function handleExport() {
    const s = useTodoStore.getState();
    try {
      exportToFile({ todos: s.todos, filter: s.filter, sort: s.sort });
      emitToast({ kind: "success", message: "已导出 JSON 文件" });
    } catch (err) {
      emitToast({ kind: "error", message: "导出失败，请稍后重试" });
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  function handleImportClick() {
    importInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file
      .text()
      .then((text) => {
        try {
          const data = parseImport(text);
          const total = data.todos.length;
          const ok = window.confirm(
            `检测到 ${total} 条待办。导入将覆盖当前数据，是否继续？`,
          );
          if (ok) {
            importAll(data);
            emitToast({ kind: "success", message: `已导入 ${total} 条待办` });
          }
        } catch (err) {
          if (err instanceof ImportError) {
            emitToast({ kind: "error", message: `导入失败：${err.message}` });
          } else {
            emitToast({ kind: "error", message: "导入失败，请检查文件" });
          }
        }
      })
      .catch(() => {
        emitToast({ kind: "error", message: "无法读取文件" });
      })
      .finally(() => {
        // allow re-selecting the same file
        if (importInputRef.current) importInputRef.current.value = "";
      });
  }

  function onConfirmDelete() {
    if (!confirmDelete.open) return;
    deleteTodo(confirmDelete.id);
    emitToast({ kind: "success", message: "已删除待办" });
    closeConfirm();
  }

  return (
    <>
      <Header onExport={handleExport} onImport={handleImportClick} />
      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        hidden
      />
      <PageContainer>
        <section className="mb-10">
          <div className="text-label text-ink-500 mb-2">本周索引</div>
          <h1 className="font-display text-[44px] sm:text-[56px] leading-[1.05] tracking-tight">
            Tasks in motion<span className="text-stamp-600">.</span>
          </h1>
          <p className="mt-3 max-w-xl text-ink-500 text-[15px] leading-relaxed">
            一本可以呼吸的、属于你自己的索引卡片簿。专注地记录，专注地完成。
          </p>
        </section>
        <StatsBar />
        <Toolbar searchInputRef={searchInputRef} />
        <TodoList />
        <footer className="mt-16 border-t border-rule-200 pt-10 text-center font-mono text-[11px] tracking-wider text-ink-300">
          YOUR · TODO · 数据保存在你自己的浏览器 · 永不上传
          <br />
          快捷键：⌘K 搜索 · ⌘N 新建 · Esc 关闭
        </footer>
      </PageContainer>

      <TodoDrawer />
      <ConfirmDialog
        open={confirmDelete.open}
        variant="danger"
        title="删除这条待办？"
        description={
          confirmDelete.open ? (
            <>
              此操作不可撤销。待办「
              <strong className="text-ink-900">{confirmDelete.title}</strong>
              」将被永久删除。
            </>
          ) : null
        }
        confirmLabel="删除"
        cancelLabel="取消"
        onConfirm={onConfirmDelete}
        onCancel={closeConfirm}
      />
      <ToastHost />

      {/* close drawer on overlay click is handled inside Drawer */}
      {/* noop to silence linter for closeDrawer not used elsewhere */}
      <span hidden onClick={closeDrawer} />
    </>
  );
}
