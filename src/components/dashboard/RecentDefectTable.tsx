import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

type DefectStatus = "未対応" | "対応中" | "完了";

export type RecentDefect = {
  id: number;
  title: string;
  assignee: string;
  status: DefectStatus;
  registeredAt: string;
};

type RecentDefectTableProps = {
  defects: RecentDefect[];
};

const getStatusColor = (
  status: DefectStatus,
): "default" | "warning" | "success" => {
  switch (status) {
    case "対応中":
      return "warning";

    case "完了":
      return "success";

    default:
      return "default";
  }
};

export function RecentDefectTable({
  defects,
}: RecentDefectTableProps) {
  return (
    <Paper
      sx={{
        border: 1,
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <Typography
        variant="h5"
        component="h2"
        sx={{ padding: 2.5 }}
      >
        最近登録された不具合
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 100 }}>
                不具合No
              </TableCell>

              <TableCell>
                件名
              </TableCell>

              <TableCell sx={{ width: 140 }}>
                担当者
              </TableCell>

              <TableCell sx={{ width: 120 }}>
                状態
              </TableCell>

              <TableCell sx={{ width: 140 }}>
                登録日
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {defects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  sx={{
                    textAlign: "center",
                    paddingY: 5,
                    color: "text.secondary",
                  }}
                >
                  最近登録された不具合はありません。
                </TableCell>
              </TableRow>
            ) : (
              defects.map((defect) => (
                <TableRow
                  key={defect.id}
                  hover
                  sx={{
                    "&:last-child td": {
                      borderBottom: 0,
                    },
                  }}
                >
                  <TableCell>
                    {defect.id}
                  </TableCell>

                  <TableCell>
                    {defect.title}
                  </TableCell>

                  <TableCell>
                    {defect.assignee}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={defect.status}
                      color={getStatusColor(defect.status)}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    {defect.registeredAt}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
