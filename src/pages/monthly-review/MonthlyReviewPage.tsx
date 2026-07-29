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
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";

type MonthlySummary = {
  month: string;
  assignedTaskCount: number;
  reworkCount: number;
  reworkTaskCount: number;
  reworkRate: number;
  averageReworkCount: number;
  targetRate: number;
};

const monthlySummaries: MonthlySummary[] = [
  {
    month: "2026-05",
    assignedTaskCount: 5,
    reworkCount: 2,
    reworkTaskCount: 2,
    reworkRate: 40,
    averageReworkCount: 1,
    targetRate: 30,
  },
  {
    month: "2026-06",
    assignedTaskCount: 4,
    reworkCount: 4,
    reworkTaskCount: 2,
    reworkRate: 50,
    averageReworkCount: 2,
    targetRate: 30,
  },
  {
    month: "2026-07",
    assignedTaskCount: 6,
    reworkCount: 2,
    reworkTaskCount: 1,
    reworkRate: 16.7,
    averageReworkCount: 2,
    targetRate: 30,
  },
];

type SummaryCardProps = {
  title: string;
  value: string;
  description: string;
};

function SummaryCard({
  title,
  value,
  description,
}: SummaryCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
      }}
    >
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

export function MonthlyReviewPage() {
  const [selectedMonth, setSelectedMonth] =
    useState("2026-07");

  const [goodPoints, setGoodPoints] =
    useState("");

  const [problemPoints, setProblemPoints] =
    useState("");

  const [nextActions, setNextActions] =
    useState("");

  const [isSaved, setIsSaved] =
    useState(false);

  const selectedSummary = useMemo(
    () =>
      monthlySummaries.find(
        (summary) =>
          summary.month === selectedMonth,
      ) ?? monthlySummaries[0],
    [selectedMonth],
  );

  const previousSummary = useMemo(() => {
    const currentIndex =
      monthlySummaries.findIndex(
        (summary) =>
          summary.month === selectedMonth,
      );

    if (currentIndex <= 0) {
      return null;
    }

    return monthlySummaries[
      currentIndex - 1
    ];
  }, [selectedMonth]);

  const rateDifference = previousSummary
    ? Number(
        (
          selectedSummary.reworkRate -
          previousSummary.reworkRate
        ).toFixed(1),
      )
    : null;

  const targetAchievementRate =
    selectedSummary.targetRate === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            (selectedSummary.targetRate /
              selectedSummary.reworkRate) *
              100,
          ),
        );

  const isTargetAchieved =
    selectedSummary.reworkRate <=
    selectedSummary.targetRate;

  const handleSave = () => {
    setIsSaved(true);

    window.setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
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
          月ごとの課題実績と手戻り状況を確認し、
          次月の行動目標を設定します。
        </Typography>
      </Box>

      {isSaved && (
        <Alert severity="success">
          月次振り返りを保存しました。
        </Alert>
      )}

      <Paper
        variant="outlined"
        sx={{ padding: 3 }}
      >
        <FormControl
          sx={{ minWidth: 200 }}
        >
          <InputLabel id="month-label">
            対象月
          </InputLabel>

          <Select
            labelId="month-label"
            label="対象月"
            value={selectedMonth}
            onChange={(event) =>
              setSelectedMonth(
                event.target.value,
              )
            }
          >
            {monthlySummaries.map(
              (summary) => (
                <MenuItem
                  key={summary.month}
                  value={summary.month}
                >
                  {summary.month.replace(
                    "-",
                    "年",
                  )}
                  月
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>
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
        <SummaryCard
          title="担当課題数"
          value={`${selectedSummary.assignedTaskCount}件`}
          description="当月に担当した課題数"
        />

        <SummaryCard
          title="手戻り合計回数"
          value={`${selectedSummary.reworkCount}回`}
          description="当月に発生した手戻りの合計"
        />

        <SummaryCard
          title="手戻り発生課題数"
          value={`${selectedSummary.reworkTaskCount}件`}
          description="手戻りが発生した課題数"
        />

        <SummaryCard
          title="手戻り発生率"
          value={`${selectedSummary.reworkRate}%`}
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
        <Paper
          variant="outlined"
          sx={{ padding: 3 }}
        >
          <Stack spacing={2}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700 }}
              >
                目標達成状況
              </Typography>

              <Chip
                label={
                  isTargetAchieved
                    ? "目標達成"
                    : "目標未達"
                }
                color={
                  isTargetAchieved
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
                sx={{
                  marginTop: 0.5,
                  fontWeight: 700,
                }}
              >
                {selectedSummary.targetRate}
                %以下
              </Typography>
            </Box>

            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: 1,
                }}
              >
                <Typography variant="body2">
                  達成度
                </Typography>

                <Typography variant="body2">
                  {targetAchievementRate}%
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={
                  isTargetAchieved
                    ? 100
                    : targetAchievementRate
                }
              />
            </Box>
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{ padding: 3 }}
        >
          <Stack spacing={2}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              前月比較
            </Typography>

            <Divider />

            {previousSummary ? (
              <>
                <Typography>
                  前月の手戻り発生率：
                  <strong>
                    {
                      previousSummary.reworkRate
                    }
                    %
                  </strong>
                </Typography>

                <Typography>
                  当月の手戻り発生率：
                  <strong>
                    {
                      selectedSummary.reworkRate
                    }
                    %
                  </strong>
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
                            rateDifference! > 0
                              ? "+"
                              : ""
                          }${rateDifference}%`
                    }
                    color={
                      rateDifference !== null &&
                      rateDifference < 0
                        ? "success"
                        : rateDifference !==
                              null &&
                            rateDifference > 0
                          ? "error"
                          : "default"
                    }
                  />
                </Typography>
              </>
            ) : (
              <Typography color="text.secondary">
                比較対象となる前月データがありません。
              </Typography>
            )}
          </Stack>
        </Paper>
      </Box>

      <Paper
        variant="outlined"
        sx={{ padding: 3 }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              振り返り内容
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ marginTop: 0.5 }}
            >
              当月の結果を振り返り、
              次月の改善行動を記録します。
            </Typography>
          </Box>

          <TextField
            label="良かった点"
            value={goodPoints}
            onChange={(event) =>
              setGoodPoints(
                event.target.value,
              )
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
              setProblemPoints(
                event.target.value,
              )
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
              setNextActions(
                event.target.value,
              )
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
  );
}