export type AnalysisRequest = {
  year: number;
  month: number;
  summary: {
    totalCount: number;
    completedCount: number;
    completionRate: number;
    recurrenceCount: number;
    recurrenceRate: number;
    highPriorityCount: number;
    averageResolutionDays: number | null;
  };
  causeCategoryCounts: {
    category: string;
    count: number;
  }[];
};

export async function analyzeByAI(
  request: AnalysisRequest,
): Promise<string> {
  await new Promise((resolve) =>
    setTimeout(resolve, 1500),
  );

  const topCategory =
    request.causeCategoryCounts[0];

  return `
【分析結果】

対象期間：${request.year}年${request.month}月

総不具合件数：${request.summary.totalCount}件
完了率：${request.summary.completionRate}%
再発率：${request.summary.recurrenceRate}%

原因分類：
${topCategory ? `${topCategory.category} (${topCategory.count}件)` : "データなし"}

【改善提案】

・原因分類ごとのレビューを実施してください。
・高優先度不具合のレビューを強化してください。
・再発防止策の有効性を確認してください。
`;
}