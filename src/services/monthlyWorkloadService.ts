import type {
  MonthlyWorkload,
  MonthlyWorkloadFormValues,
} from "../types/monthlyWorkload";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3001";

const ENDPOINT = `${API_BASE_URL}/monthlyWorkloads`;

export async function getMonthlyWorkloads(): Promise<MonthlyWorkload[]> {
  const response = await fetch(ENDPOINT);

  if (!response.ok) {
    throw new Error(
      `担当課題数データの取得に失敗しました。HTTP ${response.status}`,
    );
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("担当課題数データの形式が正しくありません。");
  }

  return data as MonthlyWorkload[];
}

export async function saveMonthlyWorkload(
  values: MonthlyWorkloadFormValues,
): Promise<MonthlyWorkload> {
  const month = values.month.trim();
  const assignee = values.assignee.trim();

  const query = new URLSearchParams({
    month,
    assignee,
  });

  const existingResponse = await fetch(`${ENDPOINT}?${query.toString()}`);

  if (!existingResponse.ok) {
    throw new Error("既存の担当課題数データを確認できませんでした。");
  }

  const existingData: unknown = await existingResponse.json();

  if (!Array.isArray(existingData)) {
    throw new Error("既存データの形式が正しくありません。");
  }

  const now = new Date().toISOString();

  if (existingData.length > 0) {
    const existing = existingData[0] as MonthlyWorkload;

    const updateResponse = await fetch(`${ENDPOINT}/${existing.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        taskCount: values.taskCount,
        updatedAt: now,
      }),
    });

    if (!updateResponse.ok) {
      throw new Error("担当課題数の更新に失敗しました。");
    }

    return (await updateResponse.json()) as MonthlyWorkload;
  }

  const normalizedAssignee = assignee
    .toLowerCase()
    .replace(/\s+/g, "-");

  const newMonthlyWorkload: MonthlyWorkload = {
    id: `${month}-${normalizedAssignee}`,
    month,
    assignee,
    taskCount: values.taskCount,
    registeredAt: now,
    updatedAt: now,
  };

  const createResponse = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newMonthlyWorkload),
  });

  if (!createResponse.ok) {
    throw new Error("担当課題数の登録に失敗しました。");
  }

  return (await createResponse.json()) as MonthlyWorkload;
}

export async function deleteMonthlyWorkload(id: string): Promise<void> {
  const response = await fetch(`${ENDPOINT}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("担当課題数データの削除に失敗しました。");
  }
}
