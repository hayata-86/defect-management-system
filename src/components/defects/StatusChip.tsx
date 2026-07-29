import { Chip } from "@mui/material";

import type { DefectStatus } from "../../types/defect";

type StatusChipProps = {
  status: DefectStatus;
};

type StatusColor = "default" | "warning" | "success";

const getStatusColor = (status: DefectStatus): StatusColor => {
  switch (status) {
    case "対応中":
      return "warning";

    case "完了":
      return "success";

    case "未対応":
    default:
      return "default";
  }
};

export function StatusChip({ status }: StatusChipProps) {
  return (
    <Chip
      label={status}
      color={getStatusColor(status)}
      size="small"
      sx={{
        minWidth: 72,
        fontWeight: 500,
      }}
    />
  );
}