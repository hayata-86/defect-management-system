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

import { useMemo, useState } from "react";
import { useAIAnalysis } from "../../hooks/useAIAnalysis";

type MonthlyAnalysis = {
  month: string;
  taskCount: number;
  reworkCount: number;
  reworkTaskCount: number;
};

type CauseAnalysis = {
  cause: string;
  count: number;
};

const monthlyData: MonthlyAnalysis[] = [
  {
    month: "2026-03",
    taskCount: 5,
    reworkCount: 3,
    reworkTaskCount: 2,
  },
  {
    month: "2026-04",
    taskCount: 6,
    reworkCount: 2,
    reworkTaskCount: 2,
  },
  {
    month: "2026-05",
    taskCount: 5,
    reworkCount: 2,
    reworkTaskCount: 2,
  },
  {
    month: "2026-06",
    taskCount: 4,
    reworkCount: 4,
    reworkTaskCount: 2,
  },
  {
    month: "2026-07",
    taskCount: 6,
    reworkCount: 2,
    reworkTaskCount: 1,
  },
];

const causeData: CauseAnalysis[] = [
  {
    cause: "仕様理解不足",
    count: 4,
  },
  {
    cause: "確認漏れ",
    count: 3,
  },
  {
    cause: "設計書反映漏れ",
    count: 2,
  },
  {
    cause: "テスト不足",
    count: 2,
  },
  {
    cause: "実装ミス",
    count: 1,
  },
];

type AnalysisCardProps = {
  title: string;
  value: string;
  description: string;
};

function AnalysisCard({
  title,
  value,
  description,
}: AnalysisCardProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography
          variant="body2"
          color="text.secondary"
        >
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

        <Typography
          variant="caption"
          color="text.secondary"
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function AnalysisPage() {
  const [period, setPeriod] =
    useState("5");

      const {
    analysis,
    errorMessage,
    isAnalyzing,
    executeAnalysis,
    clearAnalysis,
  } = useAIAnalysis();

 const displayedMonthlyData = useMemo<MonthlyAnalysis[]>(
    () => monthlyData.slice(-Number(period)),
    [period],
  );

  const totalTaskCount =
    displayedMonthlyData.reduce(
      (total, data) =>
        total + data.taskCount,
      0,
    );

  const totalReworkCount =
    displayedMonthlyData.reduce(
      (total, data) =>
        total + data.reworkCount,
      0,
    );

  const totalReworkTaskCount =
    displayedMonthlyData.reduce(
      (total, data) =>
        total +
        data.reworkTaskCount,
      0,
    );

  const averageReworkRate =
    totalTaskCount === 0
      ? 0
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

  const latestRate = latestData
    ? Number(
        (
          (latestData.reworkTaskCount /
            latestData.taskCount) *
          100
        ).toFixed(1),
      )
    : 0;

  const previousRate = previousData
    ? Number(
        (
          (previousData.reworkTaskCount /
            previousData.taskCount) *
          100
        ).toFixed(1),
      )
    : 0;

  const rateDifference = Number(
    (
      latestRate - previousRate
    ).toFixed(1),
  );

  const maximumCauseCount = Math.max(
    ...causeData.map(
      (cause) => cause.count,
    ),
  );

    const buildAnalysisPrompt = (): string => {
    const monthlySummary =
      displayedMonthlyData
        .map((data) => {
          const reworkRate =
            data.taskCount === 0
              ? 0
              : Number(
                  (
                    (data.reworkTaskCount /
                      data.taskCount) *
                    100
                  ).toFixed(1),
                );

          return [
            `対象月: ${data.month}`,
            `担当課題数: ${data.taskCount}件`,
            `手戻り回数: ${data.reworkCount}回`,
            `手戻り課題数: ${data.reworkTaskCount}件`,
            `手戻り発生率: ${reworkRate}%`,
          ].join("、");
        })
        .join("\n");

    const causeSummary = causeData
      .map(
        (cause) =>
          `${cause.cause}: ${cause.count}件`,
      )
      .join("\n");

    return `
以下は不具合管理システムの集計データです。

【集計期間】
直近${period}か月

【全体集計】
担当課題数: ${totalTaskCount}件
手戻り合計回数: ${totalReworkCount}回
手戻りが発生した課題数: ${totalReworkTaskCount}件
平均手戻り発生率: ${averageReworkRate}%
最新月の手戻り発生率: ${latestRate}%
前月との差: ${
      rateDifference > 0 ? "+" : ""
    }${rateDifference}%

【月別データ】
${monthlySummary}

【原因別データ】
${causeSummary}

上記データを分析し、次の項目に分けて日本語で回答してください。

1. 全体傾向
2. 注目すべき問題
3. 原因の考察
4. 改善策
5. 次月に確認すべき指標

数値を根拠として示し、簡潔で実務的な内容にしてください。
    `.trim();
  };

  const handleAIAnalysis =
    async (): Promise<void> => {
      const prompt =
        buildAnalysisPrompt();

      await executeAnalysis(prompt);
    };

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
          課題数、手戻り発生率、原因別の傾向を分析します。
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{ padding: 3 }}
      >
        <FormControl
          sx={{ minWidth: 200 }}
        >
          <InputLabel id="period-label">
            集計期間
          </InputLabel>

          <Select
            labelId="period-label"
            label="集計期間"
            value={period}
            onChange={(event) =>
              setPeriod(
                event.target.value,
              )
            }
          >
            <MenuItem value="3">
              直近3か月
            </MenuItem>

            <MenuItem value="5">
              直近5か月
            </MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            xl: "repeat(4, 1fr)",
          },
          gap: 2,
        }}
      >
        <AnalysisCard
          title="担当課題数"
          value={`${totalTaskCount}件`}
          description="集計期間内の担当課題数"
        />

        <AnalysisCard
          title="手戻り合計回数"
          value={`${totalReworkCount}回`}
          description="集計期間内の手戻り回数"
        />

        <AnalysisCard
          title="平均手戻り発生率"
          value={`${averageReworkRate}%`}
          description="担当課題数に対する手戻り課題の割合"
        />

        <AnalysisCard
          title="前月差"
          value={`${
            rateDifference > 0
              ? "+"
              : ""
          }${rateDifference}%`}
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
        <Paper
          variant="outlined"
          sx={{ padding: 3 }}
        >
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
                月ごとの課題数と手戻り発生率を表示します。
              </Typography>
            </Box>

            <Divider />

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      対象月
                    </TableCell>

                    <TableCell align="right">
                      担当課題数
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
                          ? 0
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
                            {data.reworkCount}回
                          </TableCell>

                          <TableCell align="right">
                            {
                              data.reworkTaskCount
                            }
                            件
                          </TableCell>

                          <TableCell align="right">
                            <Chip
                              size="small"
                              label={`${rate}%`}
                              color={
                                rate <= 30
                                  ? "success"
                                  : rate <=
                                      50
                                    ? "warning"
                                    : "error"
                              }
                            />
                          </TableCell>
                        </TableRow>
                      );
                    },
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{ padding: 3 }}
        >
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
                手戻りが発生した主な原因です。
              </Typography>
            </Box>

            <Divider />

            {causeData.map((cause) => {
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
                      sx={{
                        fontWeight: 700,
                      }}
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
            })}
          </Stack>
        </Paper>
      </Box>

            <Paper
        variant="outlined"
        sx={{ padding: 3 }}
      >
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
                集計期間内のデータをAmazon
                Nova Liteで分析します。
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
                onClick={
                  handleAIAnalysis
                }
                disabled={isAnalyzing}
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
                「AI分析を実行」を押すと、
                現在表示している集計データを
                AIが分析します。
              </Alert>
            )}

          {isAnalyzing && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",
                minHeight: 160,
              }}
            >
              <Stack
                spacing={2}
                sx={{
                  alignItems: "center",
                }}
              >
                <CircularProgress />

                <Typography color="text.secondary">
                  不具合データを分析しています。
                </Typography>
              </Stack>
            </Box>
          )}

          {analysis &&
            !isAnalyzing && (
              <Box
                sx={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.8,
                  overflowWrap:
                    "anywhere",
                  backgroundColor:
                    "action.hover",
                  borderRadius: 1,
                  padding: 2.5,
                }}
              >
                <Typography
                  component="div"
                  sx={{
                    whiteSpace:
                      "pre-wrap",
                  }}
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