import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import {
  deleteMonthlyWorkload,
  getMonthlyWorkloads,
  saveMonthlyWorkload,
} from "../../services/monthlyWorkloadService";
import type {
  MonthlyWorkload,
  MonthlyWorkloadFormValues,
} from "../../types/monthlyWorkload";

const initialValues: MonthlyWorkloadFormValues = {
  month: "",
  assignee: "",
  taskCount: 0,
};

export function MonthlyWorkloadPage() {
  const [monthlyWorkloads, setMonthlyWorkloads] =
    useState<MonthlyWorkload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MonthlyWorkloadFormValues>({
    defaultValues: initialValues,
  });

  const sortedMonthlyWorkloads = useMemo(
    () =>
      [...monthlyWorkloads].sort((left, right) => {
        const monthComparison = right.month.localeCompare(left.month);

        if (monthComparison !== 0) {
          return monthComparison;
        }

        return left.assignee.localeCompare(right.assignee, "ja");
      }),
    [monthlyWorkloads],
  );

  const loadMonthlyWorkloads = async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getMonthlyWorkloads();
      setMonthlyWorkloads(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "担当課題数データの取得中にエラーが発生しました。",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadMonthlyWorkloads();
  }, []);

  const onSubmit = async (
    values: MonthlyWorkloadFormValues,
  ): Promise<void> => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await saveMonthlyWorkload({
        month: values.month,
        assignee: values.assignee,
        taskCount: Number(values.taskCount),
      });

      setSuccessMessage(
        `${values.month}・${values.assignee}の担当課題数を登録しました。`,
      );

      reset(initialValues);
      await loadMonthlyWorkloads();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "担当課題数の登録中にエラーが発生しました。",
      );
    }
  };

  const handleEdit = (monthlyWorkload: MonthlyWorkload): void => {
    setValue("month", monthlyWorkload.month);
    setValue("assignee", monthlyWorkload.assignee);
    setValue("taskCount", monthlyWorkload.taskCount);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleDelete = async (
    monthlyWorkload: MonthlyWorkload,
  ): Promise<void> => {
    const confirmed = window.confirm(
      `${monthlyWorkload.month}・${monthlyWorkload.assignee}の担当課題数を削除しますか？`,
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await deleteMonthlyWorkload(monthlyWorkload.id);

      setSuccessMessage(
        `${monthlyWorkload.month}・${monthlyWorkload.assignee}の担当課題数を削除しました。`,
      );

      await loadMonthlyWorkloads();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "担当課題数の削除中にエラーが発生しました。",
      );
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          月次担当課題数
        </Typography>

        <Typography color="text.secondary" sx={{ marginTop: 0.5 }}>
          手戻り発生率の分母として使用する、月・担当者ごとの担当課題数を登録します。
        </Typography>
      </Box>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}

      <Paper
        component="form"
        variant="outlined"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        sx={{ padding: 3 }}
      >
        <Stack spacing={2.5}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            担当課題数登録
          </Typography>

          <Divider />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            <TextField
              label="対象月"
              type="month"
              required
              fullWidth
              error={Boolean(errors.month)}
              helperText={errors.month?.message}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              {...register("month", {
                required: "対象月を入力してください。",
              })}
            />

            <TextField
              label="担当者"
              required
              fullWidth
              error={Boolean(errors.assignee)}
              helperText={errors.assignee?.message}
              {...register("assignee", {
                required: "担当者を入力してください。",
                validate: (value) =>
                  value.trim().length > 0 ||
                  "担当者を入力してください。",
              })}
            />

            <TextField
              label="担当課題数"
              type="number"
              required
              fullWidth
              error={Boolean(errors.taskCount)}
              helperText={
                errors.taskCount?.message ??
                "当月に担当した全課題数を入力してください。"
              }
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 1,
                },
              }}
              {...register("taskCount", {
                valueAsNumber: true,
                required: "担当課題数を入力してください。",
                min: {
                  value: 0,
                  message: "担当課題数は0以上で入力してください。",
                },
                validate: (value) =>
                  Number.isInteger(value) ||
                  "担当課題数は整数で入力してください。",
              })}
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting ? "登録中..." : "登録・更新"}
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ padding: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              登録済み担当課題数
            </Typography>

            <Typography variant="body2" color="text.secondary">
              同じ対象月・担当者を再登録すると、既存データが更新されます。
            </Typography>
          </Box>

          <Divider />

          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                padding: 4,
              }}
            >
              <CircularProgress />
            </Box>
          ) : sortedMonthlyWorkloads.length === 0 ? (
            <Alert severity="info">
              担当課題数が登録されていません。
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>対象月</TableCell>
                    <TableCell>担当者</TableCell>
                    <TableCell align="right">担当課題数</TableCell>
                    <TableCell align="right">操作</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sortedMonthlyWorkloads.map((monthlyWorkload) => (
                    <TableRow key={monthlyWorkload.id} hover>
                      <TableCell>{monthlyWorkload.month}</TableCell>
                      <TableCell>{monthlyWorkload.assignee}</TableCell>

                      <TableCell align="right">
                        {monthlyWorkload.taskCount}件
                      </TableCell>

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ justifyContent: "flex-end" }}
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleEdit(monthlyWorkload)}
                          >
                            編集
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() =>
                              void handleDelete(monthlyWorkload)
                            }
                          >
                            削除
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
