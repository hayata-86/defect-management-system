import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  Controller,
  useForm,
} from "react-hook-form";

import type {
  DefectFormValues,
  DefectPriority,
  DefectStatus,
} from "../../types/defect";

import { useEffect } from "react";

type DefectFormProps = {
  defaultValues?: DefectFormValues;
  submitLabel: string;
  onSubmit: (values: DefectFormValues) => void;
  onCancel: () => void;
};

const projects = [
  "不具合管理システム",
  "ユーザー管理システム",
  "商品管理システム",
  "品質管理システム",
];

const assignees = [
  "川端",
  "佐藤",
  "田中",
  "鈴木",
];

const statuses: DefectStatus[] = [
  "未対応",
  "対応中",
  "完了",
];

const priorities: DefectPriority[] = [
  "高",
  "中",
  "低",
];

const causeCategories = [
  "要件確認不足",
  "設計不備",
  "実装不備",
  "テスト不足",
  "レビュー不足",
  "環境・設定不備",
  "データ不備",
  "その他",
] as const;

const initialValues: DefectFormValues = {
  title: "",
  projectName: "",
  assignee: "",
  status: "未対応",
  priority: "中",
  occurredAt: "",
  dueDate: "",
  description: "",

  cause: "",
  rootCause: "",
  countermeasure: "",
  verificationMethod: "",
  implementationTiming: "",

  causeCategory: "",
  isRecurrence: false,
  relatedDefectId: "",
  completedAt: "",
};

export function DefectForm({
  defaultValues = initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: DefectFormProps) {
  const {
      control,
      register,
      handleSubmit,
      watch,
      setValue,
      reset,
      formState: {
          errors,
          isSubmitting,
      },
  } = useForm<DefectFormValues>({
      defaultValues,
  });

  useEffect(() => {
      reset(defaultValues);
  }, [defaultValues, reset]);

  const occurredAt = watch("occurredAt");
  const isRecurrence = watch("isRecurrence");
  const status = watch("status");

useEffect(() => {
    if (!isRecurrence) {
      setValue("relatedDefectId", "");
    }
  }, [isRecurrence, setValue]);

  useEffect(() => {
    if (status !== "完了") {
      setValue("completedAt", "");
    }
  }, [status, setValue]);

  return (
    <Paper
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        padding: 3,
        border: 1,
        borderColor: "divider",
      }}
    >
      <Typography
        variant="h6"
        component="h2"
        sx={{ marginBottom: 3 }}
      >
        不具合情報
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 2.5,
        }}
      >
        <TextField
          label="件名"
          required
          fullWidth
          error={Boolean(errors.title)}
          helperText={errors.title?.message}
            slotProps={{
              htmlInput: {
                maxLength: 100,
              },
            }}
          {...register("title", {
            required: "件名を入力してください。",
            maxLength: {
              value: 100,
              message: "件名は100文字以内で入力してください。",
            },
          })}
          sx={{
            gridColumn: "1 / -1",
          }}
        />

        <Controller
          name="projectName"
          control={control}
          rules={{
            required: "プロジェクトを選択してください。",
          }}
          render={({ field }) => (
            <FormControl
              required
              fullWidth
              error={Boolean(errors.projectName)}
            >
              <InputLabel id="project-name-label">
                プロジェクト
              </InputLabel>

              <Select
                {...field}
                labelId="project-name-label"
                label="プロジェクト"
              >
                {projects.map((project) => (
                  <MenuItem
                    key={project}
                    value={project}
                  >
                    {project}
                  </MenuItem>
                ))}
              </Select>

              <FormHelperText>
                {errors.projectName?.message}
              </FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="assignee"
          control={control}
          rules={{
            required: "担当者を選択してください。",
          }}
          render={({ field }) => (
            <FormControl
              required
              fullWidth
              error={Boolean(errors.assignee)}
            >
              <InputLabel id="assignee-label">
                担当者
              </InputLabel>

              <Select
                {...field}
                labelId="assignee-label"
                label="担当者"
              >
                {assignees.map((assignee) => (
                  <MenuItem
                    key={assignee}
                    value={assignee}
                  >
                    {assignee}
                  </MenuItem>
                ))}
              </Select>

              <FormHelperText>
                {errors.assignee?.message}
              </FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="status"
          control={control}
          rules={{
            required: "状態を選択してください。",
          }}
          render={({ field }) => (
            <FormControl
              required
              fullWidth
              error={Boolean(errors.status)}
            >
              <InputLabel id="status-label">
                状態
              </InputLabel>

              <Select
                {...field}
                labelId="status-label"
                label="状態"
              >
                {statuses.map((status) => (
                  <MenuItem
                    key={status}
                    value={status}
                  >
                    {status}
                  </MenuItem>
                ))}
              </Select>

              <FormHelperText>
                {errors.status?.message}
              </FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="priority"
          control={control}
          rules={{
            required: "優先度を選択してください。",
          }}
          render={({ field }) => (
            <FormControl
              required
              fullWidth
              error={Boolean(errors.priority)}
            >
              <InputLabel id="priority-label">
                優先度
              </InputLabel>

              <Select
                {...field}
                labelId="priority-label"
                label="優先度"
              >
                {priorities.map((priority) => (
                  <MenuItem
                    key={priority}
                    value={priority}
                  >
                    {priority}
                  </MenuItem>
                ))}
              </Select>

              <FormHelperText>
                {errors.priority?.message}
              </FormHelperText>
            </FormControl>
          )}
        />

        <TextField
          label="発生日"
          type="date"
          required
          fullWidth
          error={Boolean(errors.occurredAt)}
          helperText={errors.occurredAt?.message}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          {...register("occurredAt", {
            required: "発生日を入力してください。",
          })}
        />

        <TextField
          label="対応期限"
          type="date"
          fullWidth
          error={Boolean(errors.dueDate)}
          helperText={errors.dueDate?.message}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          {...register("dueDate", {
            validate: (value) => {
              if (!value || !occurredAt) {
                return true;
              }

              return (
                value >= occurredAt ||
                "対応期限は発生日以降の日付を入力してください。"
              );
            },
          })}
        />

        <TextField
          label="詳細内容"
          multiline
          minRows={6}
          fullWidth
          error={Boolean(errors.description)}
          helperText={
            errors.description?.message ??
            "1000文字以内で入力してください。"
          }
          slotProps={{
            htmlInput: {
              maxLength: 1000,
            },
          }}
          {...register("description", {
            maxLength: {
              value: 1000,
              message:
                "詳細内容は1000文字以内で入力してください。",
            },
          })}
          sx={{
            gridColumn: "1 / -1",
          }}
        />

                {/* 原因分析 */}
        <Box
          sx={{
            gridColumn: "1 / -1",
            marginTop: 1,
          }}
        >
          <Typography
            variant="h6"
            component="h3"
            sx={{
              marginBottom: 0.5,
              fontWeight: 700,
            }}
          >
            原因分析
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            不具合が発生した直接的な原因と、その背景にある真因を入力します。
          </Typography>
        </Box>

        <TextField
          label="不具合原因"
          multiline
          minRows={4}
          fullWidth
          error={Boolean(errors.cause)}
          helperText={
            errors.cause?.message ??
            "1000文字以内で入力してください。"
          }
          slotProps={{
            htmlInput: {
              maxLength: 1000,
            },
          }}
          {...register("cause", {
            maxLength: {
              value: 1000,
              message:
                "不具合原因は1000文字以内で入力してください。",
            },
          })}
          sx={{
            gridColumn: "1 / -1",
          }}
        />

        <TextField
          label="真因"
          multiline
          minRows={4}
          fullWidth
          error={Boolean(errors.rootCause)}
          helperText={
            errors.rootCause?.message ??
            "1000文字以内で入力してください。"
          }
          slotProps={{
            htmlInput: {
              maxLength: 1000,
            },
          }}
          {...register("rootCause", {
            maxLength: {
              value: 1000,
              message:
                "真因は1000文字以内で入力してください。",
            },
          })}
          sx={{
            gridColumn: "1 / -1",
          }}
        />

        {/* 対策 */}
        <Box
          sx={{
            gridColumn: "1 / -1",
            marginTop: 1,
          }}
        >
          <Typography
            variant="h6"
            component="h3"
            sx={{
              marginBottom: 0.5,
              fontWeight: 700,
            }}
          >
            対策
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            再発防止策、確認方法、実施タイミングを入力します。
          </Typography>
        </Box>

        <TextField
          label="再発防止策"
          multiline
          minRows={4}
          fullWidth
          error={Boolean(errors.countermeasure)}
          helperText={
            errors.countermeasure?.message ??
            "1000文字以内で入力してください。"
          }
          slotProps={{
            htmlInput: {
              maxLength: 1000,
            },
          }}
          {...register("countermeasure", {
            maxLength: {
              value: 1000,
              message:
                "再発防止策は1000文字以内で入力してください。",
            },
          })}
          sx={{
            gridColumn: "1 / -1",
          }}
        />

        <TextField
          label="確認方法"
          multiline
          minRows={4}
          fullWidth
          error={Boolean(errors.verificationMethod)}
          helperText={
            errors.verificationMethod?.message ??
            "1000文字以内で入力してください。"
          }
          slotProps={{
            htmlInput: {
              maxLength: 1000,
            },
          }}
          {...register("verificationMethod", {
            maxLength: {
              value: 1000,
              message:
                "確認方法は1000文字以内で入力してください。",
            },
          })}
          sx={{
            gridColumn: "1 / -1",
          }}
        />

        <TextField
          label="実施タイミング"
          fullWidth
          error={Boolean(errors.implementationTiming)}
          helperText={
            errors.implementationTiming?.message ??
            "200文字以内で入力してください。"
          }
          slotProps={{
            htmlInput: {
              maxLength: 200,
            },
          }}
          {...register("implementationTiming", {
            maxLength: {
              value: 200,
              message:
                "実施タイミングは200文字以内で入力してください。",
            },
          })}
          sx={{
            gridColumn: "1 / -1",
          }}
        />
      </Box>

              {/* AI分析・集計用 */}
        <Box
          sx={{
            gridColumn: "1 / -1",
            marginTop: 1,
          }}
        >
          <Typography
            variant="h6"
            component="h3"
            sx={{
              marginBottom: 0.5,
              fontWeight: 700,
            }}
          >
            分析情報
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            月次分析、担当者傾向、再発率の集計に使用します。
          </Typography>
        </Box>

        <Controller
          name="causeCategory"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="cause-category-label">
                原因分類
              </InputLabel>

              <Select
                {...field}
                labelId="cause-category-label"
                label="原因分類"
              >
                <MenuItem value="">
                  未選択
                </MenuItem>

                {causeCategories.map((category) => (
                  <MenuItem
                    key={category}
                    value={category}
                  >
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />

        <TextField
          label="完了日"
          type="date"
          fullWidth
          required={status === "完了"}
          error={Boolean(errors.completedAt)}
          helperText={errors.completedAt?.message}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          {...register("completedAt", {
            validate: (value) => {
              if (status === "完了" && !value) {
                return "完了日を入力してください。";
              }

              if (
                value &&
                occurredAt &&
                value < occurredAt
              ) {
                return "完了日は発生日以降の日付を入力してください。";
              }

              return true;
            },
          })}
        />

        <Controller
          name="isRecurrence"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value}
                  onChange={(event) =>
                    field.onChange(
                      event.target.checked,
                    )
                  }
                />
              }
              label="再発不具合として扱う"
              sx={{
                gridColumn: "1 / -1",
              }}
            />
          )}
        />

        <TextField
          label="関連不具合ID"
          fullWidth
          disabled={!isRecurrence}
          helperText={
            isRecurrence
              ? "再発元となった不具合IDを入力してください。"
              : "再発不具合を選択すると入力できます。"
          }
          {...register("relatedDefectId", {
            validate: (value) => {
              if (
                isRecurrence &&
                !value.trim()
              ) {
                return "関連不具合IDを入力してください。";
              }

              return true;
            },
          })}
          error={Boolean(
            errors.relatedDefectId,
          )}
          sx={{
            gridColumn: "1 / -1",
          }}
        />

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5,
          marginTop: 4,
        }}
      >
        <Button
          type="button"
          variant="outlined"
          color="inherit"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          キャンセル
        </Button>

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? "登録中..." : submitLabel}
        </Button>
      </Box>
    </Paper>
  );
}