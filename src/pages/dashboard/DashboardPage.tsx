import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  DashboardHeader,
  RecentDefectTable,
} from "../../components/dashboard";
import type { RecentDefect } from "../../components/dashboard";

type Defect = {
  id: string | number;
  taskNumber?: string;
  title: string;
  projectName?: string;
  assignee?: string;
  status?: string;
  priority?: string;
  occurredAt?: string;
  registeredAt?: string;
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string;
  month?: string;
  causeCategory?: string;
  reworkCount?: number | string;
};

type MonthlyWorkload = {
  id: string;
  month: string;
  assignee: string;
  taskCount: number;
  registeredAt?: string;
  updatedAt?: string;
};

type MonthlyTrend = {
  month: string;
  taskCount: number;
  defectCount: number;
  reworkCount: number;
  reworkTaskCount: number;
  reworkRate: number | null;
};

type CauseSummary = {
  cause: string;
  count: number;
};

type MetricCardProps = {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  chipLabel?: string;
  chipColor?: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3001";

const ALL_ASSIGNEES = "__all__";

const formatDateTime = (): string =>
  new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

const normalizeStatus = (status?: string): "未対応" | "対応中" | "完了" => {
  switch (status?.toUpperCase()) {
    case "OPEN":
    case "UNASSIGNED":
    case "未対応":
      return "未対応";

    case "IN_PROGRESS":
    case "対応中":
      return "対応中";

    case "COMPLETED":
    case "CLOSED":
    case "DONE":
    case "完了":
      return "完了";

    default:
      return "未対応";
  }
};

const normalizeReworkCount = (
  value: number | string | undefined,
): number => {
  const convertedValue = Number(value ?? 0);

  if (!Number.isFinite(convertedValue) || convertedValue < 0) {
    return 0;
  }

  return convertedValue;
};

const getMonthFromDefect = (defect: Defect): string | null => {
  if (defect.occurredAt && defect.occurredAt.length >= 7) {
    const month = defect.occurredAt.slice(0, 7);

    if (/^\d{4}-\d{2}$/.test(month)) {
      return month;
    }
  }

  if (defect.month) {
    if (/^\d{4}-\d{2}$/.test(defect.month)) {
      return defect.month;
    }

    const matched = defect.month.match(/^(\d{4})\.(\d{1,2})$/);

    if (matched) {
      return `${matched[1]}-${matched[2].padStart(2, "0")}`;
    }
  }

  return null;
};

const formatMonthLabel = (month: string): string => {
  const [year, monthNumber] = month.split("-");

  if (!year || !monthNumber) {
    return month;
  }

  return `${year}年${Number(monthNumber)}月`;
};

const formatRegisteredDate = (value?: string): string => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const convertMonthToDate = (month?: string): string | undefined => {
  if (!month) {
    return undefined;
  }

  if (/^\d{4}-\d{2}$/.test(month)) {
    return `${month}-01`;
  }

  const [year, monthNumber] = month.split(".");

  if (!year || !monthNumber) {
    return undefined;
  }

  return `${year}-${monthNumber.padStart(2, "0")}-01`;
};

function MetricCard({
  title,
  value,
  description,
  icon,
  chipLabel,
  chipColor = "default",
}: MetricCardProps) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: "action.hover",
              }}
            >
              {icon}
            </Box>

            {chipLabel && (
              <Chip
                size="small"
                label={chipLabel}
                color={chipColor}
              />
            )}
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: 700, marginTop: 0.5 }}>
              {value}
            </Typography>
          </Box>

          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();

  const [defects, setDefects] = useState<Defect[]>([]);
  const [monthlyWorkloads, setMonthlyWorkloads] =
    useState<MonthlyWorkload[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedAssignee, setSelectedAssignee] =
    useState(ALL_ASSIGNEES);
  const [updatedAt, setUpdatedAt] = useState(formatDateTime());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDashboardData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [defectResponse, workloadResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/defects`),
        fetch(`${API_BASE_URL}/monthlyWorkloads`),
      ]);

      if (!defectResponse.ok) {
        throw new Error(
          `不具合一覧の取得に失敗しました。HTTP ${defectResponse.status}`,
        );
      }

      if (!workloadResponse.ok) {
        throw new Error(
          `担当課題数の取得に失敗しました。HTTP ${workloadResponse.status}`,
        );
      }

      const defectData: unknown = await defectResponse.json();
      const workloadData: unknown = await workloadResponse.json();

      if (!Array.isArray(defectData)) {
        throw new Error("不具合一覧のレスポンス形式が正しくありません。");
      }

      if (!Array.isArray(workloadData)) {
        throw new Error("担当課題数のレスポンス形式が正しくありません。");
      }

      setDefects(defectData as Defect[]);
      setMonthlyWorkloads(workloadData as MonthlyWorkload[]);
      setUpdatedAt(formatDateTime());
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "ダッシュボードデータの取得に失敗しました。",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  const assignees = useMemo(() => {
    const values = new Set<string>();

    monthlyWorkloads.forEach((workload) => {
      const assignee = workload.assignee?.trim();

      if (assignee) {
        values.add(assignee);
      }
    });

    defects.forEach((defect) => {
      const assignee = defect.assignee?.trim();

      if (assignee) {
        values.add(assignee);
      }
    });

    return [...values].sort((left, right) =>
      left.localeCompare(right, "ja"),
    );
  }, [defects, monthlyWorkloads]);

  const monthlyTrend = useMemo<MonthlyTrend[]>(() => {
    const monthlyMap = new Map<string, MonthlyTrend>();

    monthlyWorkloads.forEach((workload) => {
      if (
        !/^\d{4}-\d{2}$/.test(workload.month) ||
        (selectedAssignee !== ALL_ASSIGNEES &&
          workload.assignee !== selectedAssignee)
      ) {
        return;
      }

      const current = monthlyMap.get(workload.month) ?? {
        month: workload.month,
        taskCount: 0,
        defectCount: 0,
        reworkCount: 0,
        reworkTaskCount: 0,
        reworkRate: null,
      };

      const taskCount = Number(workload.taskCount ?? 0);

      if (Number.isFinite(taskCount) && taskCount >= 0) {
        current.taskCount += taskCount;
      }

      monthlyMap.set(workload.month, current);
    });

    defects.forEach((defect) => {
      if (
        selectedAssignee !== ALL_ASSIGNEES &&
        defect.assignee !== selectedAssignee
      ) {
        return;
      }

      const month = getMonthFromDefect(defect);

      if (!month) {
        return;
      }

      const current = monthlyMap.get(month) ?? {
        month,
        taskCount: 0,
        defectCount: 0,
        reworkCount: 0,
        reworkTaskCount: 0,
        reworkRate: null,
      };

      const reworkCount = normalizeReworkCount(defect.reworkCount);

      current.defectCount += 1;
      current.reworkCount += reworkCount;

      if (reworkCount > 0) {
        current.reworkTaskCount += 1;
      }

      monthlyMap.set(month, current);
    });

    return [...monthlyMap.values()]
      .map((data) => ({
        ...data,
        reworkRate:
          data.taskCount === 0
            ? null
            : Number(
                (
                  (data.reworkTaskCount / data.taskCount) *
                  100
                ).toFixed(1),
              ),
      }))
      .sort((left, right) => left.month.localeCompare(right.month));
  }, [defects, monthlyWorkloads, selectedAssignee]);

  useEffect(() => {
    if (monthlyTrend.length === 0) {
      setSelectedMonth("");
      return;
    }

    const selectedMonthExists = monthlyTrend.some(
      (data) => data.month === selectedMonth,
    );

    if (!selectedMonthExists) {
      setSelectedMonth(monthlyTrend[monthlyTrend.length - 1].month);
    }
  }, [monthlyTrend, selectedMonth]);

  const selectedMonthlyData = useMemo(
    () =>
      monthlyTrend.find((data) => data.month === selectedMonth) ??
      null,
    [monthlyTrend, selectedMonth],
  );

  const filteredDefects = useMemo(
    () =>
      defects.filter((defect) => {
        const month = getMonthFromDefect(defect);

        if (selectedMonth && month !== selectedMonth) {
          return false;
        }

        if (
          selectedAssignee !== ALL_ASSIGNEES &&
          defect.assignee !== selectedAssignee
        ) {
          return false;
        }

        return true;
      }),
    [defects, selectedAssignee, selectedMonth],
  );

  const operationalSummary = useMemo(() => {
    const inProgressCount = filteredDefects.filter(
      (defect) => normalizeStatus(defect.status) === "対応中",
    ).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueCount = filteredDefects.filter((defect) => {
      if (!defect.dueDate || normalizeStatus(defect.status) === "完了") {
        return false;
      }

      const dueDate = new Date(defect.dueDate);

      if (Number.isNaN(dueDate.getTime())) {
        return false;
      }

      dueDate.setHours(0, 0, 0, 0);

      return dueDate < today;
    }).length;

    return {
      inProgressCount,
      overdueCount,
    };
  }, [filteredDefects]);

  const recentDefects = useMemo<RecentDefect[]>(() => {
    return [...filteredDefects]
      .sort((a, b) => {
        const dateA =
          a.registeredAt ??
          a.createdAt ??
          convertMonthToDate(a.month) ??
          a.occurredAt ??
          "";

        const dateB =
          b.registeredAt ??
          b.createdAt ??
          convertMonthToDate(b.month) ??
          b.occurredAt ??
          "";

        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .slice(0, 5)
      .map((defect, index) => {
        const numericId =
          Number(defect.taskNumber) ||
          Number(String(defect.id).replace(/\D/g, "")) ||
          index + 1;

        const registeredAt =
          defect.registeredAt ??
          defect.createdAt ??
          convertMonthToDate(defect.month) ??
          defect.occurredAt;

        return {
          id: numericId,
          title: defect.title,
          assignee: defect.assignee || "未設定",
          status: normalizeStatus(defect.status),
          registeredAt: formatRegisteredDate(registeredAt),
        };
      });
  }, [filteredDefects]);

  const causeSummary = useMemo<CauseSummary[]>(() => {
    const causeMap = new Map<string, number>();

    filteredDefects.forEach((defect) => {
      const cause = defect.causeCategory?.trim() || "未分類";
      causeMap.set(cause, (causeMap.get(cause) ?? 0) + 1);
    });

    return [...causeMap.entries()]
      .map(([cause, count]) => ({ cause, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 5);
  }, [filteredDefects]);

  const maximumCauseCount =
    causeSummary.length === 0
      ? 0
      : Math.max(...causeSummary.map((cause) => cause.count));

  const recentTrend = monthlyTrend.slice(-5);

  const handleRefresh = (): void => {
    void fetchDashboardData();
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          paddingTop: 8,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const workloadMissing =
    selectedMonthlyData !== null &&
    selectedMonthlyData.taskCount === 0 &&
    selectedMonthlyData.defectCount > 0;

  const reworkRateValue =
    selectedMonthlyData?.reworkRate === null ||
    selectedMonthlyData?.reworkRate === undefined
      ? "算出不可"
      : `${selectedMonthlyData.reworkRate}%`;

  return (
    <Box>
      <DashboardHeader
        updatedAt={updatedAt}
        onRefresh={handleRefresh}
      />

      {errorMessage && (
        <Alert severity="error" sx={{ marginTop: 3 }}>
          {errorMessage}
        </Alert>
      )}

      {workloadMissing && (
        <Alert severity="warning" sx={{ marginTop: 3 }}>
          選択中の月・担当者に担当課題数が登録されていないため、
          手戻り発生率を算出できません。
        </Alert>
      )}

      <Paper variant="outlined" sx={{ padding: 3, marginTop: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", lg: "center" },
            gap: 2,
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="dashboard-assignee-label">
                担当者
              </InputLabel>

              <Select
                labelId="dashboard-assignee-label"
                label="担当者"
                value={selectedAssignee}
                onChange={(event) =>
                  setSelectedAssignee(event.target.value)
                }
              >
                <MenuItem value={ALL_ASSIGNEES}>
                  全担当者
                </MenuItem>

                {assignees.map((assignee) => (
                  <MenuItem key={assignee} value={assignee}>
                    {assignee}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="dashboard-month-label">
                対象月
              </InputLabel>

              <Select
                labelId="dashboard-month-label"
                label="対象月"
                value={selectedMonth}
                onChange={(event) =>
                  setSelectedMonth(event.target.value)
                }
              >
                {monthlyTrend.map((data) => (
                  <MenuItem key={data.month} value={data.month}>
                    {formatMonthLabel(data.month)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Button
            variant="outlined"
            startIcon={<AnalyticsOutlinedIcon />}
            onClick={() => navigate("/analysis")}
          >
            AI分析画面へ
          </Button>
        </Box>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(3, minmax(0, 1fr))",
          },
          gap: 2,
          marginTop: 3,
        }}
      >
        <MetricCard
          title="担当課題数"
          value={`${selectedMonthlyData?.taskCount ?? 0}件`}
          description="monthlyWorkloadsに登録された課題数"
          icon={<AssignmentTurnedInOutlinedIcon />}
        />

        <MetricCard
          title="不具合件数"
          value={`${selectedMonthlyData?.defectCount ?? 0}件`}
          description="選択中の月に登録された不具合数"
          icon={<BugReportOutlinedIcon />}
        />

        <MetricCard
          title="手戻り発生率"
          value={reworkRateValue}
          description="担当課題数に対する手戻り課題の割合"
          icon={<AutorenewOutlinedIcon />}
          chipLabel={
            selectedMonthlyData?.reworkRate === null ||
            selectedMonthlyData?.reworkRate === undefined
              ? "未算出"
              : selectedMonthlyData.reworkRate <= 30
                ? "良好"
                : selectedMonthlyData.reworkRate <= 50
                  ? "注意"
                  : "要改善"
          }
          chipColor={
            selectedMonthlyData?.reworkRate === null ||
            selectedMonthlyData?.reworkRate === undefined
              ? "default"
              : selectedMonthlyData.reworkRate <= 30
                ? "success"
                : selectedMonthlyData.reworkRate <= 50
                  ? "warning"
                  : "error"
          }
        />

        <MetricCard
          title="手戻り合計回数"
          value={`${selectedMonthlyData?.reworkCount ?? 0}回`}
          description="選択中の月に発生した手戻りの合計"
          icon={<AssignmentLateIcon />}
        />

        <MetricCard
          title="対応中"
          value={`${operationalSummary.inProgressCount}件`}
          description="現在対応中の不具合件数"
          icon={<PendingActionsIcon />}
        />

        <MetricCard
          title="期限超過"
          value={`${operationalSummary.overdueCount}件`}
          description="期限を過ぎている未完了の不具合件数"
          icon={<ErrorOutlinedIcon />}
          chipLabel={
            operationalSummary.overdueCount === 0
              ? "問題なし"
              : "要確認"
          }
          chipColor={
            operationalSummary.overdueCount === 0
              ? "success"
              : "error"
          }
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            xl: "minmax(0, 3fr) minmax(320px, 2fr)",
          },
          gap: 3,
          marginTop: 3,
        }}
      >
        <Paper variant="outlined" sx={{ padding: 3 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                月別手戻り発生率
              </Typography>

              <Typography variant="body2" color="text.secondary">
                直近5か月の担当課題数と手戻り課題数から算出しています。
              </Typography>
            </Box>

            <Divider />

            {recentTrend.length === 0 ? (
              <Alert severity="info">
                表示できる月別データがありません。
              </Alert>
            ) : (
              recentTrend.map((data) => (
                <Box key={data.month}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 1,
                    }}
                  >
                    <Typography variant="body2">
                      {formatMonthLabel(data.month)}
                    </Typography>

                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {data.reworkRate === null
                        ? "算出不可"
                        : `${data.reworkRate}%`}
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={
                      data.reworkRate === null
                        ? 0
                        : Math.min(data.reworkRate, 100)
                    }
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              ))
            )}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ padding: 3 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                原因分類 TOP5
              </Typography>

              <Typography variant="body2" color="text.secondary">
                選択中の月・担当者の不具合を原因別に集計しています。
              </Typography>
            </Box>

            <Divider />

            {causeSummary.length === 0 ? (
              <Alert severity="info">
                原因分類データがありません。
              </Alert>
            ) : (
              causeSummary.map((cause) => (
                <Box key={cause.cause}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 1,
                    }}
                  >
                    <Typography variant="body2">
                      {cause.cause}
                    </Typography>

                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {cause.count}件
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={
                      maximumCauseCount === 0
                        ? 0
                        : (cause.count / maximumCauseCount) * 100
                    }
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              ))
            )}
          </Stack>
        </Paper>
      </Box>

      <Box sx={{ marginTop: 3 }}>
        <RecentDefectTable defects={recentDefects} />
      </Box>
    </Box>
  );
}

export default DashboardPage;
