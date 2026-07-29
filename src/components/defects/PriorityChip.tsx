import { Chip } from "@mui/material";

import type { DefectPriority } from "../../types/defect";

type PriorityChipProps = {
  priority: DefectPriority;
};

type PriorityColor = "error" | "warning" | "info";

const getPriorityColor = (
  priority: DefectPriority,
): PriorityColor => {
  switch (priority) {
    case "高":
      return "error";

    case "中":
      return "warning";

    case "低":
    default:
      return "info";
  }
};

export function PriorityChip({
  priority,
}: PriorityChipProps) {
  return (
    <Chip
      label={priority}
      color={getPriorityColor(priority)}
      variant="outlined"
      size="small"
      sx={{
        minWidth: 48,
        fontWeight: 500,
      }}
    />
  );
}