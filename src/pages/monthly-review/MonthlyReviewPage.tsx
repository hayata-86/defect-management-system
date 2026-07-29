import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

type Defect = {
  id: string;
  title: string;
  projectName?: string;
  assignee?: string;
  status?: string;
  priority?: string;
  occurredAt: string;
  dueDate?: string;
  description?: string;
  cause?: string;
  rootCause?: string;
  countermeasure?: string;
  verificationMethod?: string;
  implementationTiming?: string;
  causeCategory?: string;
  isRecurrence?: boolean;
  relatedDefectId?: string;
  completedAt?: string;
  registeredAt?: string;
  updatedAt?: string;
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

type MonthlySummary = {
  month: string;
  assignedTaskCount: number;
  defectCount: number;
  reworkCount: number;
  reworkTaskCount: number;
  reworkRate: number;
  averageReworkCount: number;
  targetRate: number;
};

type MonthlyReview = {
  goodPoints: string;
  problemPoints: string;
  nextActions: string;
};

type SummaryCardProps = {
  title: string;
  value: string;
  description: string;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3001";

const ALL_ASSIGNEES = "__all__";

function SummaryCard({
  title,
  value,
  description,
}: SummaryCardProps) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>

        <Typography
          variant="h4"
          sx={{
            marginTop: 1,
            marginBottom: 1,
            fontWeight: 700,
          }}
        >
          {value}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split("-");

  if (!year || !monthNumber) {
    return month;
  }

  return `${year}年${Number(monthNumber)}月`;
}

function normalizeReworkCount(
  value: number | string | undefined,
): number {
  const convertedValue = Number(value ?? 0);

  if (!Number.isFinite(convertedValue) || convertedValue < 0) {
    return 0;
  }

  return convertedValue;
}

export function MonthlyReviewPage() {
  const [defects, setDefects] = useState<Defect[]>([]);
  const [monthlyWorkloads, setMonthlyWorkloads] =
    useState<MonthlyWorkload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedAssignee, setSelectedAssignee] =
    useState(ALL_ASSIGNEES);
  const [goodPoints, setGoodPoints] = useState("");
  const [problemPoints, setProblemPoints] = useState("");
  const [nextActions, setNextActions] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async (): Promise<void> => {
      setLoading(true);
      setError("");

      try {
        const [defectResponse, workloadResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/defects`, {
            signal: abortController.signal,
          }),
          fetch(`${API_BASE_URL}/monthlyWorkloads`, {
            signal: abortController.signal,
          }),
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
          throw new Error(
            "不具合一覧のレスポンス形式が正しくありません。",
          );
        }

        if (!Array.isArray(workloadData)) {
          throw new Error(
            "担当課題数のレスポンス形式が正しくありません。",
          );
        }

        setDefects(defectData as Defect[]);
        setMonthlyWorkloads(workloadData as MonthlyWorkload[]);
      } catch (fetchError) {
        if (
          fetchError instanceof DOMException &&
          fetchError.name === "AbortError"
        ) {
          return;
        }

        console.error(fetchError);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "月次データの取得に失敗しました。",
        );
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      abortController.abort();
    };
  }, []);

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

  const monthlySummaries = useMemo<MonthlySummary[]>(() => {
    const summaryMap = new Map<string, MonthlySummary>();

    monthlyWorkloads.forEach((workload) => {
      if (
        !/^\d{4}-\d{2}$/.test(workload.month) ||
        (selectedAssignee !== ALL_ASSIGNEES &&
          workload.assignee !== selectedAssignee)
      ) {
        return;
      }

      const taskCount = Number(workload.taskCount ?? 0);

      if (!summaryMap.has(workload.month)) {
        summaryMap.set(workload.month, {
          month: workload.month,
          assignedTaskCount: 0,
          defectCount: 0,
          reworkCount: 0,
          reworkTaskCount: 0,
          reworkRate: 0,
          averageReworkCount: 0,
          targetRate: 30,
        });
      }

      const summary = summaryMap.get(workload.month);

      if (!summary) {
        return;
      }

      if (Number.isFinite(taskCount) && taskCount >= 0) {
        summary.assignedTaskCount += taskCount;
      }
    });

    defects.forEach((defect) => {
      if (
        !defect.occurredAt ||
        (selectedAssignee !== ALL_ASSIGNEES &&
          defect.assignee !== selectedAssignee)
      ) {
        return;
      }

      const month = defect.occurredAt.slice(0, 7);

      if (!/^\d{4}-\d{2}$/.test(month)) {
        return;
      }

      if (!summaryMap.has(month)) {
        summaryMap.set(month, {
          month,
          assignedTaskCount: 0,
          defectCount: 0,
          reworkCount: 0,
          reworkTaskCount: 0,
          reworkRate: 0,
          averageReworkCount: 0,
          targetRate: 30,
        });
      }

      const summary = summaryMap.get(month);

      if (!summary) {
        return;
      }

      const reworkCount = normalizeReworkCount(defect.reworkCount);

      summary.defectCount += 1;
      summary.reworkCount += reworkCount;

      if (reworkCount > 0) {
        summary.reworkTaskCount += 1;
      }
    });

    summaryMap.forEach((summary) => {
      summary.reworkRate =
        summary.assignedTaskCount === 0
          ? 0
          : Number(
              (
                (summary.reworkTaskCount /
                  summary.assignedTaskCount) *
                100
              ).toFixed(1),
            );

      summary.averageReworkCount =
        summary.reworkTaskCount === 0
          ? 0
          : Number(
              (
                summary.reworkCount /
                summary.reworkTaskCount
              ).toFixed(1),
            );
    });

    return [...summaryMap.values()].sort((a, b) =>
      a.month.localeCompare(b.month),
    );
  }, [defects, monthlyWorkloads, selectedAssignee]);

  useEffect(() => {
    if (monthlySummaries.length === 0) {
      setSelectedMonth("");
      return;
    }

    const selectedMonthExists = monthlySummaries.some(
      (summary) => summary.month === selectedMonth,
    );

    if (!selectedMonthExists) {
      setSelectedMonth(
        monthlySummaries[monthlySummaries.length - 1].month,
      );
    }
  }, [monthlySummaries, selectedMonth]);

  useEffect(() => {
    if (!selectedMonth) {
      return;
    }

    const assigneeKey =
      selectedAssignee === ALL_ASSIGNEES
        ? "all"
        : selectedAssignee;

    const storageKey =
      `monthly-review-${selectedMonth}-${assigneeKey}`;

    const savedReview = localStorage.getItem(storageKey);

    if (!savedReview) {
      setGoodPoints("");
      setProblemPoints("");
      setNextActions("");
      return;
    }

    try {
      const review = JSON.parse(savedReview) as MonthlyReview;

      setGoodPoints(review.goodPoints ?? "");
      setProblemPoints(review.problemPoints ?? "");
      setNextActions(review.nextActions ?? "");
    } catch (parseError) {
      console.error(
        "月次振り返りの読み込みに失敗しました。",
        parseError,
      );

      setGoodPoints("");
      setProblemPoints("");
      setNextActions("");
    }
  }, [selectedMonth, selectedAssignee]);

  const selectedSummary = useMemo(() => {
    if (monthlySummaries.length === 0) {
      return null;
    }

    return (
      monthlySummaries.find(
        (summary) => summary.month === selectedMonth,
      ) ?? monthlySummaries[0]
    );
  }, [monthlySummaries, selectedMonth]);

  const previousSummary = useMemo(() => {
    if (!selectedSummary) {
      return null;
    }

    const currentIndex = monthlySummaries.findIndex(
      (summary) => summary.month === selectedSummary.month,
    );

    if (currentIndex <= 0) {
      return null;
    }

    return monthlySummaries[currentIndex - 1];
  }, [monthlySummaries, selectedSummary]);

  const rateDifference =
    previousSummary && selectedSummary
      ? Number(
          (
            selectedSummary.reworkRate -
            previousSummary.reworkRate
          ).toFixed(1),
        )
      : null;

  const targetAchievementRate =
    !selectedSummary
      ? 0
      : selectedSummary.reworkRate === 0
        ? 100
        : selectedSummary.targetRate === 0
          ? 0
          : Math.min(
              100,
              Math.round(
                (selectedSummary.targetRate /
                  selectedSummary.reworkRate) *
                  100,
              ),
            );

  const isTargetAchieved = selectedSummary
    ? selectedSummary.reworkRate <= selectedSummary.targetRate
    : false;

  const handleSave = (): void => {
    if (!selectedMonth) {
      setSaveError("対象月を選択してください。");
      return;
    }

    const review: MonthlyReview = {
      goodPoints: goodPoints.trim(),
      problemPoints: problemPoints.trim(),
      nextActions: nextActions.trim(),
    };

    const assigneeKey =
      selectedAssignee === ALL_ASSIGNEES
        ? "all"
        : selectedAssignee;

    const storageKey =
      `monthly-review-${selectedMonth}-${assigneeKey}`;

    try {
      localStorage.setItem(storageKey, JSON.stringify(review));
      setSaveError("");
      setIsSaved(true);
    } catch (saveError) {
      console.error(
        "月次振り返りの保存に失敗しました。",
        saveError,
      );

      setIsSaved(false);
      setSaveError("月次振り返りの保存に失敗しました。");
    }
  };

  if (loading) {
    return <Box sx={{ padding: 3 }}>読み込み中...</Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!selectedSummary) {
    return (
      <Alert severity="info">
        表示できるデータがありません。担当課題数を登録してください。
      </Alert>
    );
  }

  const workloadMissing =
    selectedSummary.assignedTaskCount === 0 &&
    selectedSummary.defectCount > 0;

  return (
    <>
      <Stack spacing={3}>
      <Box>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 700 }}
        >
          月次振り返り
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ marginTop: 0.5 }}
        >
          月ごとの担当課題数と手戻り状況を確認し、
          次月の行動目標を設定します。
        </Typography>
      </Box>

      {workloadMissing && (
        <Alert severity="warning">
          選択中の月・担当者に担当課題数が登録されていないため、
          手戻り発生率を計算できません。
        </Alert>
      )}

      <Paper variant="outlined" sx={{ padding: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="assignee-label">
              担当者
            </InputLabel>

            <Select
              labelId="assignee-label"
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
            <InputLabel id="month-label">
              対象月
            </InputLabel>

            <Select
              labelId="month-label"
              label="対象月"
              value={selectedMonth}
              onChange={(event) =>
                setSelectedMonth(event.target.value)
              }
            >
              {monthlySummaries.map((summary) => (
                <MenuItem
                  key={summary.month}
                  value={summary.month}
                >
                  {formatMonthLabel(summary.month)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            xl: "repeat(6, 1fr)",
          },
          gap: 2,
        }}
      >
        <SummaryCard
          title="担当課題数"
          value={`${selectedSummary.assignedTaskCount}件`}
          description="当月に担当した課題数"
        />

        <SummaryCard
          title="不具合件数"
          value={`${selectedSummary.defectCount}件`}
          description="当月に登録された不具合数"
        />

        <SummaryCard
          title="手戻り合計回数"
          value={`${selectedSummary.reworkCount}回`}
          description="当月に発生した手戻りの合計"
        />

        <SummaryCard
          title="手戻り発生課題数"
          value={`${selectedSummary.reworkTaskCount}件`}
          description="手戻りが発生した不具合数"
        />

        <SummaryCard
          title="手戻り発生率"
          value={
            selectedSummary.assignedTaskCount === 0
              ? "算出不可"
              : `${selectedSummary.reworkRate}%`
          }
          description="担当課題数に対する割合"
        />

        <SummaryCard
          title="平均手戻り回数"
          value={`${selectedSummary.averageReworkCount}回`}
          description="手戻り課題1件あたりの平均"
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "repeat(2, 1fr)",
          },
          gap: 3,
        }}
      >
        <Paper variant="outlined" sx={{ padding: 3 }}>
          <Stack spacing={2}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                目標達成状況
              </Typography>

              <Chip
                label={
                  workloadMissing
                    ? "算出不可"
                    : isTargetAchieved
                      ? "目標達成"
                      : "目標未達"
                }
                color={
                  workloadMissing
                    ? "default"
                    : isTargetAchieved
                      ? "success"
                      : "warning"
                }
              />
            </Box>

            <Divider />

            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                手戻り発生率の目標
              </Typography>

              <Typography
                variant="h5"
                sx={{ marginTop: 0.5, fontWeight: 700 }}
              >
                {selectedSummary.targetRate}%以下
              </Typography>
            </Box>

            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 1,
                }}
              >
                <Typography variant="body2">達成度</Typography>
                <Typography variant="body2">
                  {workloadMissing
                    ? "-"
                    : `${targetAchievementRate}%`}
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={
                  workloadMissing
                    ? 0
                    : isTargetAchieved
                      ? 100
                      : targetAchievementRate
                }
              />
            </Box>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ padding: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              前月比較
            </Typography>

            <Divider />

            {previousSummary &&
            previousSummary.assignedTaskCount > 0 &&
            selectedSummary.assignedTaskCount > 0 ? (
              <>
                <Typography>
                  前月の手戻り発生率：
                  <strong>{previousSummary.reworkRate}%</strong>
                </Typography>

                <Typography>
                  当月の手戻り発生率：
                  <strong>{selectedSummary.reworkRate}%</strong>
                </Typography>

                <Typography>
                  前月差：
                  <Chip
                    size="small"
                    sx={{ marginLeft: 1 }}
                    label={
                      rateDifference === 0
                        ? "変化なし"
                        : `${
                            rateDifference !== null &&
                            rateDifference > 0
                              ? "+"
                              : ""
                          }${rateDifference}%`
                    }
                    color={
                      rateDifference !== null &&
                      rateDifference < 0
                        ? "success"
                        : rateDifference !== null &&
                            rateDifference > 0
                          ? "error"
                          : "default"
                    }
                  />
                </Typography>
              </>
            ) : (
              <Typography color="text.secondary">
                比較可能な前月データがありません。
              </Typography>
            )}
          </Stack>
        </Paper>
      </Box>

      <Paper variant="outlined" sx={{ padding: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              振り返り内容
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ marginTop: 0.5 }}
            >
              当月の結果を振り返り、次月の改善行動を記録します。
            </Typography>
          </Box>

          <TextField
            label="良かった点"
            value={goodPoints}
            onChange={(event) =>
              setGoodPoints(event.target.value)
            }
            multiline
            minRows={3}
            fullWidth
            placeholder="計画どおりに進められた点や、継続したい行動を入力してください。"
          />

          <TextField
            label="課題・改善点"
            value={problemPoints}
            onChange={(event) =>
              setProblemPoints(event.target.value)
            }
            multiline
            minRows={3}
            fullWidth
            placeholder="手戻りの原因や、改善が必要な点を入力してください。"
          />

          <TextField
            label="次月の行動目標"
            value={nextActions}
            onChange={(event) =>
              setNextActions(event.target.value)
            }
            multiline
            minRows={3}
            fullWidth
            placeholder="次月に実施する具体的な行動を入力してください。"
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={
                !goodPoints.trim() &&
                !problemPoints.trim() &&
                !nextActions.trim()
              }
            >
              振り返りを保存
            </Button>
          </Box>
        </Stack>
      </Paper>
      </Stack>

      <Snackbar
        open={isSaved}
        autoHideDuration={3000}
        onClose={() => setIsSaved(false)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setIsSaved(false)}
        >
          月次振り返りを保存しました。
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(saveError)}
        autoHideDuration={5000}
        onClose={() => setSaveError("")}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setSaveError("")}
        >
          {saveError}
        </Alert>
      </Snackbar>
    </>
  );
}