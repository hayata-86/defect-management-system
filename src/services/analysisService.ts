import type { DefectDetail } from "../types/defect";

export type CauseCategoryCount = {
  category: string;
  count: number;
};

export type AssigneeAnalysis = {
  assignee: string;
  totalCount: number;
  completedCount: number;
  completionRate: number;
  recurrenceCount: number;
  recurrenceRate: number;
  averageResolutionDays: number | null;
};

export type MonthlyAnalysis = {
  year: number;
  month: number;
  totalCount: number;
  completedCount: number;
  completionRate: number;
  recurrenceCount: number;
  recurrenceRate: number;
  highPriorityCount: number;
  averageResolutionDays: number | null;
  causeCategoryCounts: CauseCategoryCount[];
};

function calculateRate(
  numerator: number,
  denominator: number,
): number {
  if (denominator === 0) {
    return 0;
  }

  return Number(
    ((numerator / denominator) * 100).toFixed(1),
  );
}

function calculateResolutionDays(
  occurredAt: string,
  completedAt: string,
): number | null {
  if (!occurredAt || !completedAt) {
    return null;
  }

  const occurredDate = new Date(`${occurredAt}T00:00:00`);
  const completedDate = new Date(`${completedAt}T00:00:00`);

  const difference =
    completedDate.getTime() - occurredDate.getTime();

  if (difference < 0) {
    return null;
  }

  return Math.floor(
    difference / (1000 * 60 * 60 * 24),
  );
}

function calculateAverageResolutionDays(
  defects: DefectDetail[],
): number | null {
  const resolutionDays = defects
    .map((defect) =>
      calculateResolutionDays(
        defect.occurredAt,
        defect.completedAt,
      ),
    )
    .filter(
      (days): days is number =>
        days !== null,
    );

  if (resolutionDays.length === 0) {
    return null;
  }

  const totalDays = resolutionDays.reduce(
    (total, days) => total + days,
    0,
  );

  return Number(
    (totalDays / resolutionDays.length).toFixed(1),
  );
}

export function analyzeMonthlyDefects(
  defects: DefectDetail[],
  year: number,
  month: number,
): MonthlyAnalysis {
  const targetMonth = `${year}-${String(month).padStart(
    2,
    "0",
  )}`;

  const monthlyDefects = defects.filter((defect) =>
    defect.occurredAt.startsWith(targetMonth),
  );

  const completedDefects = monthlyDefects.filter(
    (defect) => defect.status === "完了",
  );

  const recurrenceDefects = monthlyDefects.filter(
    (defect) => defect.isRecurrence,
  );

  const highPriorityDefects = monthlyDefects.filter(
    (defect) => defect.priority === "高",
  );

  const causeCountMap = new Map<string, number>();

  monthlyDefects.forEach((defect) => {
    const category =
      defect.causeCategory || "未分類";

    causeCountMap.set(
      category,
      (causeCountMap.get(category) ?? 0) + 1,
    );
  });

  const causeCategoryCounts = Array.from(
    causeCountMap.entries(),
  )
    .map(([category, count]) => ({
      category,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    year,
    month,
    totalCount: monthlyDefects.length,
    completedCount: completedDefects.length,
    completionRate: calculateRate(
      completedDefects.length,
      monthlyDefects.length,
    ),
    recurrenceCount: recurrenceDefects.length,
    recurrenceRate: calculateRate(
      recurrenceDefects.length,
      monthlyDefects.length,
    ),
    highPriorityCount:
      highPriorityDefects.length,
    averageResolutionDays:
      calculateAverageResolutionDays(
        completedDefects,
      ),
    causeCategoryCounts,
  };
}

export function analyzeAssigneeDefects(
  defects: DefectDetail[],
  assignee: string,
): AssigneeAnalysis {
  const assigneeDefects = defects.filter(
    (defect) => defect.assignee === assignee,
  );

  const completedDefects = assigneeDefects.filter(
    (defect) => defect.status === "完了",
  );

  const recurrenceDefects = assigneeDefects.filter(
    (defect) => defect.isRecurrence,
  );

  return {
    assignee,
    totalCount: assigneeDefects.length,
    completedCount: completedDefects.length,
    completionRate: calculateRate(
      completedDefects.length,
      assigneeDefects.length,
    ),
    recurrenceCount: recurrenceDefects.length,
    recurrenceRate: calculateRate(
      recurrenceDefects.length,
      assigneeDefects.length,
    ),
    averageResolutionDays:
      calculateAverageResolutionDays(
        completedDefects,
      ),
  };
}