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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { useAIAnalysis } from "../../hooks/useAIAnalysis";

type Defect = {
  id: string;
  title: string;
  projectName: string;
  assignee: string;
  status: string;
  priority: string;
  occurredAt: string;
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

type MonthlyAnalysis = {
  month: string;
  taskCount: number;
  defectCount: number;
  reworkCount: number;
  reworkTaskCount: number;
};

type CauseAnalysis = {
  cause: string;
  count: number;
};

type AnalysisCardProps = {
  title: string;
  value: string;
  description: string;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3001";

const ALL_ASSIGNEES = "__all__";

function AnalysisCard({
  title,
  value,
  description,
}: AnalysisCardProps) {
  return (
    <Card variant="outlined">
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

function getMonthFromOccurredAt(
  occurredAt: string,
): string | null {
  if (!occurredAt || occurredAt.length < 7) {
    return null;
  }

  const month = occurredAt.slice(0, 7);

  return /^\d{4}-\d{2}$/.test(month) ? month : null;
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

export function AnalysisPage() {
  const [period, setPeriod] = useState("5");
  const [selectedAssignee, setSelectedAssignee] =
    useState(ALL_ASSIGNEES);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [monthlyWorkloads, setMonthlyWorkloads] =
    useState<MonthlyWorkload[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataErrorMessage, setDataErrorMessage] = useState("");

  const {
    analysis,
    errorMessage,
    isAnalyzing,
    executeAnalysis,
    clearAnalysis,
  } = useAIAnalysis();

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async (): Promise<void> => {
      setIsLoadingData(true);
      setDataErrorMessage("");

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
            `不具合データの取得に失敗しました。HTTP ${defectResponse.status}`,
          );
        }

        if (!workloadResponse.ok) {
          throw new Error(
            `担当課題数データの取得に失敗しました。HTTP ${workloadResponse.status}`,
          );
        }

        const defectData: unknown = await defectResponse.json();
        const workloadData: unknown =
          await workloadResponse.json();

        if (!Array.isArray(defectData)) {
          throw new Error(
            "不具合データの形式が正しくありません。",
          );
        }

        if (!Array.isArray(workloadData)) {
          throw new Error(
            "担当課題数データの形式が正しくありません。",
          );
        }

        setDefects(defectData as Defect[]);
        setMonthlyWorkloads(workloadData as MonthlyWorkload[]);
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        setDataErrorMessage(
          error instanceof Error
            ? error.message
            : "分析データの取得中にエラーが発生しました。",
        );
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingData(false);
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

  const filteredDefects = useMemo(
    () =>
      selectedAssignee === ALL_ASSIGNEES
        ? defects
        : defects.filter(
            (defect) =>
              defect.assignee === selectedAssignee,
          ),
    [defects, selectedAssignee],
  );

  const filteredWorkloads = useMemo(
    () =>
      selectedAssignee === ALL_ASSIGNEES
        ? monthlyWorkloads
        : monthlyWorkloads.filter(
            (workload) =>
              workload.assignee === selectedAssignee,
          ),
    [monthlyWorkloads, selectedAssignee],
  );

  const monthlyData = useMemo<MonthlyAnalysis[]>(() => {
    const monthlyMap = new Map<string, MonthlyAnalysis>();

    filteredWorkloads.forEach((workload) => {
      if (!/^\d{4}-\d{2}$/.test(workload.month)) {
        return;
      }

      const taskCount = Number(workload.taskCount ?? 0);
      const current = monthlyMap.get(workload.month) ?? {
        month: workload.month,
        taskCount: 0,
        defectCount: 0,
        reworkCount: 0,
        reworkTaskCount: 0,
      };

      if (Number.isFinite(taskCount) && taskCount >= 0) {
        current.taskCount += taskCount;
      }

      monthlyMap.set(workload.month, current);
    });

    filteredDefects.forEach((defect) => {
      const month = getMonthFromOccurredAt(defect.occurredAt);

      if (!month) {
        return;
      }

      const reworkCount =
        normalizeReworkCount(defect.reworkCount);
      const current = monthlyMap.get(month) ?? {
        month,
        taskCount: 0,
        defectCount: 0,
        reworkCount: 0,
        reworkTaskCount: 0,
      };

      current.defectCount += 1;
      current.reworkCount += reworkCount;

      if (reworkCount > 0) {
        current.reworkTaskCount += 1;
      }

      monthlyMap.set(month, current);
    });

    return [...monthlyMap.values()].sort((left, right) =>
      left.month.localeCompare(right.month),
    );
  }, [filteredDefects, filteredWorkloads]);

  const displayedMonthlyData = useMemo<MonthlyAnalysis[]>(
    () => monthlyData.slice(-Number(period)),
    [monthlyData, period],
  );

  const displayedMonths = useMemo(
    () =>
      new Set(
        displayedMonthlyData.map((data) => data.month),
      ),
    [displayedMonthlyData],
  );

  const displayedDefects = useMemo(
    () =>
      filteredDefects.filter((defect) => {
        const month =
          getMonthFromOccurredAt(defect.occurredAt);

        return month ? displayedMonths.has(month) : false;
      }),
    [filteredDefects, displayedMonths],
  );

  const causeData = useMemo<CauseAnalysis[]>(() => {
    const causeMap = new Map<string, number>();

    displayedDefects.forEach((defect) => {
      const cause =
        defect.causeCategory?.trim() || "未分類";

      causeMap.set(
        cause,
        (causeMap.get(cause) ?? 0) + 1,
      );
    });

    return [...causeMap.entries()]
      .map(([cause, count]) => ({
        cause,
        count,
      }))
      .sort(
        (left, right) =>
          right.count - left.count,
      );
  }, [displayedDefects]);

  const totalTaskCount = displayedMonthlyData.reduce(
    (total, data) => total + data.taskCount,
    0,
  );

  const totalDefectCount =
    displayedMonthlyData.reduce(
      (total, data) => total + data.defectCount,
      0,
    );

  const totalReworkCount =
    displayedMonthlyData.reduce(
      (total, data) => total + data.reworkCount,
      0,
    );

  const totalReworkTaskCount =
    displayedMonthlyData.reduce(
      (total, data) =>
        total + data.reworkTaskCount,
      0,
    );

  const averageReworkRate =
    totalTaskCount === 0
      ? null
      : Number(
          (
            (totalReworkTaskCount /
              totalTaskCount) *
            100
          ).toFixed(1),
        );

  const latestData =
    displayedMonthlyData[
      displayedMonthlyData.length - 1
    ];

  const previousData =
    displayedMonthlyData[
      displayedMonthlyData.length - 2
    ];

  const latestRate =
    latestData && latestData.taskCount > 0
      ? Number(
          (
            (latestData.reworkTaskCount /
              latestData.taskCount) *
            100
          ).toFixed(1),
        )
      : null;

  const previousRate =
    previousData && previousData.taskCount > 0
      ? Number(
          (
            (previousData.reworkTaskCount /
              previousData.taskCount) *
            100
          ).toFixed(1),
        )
      : null;

  const rateDifference =
    latestRate !== null && previousRate !== null
      ? Number(
          (latestRate - previousRate).toFixed(1),
        )
      : null;

  const maximumCauseCount =
    causeData.length === 0
      ? 0
      : Math.max(
          ...causeData.map((cause) => cause.count),
        );

  const workloadMissingMonths =
    displayedMonthlyData
      .filter(
        (data) =>
          data.taskCount === 0 &&
          data.defectCount > 0,
      )
      .map((data) => data.month);

  const buildAnalysisPrompt = (): string => {
    const monthlySummary =
      displayedMonthlyData
        .map((data) => {
          const reworkRate =
            data.taskCount === 0
              ? "算出不可"
              : `${Number(
                  (
                    (data.reworkTaskCount /
                      data.taskCount) *
                    100
                  ).toFixed(1),
                )}%`;

          return [
            `対象月: ${data.month}`,
            `担当課題数: ${data.taskCount}件`,
            `不具合件数: ${data.defectCount}件`,
            `手戻り回数: ${data.reworkCount}回`,
            `手戻り課題数: ${data.reworkTaskCount}件`,
            `手戻り発生率: ${reworkRate}`,
          ].join("、");
        })
        .join("\n");

    const causeSummary =
      causeData.length === 0
        ? "原因分類データなし"
        : causeData
            .map(
              (cause) =>
                `${cause.cause}: ${cause.count}件`,
            )
            .join("\n");

    const defectSummary =
      displayedDefects
        .map((defect) =>
          [
            `ID: ${defect.id}`,
            `件名: ${defect.title}`,
            `プロジェクト: ${defect.projectName}`,
            `担当者: ${defect.assignee}`,
            `状態: ${defect.status}`,
            `優先度: ${defect.priority}`,
            `発生日: ${defect.occurredAt}`,
            `原因分類: ${
              defect.causeCategory || "未分類"
            }`,
            `手戻り回数: ${normalizeReworkCount(
              defect.reworkCount,
            )}回`,
          ].join("、"),
        )
        .join("\n");

    const targetAssignee =
      selectedAssignee === ALL_ASSIGNEES
        ? "全担当者"
        : selectedAssignee;

    return `
以下は不具合管理システムに登録されている実データの集計結果です。

【分析対象】
担当者: ${targetAssignee}
集計期間: 直近${period}か月

【全体集計】
担当課題数: ${totalTaskCount}件
不具合件数: ${totalDefectCount}件
手戻り合計回数: ${totalReworkCount}回
手戻りが発生した課題数: ${totalReworkTaskCount}件
平均手戻り発生率: ${
      averageReworkRate === null
        ? "算出不可"
        : `${averageReworkRate}%`
    }
最新月の手戻り発生率: ${
      latestRate === null
        ? "算出不可"
        : `${latestRate}%`
    }
前月との差: ${
      rateDifference === null
        ? "算出不可"
        : `${
            rateDifference > 0 ? "+" : ""
          }${rateDifference}%`
    }

【月別データ】
${monthlySummary || "月別データなし"}

【原因別データ】
${causeSummary}

【不具合一覧】
${defectSummary || "不具合データなし"}

上記データを分析し、次の項目に分けて日本語で回答してください。

1. 全体傾向
2. 注目すべき問題
3. 原因の考察
4. 改善策
5. 次月に確認すべき指標

担当課題数が0件の月については手戻り発生率を推測せず、「算出不可」として扱ってください。
数値と登録済み不具合の内容を根拠として示し、簡潔で実務的な内容にしてください。
    `.trim();
  };

  const handleAIAnalysis =
    async (): Promise<void> => {
      if (displayedDefects.length === 0) {
        return;
      }

      await executeAnalysis(
        buildAnalysisPrompt(),
      );
    };

  if (isLoadingData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 320,
        }}
      >
        <Stack
          spacing={2}
          sx={{ alignItems: "center" }}
        >
          <CircularProgress />

          <Typography color="text.secondary">
            分析データを読み込んでいます。
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 700 }}
        >
          分析
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ marginTop: 0.5 }}
        >
          登録済みの担当課題数と不具合データから、
          手戻り発生率と原因別の傾向を分析します。
        </Typography>
      </Box>

      {dataErrorMessage && (
        <Alert severity="error">
          {dataErrorMessage}
        </Alert>
      )}

      {!dataErrorMessage &&
        workloadMissingMonths.length > 0 && (
          <Alert severity="warning">
            次の月は担当課題数が未登録のため、
            手戻り発生率を算出できません：
            {workloadMissingMonths.join("、")}
          </Alert>
        )}

      {!dataErrorMessage &&
        defects.length === 0 &&
        monthlyWorkloads.length === 0 && (
          <Alert severity="info">
            分析対象となるデータが登録されていません。
          </Alert>
        )}

      <Paper variant="outlined" sx={{ padding: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
        >
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="assignee-analysis-label">
              担当者
            </InputLabel>

            <Select
              labelId="assignee-analysis-label"
              label="担当者"
              value={selectedAssignee}
              onChange={(event) => {
                setSelectedAssignee(
                  event.target.value,
                );
                clearAnalysis();
              }}
            >
              <MenuItem value={ALL_ASSIGNEES}>
                全担当者
              </MenuItem>

              {assignees.map((assignee) => (
                <MenuItem
                  key={assignee}
                  value={assignee}
                >
                  {assignee}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="period-label">
              集計期間
            </InputLabel>

            <Select
              labelId="period-label"
              label="集計期間"
              value={period}
              onChange={(event) => {
                setPeriod(event.target.value);
                clearAnalysis();
              }}
            >
              <MenuItem value="3">
                直近3か月
              </MenuItem>
              <MenuItem value="5">
                直近5か月
              </MenuItem>
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
            xl: "repeat(5, 1fr)",
          },
          gap: 2,
        }}
      >
        <AnalysisCard
          title="担当課題数"
          value={`${totalTaskCount}件`}
          description="当月に担当した課題数"
        />

        <AnalysisCard
          title="不具合件数"
          value={`${totalDefectCount}件`}
          description="集計期間内の登録不具合数"
        />

        <AnalysisCard
          title="手戻り合計回数"
          value={`${totalReworkCount}回`}
          description="集計期間内の手戻り回数"
        />

        <AnalysisCard
          title="平均手戻り発生率"
          value={
            averageReworkRate === null
              ? "算出不可"
              : `${averageReworkRate}%`
          }
          description="担当課題数に対する手戻り課題の割合"
        />

        <AnalysisCard
          title="前月差"
          value={
            rateDifference === null
              ? "算出不可"
              : `${
                  rateDifference > 0 ? "+" : ""
                }${rateDifference}%`
          }
          description="最新月と前月の手戻り発生率差"
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
        }}
      >
        <Paper variant="outlined" sx={{ padding: 3 }}>
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700 }}
              >
                月別推移
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                月ごとの担当課題数と不具合データを組み合わせて集計しています。
              </Typography>
            </Box>

            <Divider />

            {displayedMonthlyData.length === 0 ? (
              <Alert severity="info">
                表示できる月別データがありません。
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>対象月</TableCell>
                      <TableCell align="right">
                        担当課題数
                      </TableCell>
                      <TableCell align="right">
                        不具合件数
                      </TableCell>
                      <TableCell align="right">
                        手戻り回数
                      </TableCell>
                      <TableCell align="right">
                        手戻り課題数
                      </TableCell>
                      <TableCell align="right">
                        手戻り発生率
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {displayedMonthlyData.map(
                      (data) => {
                        const rate =
                          data.taskCount === 0
                            ? null
                            : Number(
                                (
                                  (data.reworkTaskCount /
                                    data.taskCount) *
                                  100
                                ).toFixed(1),
                              );

                        return (
                          <TableRow
                            key={data.month}
                            hover
                          >
                            <TableCell>
                              {data.month}
                            </TableCell>

                            <TableCell align="right">
                              {data.taskCount}件
                            </TableCell>

                            <TableCell align="right">
                              {data.defectCount}件
                            </TableCell>

                            <TableCell align="right">
                              {data.reworkCount}回
                            </TableCell>

                            <TableCell align="right">
                              {data.reworkTaskCount}件
                            </TableCell>

                            <TableCell align="right">
                              {rate === null ? (
                                <Chip
                                  size="small"
                                  label="算出不可"
                                />
                              ) : (
                                <Chip
                                  size="small"
                                  label={`${rate}%`}
                                  color={
                                    rate <= 30
                                      ? "success"
                                      : rate <= 50
                                        ? "warning"
                                        : "error"
                                  }
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      },
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ padding: 3 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700 }}
              >
                原因別分析
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                集計期間内の原因分類ごとの登録件数です。
              </Typography>
            </Box>

            <Divider />

            {causeData.length === 0 ? (
              <Alert severity="info">
                表示できる原因分類データがありません。
              </Alert>
            ) : (
              causeData.map((cause) => {
                const percentage =
                  maximumCauseCount === 0
                    ? 0
                    : (cause.count /
                        maximumCauseCount) *
                      100;

                return (
                  <Box key={cause.cause}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        marginBottom: 1,
                      }}
                    >
                      <Typography variant="body2">
                        {cause.cause}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700 }}
                      >
                        {cause.count}件
                      </Typography>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{ height: 8 }}
                    />
                  </Box>
                );
              })
            )}
          </Stack>
        </Paper>
      </Box>

      <Paper variant="outlined" sx={{ padding: 3 }}>
        <Stack spacing={2}>
          <Box
            sx={{
              display: "flex",
              alignItems: {
                xs: "stretch",
                sm: "center",
              },
              justifyContent:
                "space-between",
              flexDirection: {
                xs: "column",
                sm: "row",
              },
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700 }}
              >
                AI分析結果
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ marginTop: 0.5 }}
              >
                選択中の担当者と期間のデータをAmazon Nova Liteで分析します。
              </Typography>
            </Box>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1}
            >
              {analysis && (
                <Button
                  variant="outlined"
                  onClick={clearAnalysis}
                  disabled={isAnalyzing}
                >
                  結果をクリア
                </Button>
              )}

              <Button
                variant="contained"
                onClick={handleAIAnalysis}
                disabled={
                  isAnalyzing ||
                  displayedDefects.length === 0 ||
                  Boolean(dataErrorMessage)
                }
                startIcon={
                  isAnalyzing ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                    />
                  ) : undefined
                }
              >
                {isAnalyzing
                  ? "AI分析中..."
                  : "AI分析を実行"}
              </Button>
            </Stack>
          </Box>

          <Divider />

          {errorMessage && (
            <Alert severity="error">
              {errorMessage}
            </Alert>
          )}

          {!analysis &&
            !errorMessage &&
            !isAnalyzing && (
              <Alert severity="info">
                「AI分析を実行」を押すと、現在表示しているデータをAIが分析します。
              </Alert>
            )}

          {isAnalyzing && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 160,
              }}
            >
              <Stack
                spacing={2}
                sx={{ alignItems: "center" }}
              >
                <CircularProgress />

                <Typography color="text.secondary">
                  データを分析しています。
                </Typography>
              </Stack>
            </Box>
          )}

          {analysis && !isAnalyzing && (
            <Box
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.8,
                overflowWrap: "anywhere",
                backgroundColor:
                  "action.hover",
                borderRadius: 1,
                padding: 2.5,
              }}
            >
              <Typography
                component="div"
                sx={{ whiteSpace: "pre-wrap" }}
              >
                {analysis}
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
