import { useStats } from "@/store/selectors";
import { PRIORITY_LABEL_EN, PRIORITY_LABEL_ZH } from "@/types/todo";
import { DistributionList, type DistributionItem } from "./DistributionList";
import { StatNumberCell } from "./StatNumberCell";

export function StatsBar() {
  const stats = useStats();
  const priorityItems: DistributionItem[] = stats.byPriority.map((p) => ({
    label: (
      <span>
        <span className="font-mono mr-2 text-[11px] text-ink-500">{PRIORITY_LABEL_EN[p.priority]}</span>
        {PRIORITY_LABEL_ZH[p.priority]}
      </span>
    ),
    count: p.count,
    total: stats.total || 1,
  }));
  const categoryItems: DistributionItem[] = stats.byCategoryTop5.map((c) => ({
    label: <span>#{c.category}</span>,
    count: c.count,
    total: stats.total || 1,
  }));

  return (
    <section aria-label="统计概览" className="mb-12">
      <header className="sect-rule mb-4">
        <span className="text-label text-ink-500">OVERVIEW · 概览</span>
      </header>
      <dl
        className="grid grid-cols-2 sm:grid-cols-5 border border-rule-400 bg-paper-100 [&>*+*]:border-l [&>*+*]:border-rule-400 max-sm:[&>*]:border-l-0 max-sm:[&>*+*]:border-t max-sm:[&>*+*]:border-rule-400 max-sm:[&>*:nth-child(odd):not(:first-child)]:border-t max-sm:[&>*:nth-child(even):not(:nth-child(2))]:border-l max-sm:[&>*:nth-child(even):not(:nth-child(2))]:border-rule-400 max-sm:[&>*:last-child]:col-span-2"
      >
        <StatNumberCell value={stats.total} labelEn="TOTAL" labelZh="总数" />
        <StatNumberCell value={stats.active} labelEn="ACTIVE" labelZh="进行" />
        <StatNumberCell value={stats.done} labelEn="DONE" labelZh="完成" />
        <StatNumberCell
          value={Number.isInteger(stats.rate) ? `${stats.rate}.0` : stats.rate.toString()}
          unit="%"
          labelEn="RATE"
          labelZh="完成率"
        />
        <StatNumberCell
          value={stats.overdue}
          labelEn="OVERDUE"
          labelZh="逾期"
          tone={stats.overdue > 0 ? "overdue" : "default"}
        />
      </dl>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div>
          <header className="sect-rule mb-4">
            <span className="text-label text-ink-500">BY PRIORITY · 按优先级</span>
          </header>
          <DistributionList items={priorityItems} />
        </div>
        <div>
          <header className="sect-rule mb-4">
            <span className="text-label text-ink-500">BY CATEGORY · 按分类</span>
          </header>
          <DistributionList items={categoryItems} emptyHint="暂无分类（先添加几条待办试试）" />
        </div>
      </div>
    </section>
  );
}
