import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import type { ChangeEvent, FormEvent } from "react";

import type {
  DefectPriority,
  DefectSearchConditions,
  DefectStatus,
} from "../../types/defect";

type DefectSearchFormProps = {
  conditions: DefectSearchConditions;
  onChange: (
    conditions: DefectSearchConditions,
  ) => void;
  onSearch: () => void;
  onClear: () => void;
};

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

const assignees = ["佐藤", "田中", "川端", "鈴木"];

export function DefectSearchForm({
  conditions,
  onChange,
  onSearch,
  onClear,
}: DefectSearchFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch();
  };

  const handleInputChange =
    (name: keyof DefectSearchConditions) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement
      >,
    ) => {
      onChange({
        ...conditions,
        [name]: event.target.value,
      });
    };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        padding: 2.5,
        border: 1,
        borderColor: "divider",
      }}
    >
      <Typography
        variant="h6"
        component="h2"
        sx={{ marginBottom: 2 }}
      >
        検索条件
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns:
            "minmax(260px, 2fr) repeat(3, minmax(150px, 1fr))",
          gap: 2,
          alignItems: "center",
        }}
      >
        <TextField
          label="キーワード"
          placeholder="不具合No、件名、プロジェクト名"
          value={conditions.keyword}
          onChange={handleInputChange("keyword")}
          size="small"
          fullWidth
        />

        <TextField
          select
          label="状態"
          value={conditions.status}
          onChange={handleInputChange("status")}
          size="small"
          fullWidth
        >
          <MenuItem value="">すべて</MenuItem>

          {statuses.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="優先度"
          value={conditions.priority}
          onChange={handleInputChange("priority")}
          size="small"
          fullWidth
        >
          <MenuItem value="">すべて</MenuItem>

          {priorities.map((priority) => (
            <MenuItem key={priority} value={priority}>
              {priority}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="担当者"
          value={conditions.assignee}
          onChange={handleInputChange("assignee")}
          size="small"
          fullWidth
        >
          <MenuItem value="">すべて</MenuItem>

          {assignees.map((assignee) => (
            <MenuItem key={assignee} value={assignee}>
              {assignee}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5,
          marginTop: 2,
        }}
      >
        <Button
          type="button"
          variant="outlined"
          color="inherit"
          onClick={onClear}
        >
          クリア
        </Button>

        <Button type="submit" variant="contained">
          検索
        </Button>
      </Box>
    </Paper>
  );
}