export type MonthlyWorkload = {
  id: string;
  month: string;
  assignee: string;
  taskCount: number;
  registeredAt: string;
  updatedAt: string;
};

export type MonthlyWorkloadFormValues = {
  month: string;
  assignee: string;
  taskCount: number;
};
