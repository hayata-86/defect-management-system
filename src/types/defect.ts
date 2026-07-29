export type DefectStatus =
  | "未対応"
  | "対応中"
  | "完了";

export type DefectPriority =
  | "高"
  | "中"
  | "低";

  export type DefectCauseCategory =
  | "要件確認不足"
  | "設計不備"
  | "実装不備"
  | "テスト不足"
  | "レビュー不足"
  | "環境・設定不備"
  | "データ不備"
  | "その他";

export type DefectFormValues = {
  title: string;
  projectName: string;
  assignee: string;
  status: DefectStatus;
  priority: DefectPriority;
  occurredAt: string;
  dueDate: string;
  description: string;

  // 原因分析
  cause: string;
  rootCause: string;

  // 対策
  countermeasure: string;
  verificationMethod: string;
  implementationTiming: string;

    // AI分析・集計用
  causeCategory: DefectCauseCategory | "";
  isRecurrence: boolean;
  relatedDefectId: string;
  completedAt: string;
};

export type DefectDetail =
  DefectFormValues & {
    id: string;
    registeredAt: string;
    updatedAt: string;
  };

// 不具合一覧画面の検索条件
export type DefectSearchConditions = {
  keyword: string;
  projectName: string;
  assignee: string;
  status: DefectStatus | "";
  priority: DefectPriority | "";
};