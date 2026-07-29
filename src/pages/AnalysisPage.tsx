import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { analyzeMonthlyDefects } from "../services/analysisService";
import { getDefects } from "../services/defectService";
import { analyzeByAI } from "../services/analysisApi";

function AnalysisPage() {
  const currentDate = new Date();

  const [selectedYear, setSelectedYear] = useState(
    currentDate.getFullYear(),
  );

  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1,
  );

  const [analysisResult, setAnalysisResult] =
    useState("");

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const {
    data: defects = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["defects"],
    queryFn: getDefects,
  });

  const monthlyAnalysis = useMemo(
    () =>
      analyzeMonthlyDefects(
        defects,
        selectedYear,
        selectedMonth,
      ),
    [defects, selectedYear, selectedMonth],
  );

    const handleAnalyze = async () => {
    setIsAnalyzing(true);

    const result = await analyzeByAI({
        year: selectedYear,
        month: selectedMonth,
        summary: {
        totalCount: monthlyAnalysis.totalCount,
        completedCount: monthlyAnalysis.completedCount,
        completionRate: monthlyAnalysis.completionRate,
        recurrenceCount: monthlyAnalysis.recurrenceCount,
        recurrenceRate: monthlyAnalysis.recurrenceRate,
        highPriorityCount:
            monthlyAnalysis.highPriorityCount,
        averageResolutionDays:
            monthlyAnalysis.averageResolutionDays,
        },
        causeCategoryCounts:
        monthlyAnalysis.causeCategoryCounts,
    });

    setAnalysisResult(result);

    setIsAnalyzing(false);
    };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          padding: 4,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        不具合データの取得に失敗しました。
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
          }}
        >
          AI分析
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            marginTop: 1,
          }}
        >
          月ごとの不具合傾向、再発率、原因分類を分析します。
        </Typography>
      </Box>

      <Paper
        sx={{
          padding: 3,
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 700,
            marginBottom: 2,
          }}
        >
          分析期間
        </Typography>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={2}
        >
          <TextField
            select
            label="年"
            value={selectedYear}
            onChange={(event) => {
              setSelectedYear(
                Number(event.target.value),
              );
              setAnalysisResult("");
            }}
            sx={{
              minWidth: 140,
            }}
          >
            {[2025, 2026, 2027].map((year) => (
              <MenuItem
                key={year}
                value={year}
              >
                {year}年
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="月"
            value={selectedMonth}
            onChange={(event) => {
              setSelectedMonth(
                Number(event.target.value),
              );
              setAnalysisResult("");
            }}
            sx={{
              minWidth: 140,
            }}
          >
            {Array.from(
              { length: 12 },
              (_, index) => index + 1,
            ).map((month) => (
              <MenuItem
                key={month}
                value={month}
              >
                {month}月
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      <Box>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 700,
            marginBottom: 2,
          }}
        >
          月次サマリー
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          <SummaryItem
            label="総不具合件数"
            value={`${monthlyAnalysis.totalCount}件`}
          />

          <SummaryItem
            label="完了件数"
            value={`${monthlyAnalysis.completedCount}件`}
          />

          <SummaryItem
            label="完了率"
            value={`${monthlyAnalysis.completionRate}%`}
          />

          <SummaryItem
            label="高優先度"
            value={`${monthlyAnalysis.highPriorityCount}件`}
          />

          <SummaryItem
            label="再発件数"
            value={`${monthlyAnalysis.recurrenceCount}件`}
          />

          <SummaryItem
            label="再発率"
            value={`${monthlyAnalysis.recurrenceRate}%`}
          />

          <SummaryItem
            label="平均対応日数"
            value={
              monthlyAnalysis.averageResolutionDays ===
              null
                ? "－"
                : `${monthlyAnalysis.averageResolutionDays}日`
            }
          />
        </Box>
      </Box>

      <Paper
        sx={{
          padding: 3,
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 700,
            marginBottom: 2,
          }}
        >
          原因分類
        </Typography>

        {monthlyAnalysis.causeCategoryCounts
          .length === 0 ? (
          <Typography color="text.secondary">
            対象月の不具合データがありません。
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {monthlyAnalysis.causeCategoryCounts.map(
              ({ category, count }) => (
                <Box
                  key={category}
                  sx={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    borderBottom: 1,
                    borderColor: "divider",
                    paddingBottom: 1,
                  }}
                >
                  <Typography>
                    {category}
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {count}件
                  </Typography>
                </Box>
              ),
            )}
          </Stack>
        )}
      </Paper>

      <Paper
        sx={{
          padding: 3,
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 700,
            marginBottom: 2,
          }}
        >
          AI分析結果
        </Typography>

        <Button
          variant="contained"
          onClick={handleAnalyze}
          disabled={
            isAnalyzing ||
            monthlyAnalysis.totalCount === 0
          }
          sx={{
            marginBottom: 2,
          }}
        >
          {isAnalyzing
            ? "分析中..."
            : "AI分析開始"}
        </Button>

        {monthlyAnalysis.totalCount === 0 ? (
          <Alert severity="warning">
            対象月の不具合データがないため、分析できません。
          </Alert>
        ) : analysisResult ? (
          <Typography
            component="div"
            sx={{
              whiteSpace: "pre-line",
              lineHeight: 1.8,
            }}
          >
            {analysisResult}
          </Typography>
        ) : (
          <Alert severity="info">
            「AI分析開始」を押すと分析結果が表示されます。
          </Alert>
        )}
      </Paper>
    </Stack>
  );
}

type SummaryItemProps = {
  label: string;
  value: string;
};

function SummaryItem({
  label,
  value,
}: SummaryItemProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        padding: 2.5,
        minHeight: 120,
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        variant="h4"
        component="p"
        sx={{
          fontWeight: 700,
          marginTop: 1,
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

export default AnalysisPage;