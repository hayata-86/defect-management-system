import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import type {
  ChangeEvent,
  MouseEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import type {
  DefectDetail,
} from "../../types/defect";
import { PriorityChip } from "./PriorityChip";
import { StatusChip } from "./StatusChip";

type DefectTableProps = {
  defects: DefectDetail[];
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (
    event: MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => void;
  onRowsPerPageChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
};

export function DefectTable({
  defects,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
}: DefectTableProps) {
  const navigate = useNavigate();

  const handleDetail = (defectId: string) => {
    navigate(`/defects/${defectId}`);
  };

  return (
    <Paper
      sx={{
        border: 1,
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <TableContainer>
        <Table sx={{ minWidth: 1100 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 100 }}>
                不具合No
              </TableCell>

              <TableCell>
                件名
              </TableCell>

              <TableCell sx={{ width: 180 }}>
                プロジェクト
              </TableCell>

              <TableCell sx={{ width: 110 }}>
                担当者
              </TableCell>

              <TableCell sx={{ width: 100 }}>
                状態
              </TableCell>

              <TableCell sx={{ width: 90 }}>
                優先度
              </TableCell>

              <TableCell sx={{ width: 120 }}>
                登録日
              </TableCell>

              <TableCell sx={{ width: 120 }}>
                更新日
              </TableCell>

              <TableCell
                align="center"
                sx={{ width: 100 }}
              >
                操作
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {defects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  sx={{
                    paddingY: 6,
                    textAlign: "center",
                  }}
                >
                  <Typography color="text.secondary">
                    検索条件に一致する不具合はありません。
                  </Typography>
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
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                      }}
                    >
                      {defect.title}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {defect.projectName}
                  </TableCell>

                  <TableCell>
                    {defect.assignee}
                  </TableCell>

                  <TableCell>
                    <StatusChip
                      status={defect.status}
                    />
                  </TableCell>

                  <TableCell>
                    <PriorityChip
                      priority={defect.priority}
                    />
                  </TableCell>

                  <TableCell>
                    {defect.registeredAt}
                  </TableCell>

                  <TableCell>
                    {defect.updatedAt}
                  </TableCell>

                  <TableCell align="center">
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => {
                        handleDetail(defect.id);
                      }}
                    >
                      詳細
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={
          onRowsPerPageChange
        }
        rowsPerPageOptions={[
          5,
          10,
          25,
        ]}
        labelRowsPerPage="表示件数"
        labelDisplayedRows={({
          from,
          to,
          count,
        }) =>
          `${from}–${to} / ${
            count !== -1
              ? count
              : `${to}件以上`
          }`
        }
      />
    </Paper>
  );
}

export default DefectTable;