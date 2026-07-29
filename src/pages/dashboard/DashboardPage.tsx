import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import { Box } from "@mui/material";
import { useState } from "react";

import {
  DashboardHeader,
  RecentDefectTable,
  SummaryCard,
} from "../../components/dashboard";
import type { RecentDefect } from "../../components/dashboard";

const recentDefects: RecentDefect[] = [
  {
    id: 1005,
    title: "登録画面で保存ボタンが反応しない",
    assignee: "川端",
    status: "対応中",
    registeredAt: "2026/07/27",
  },
  {
    id: 1004,
    title: "一覧画面の検索結果が正しく表示されない",
    assignee: "田中",
    status: "未対応",
    registeredAt: "2026/07/26",
  },
  {
    id: 1003,
    title: "ログイン後に画面が白くなる",
    assignee: "佐藤",
    status: "完了",
    registeredAt: "2026/07/25",
  },
  {
    id: 1002,
    title: "月次集計の件数に差異がある",
    assignee: "鈴木",
    status: "対応中",
    registeredAt: "2026/07/24",
  },
  {
    id: 1001,
    title: "入力エラーが画面に表示されない",
    assignee: "川端",
    status: "未対応",
    registeredAt: "2026/07/23",
  },
];

const formatDateTime = () => {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
};

export function DashboardPage() {
  const [updatedAt, setUpdatedAt] = useState(formatDateTime());

  const handleRefresh = () => {
    setUpdatedAt(formatDateTime());
  };

  return (
    <Box>
      <DashboardHeader
        updatedAt={updatedAt}
        onRefresh={handleRefresh}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 2,
          marginTop: 3,
        }}
      >
        <SummaryCard
          title="未対応"
          count={12}
          icon={<AssignmentLateIcon />}
          color="primary"
        />

        <SummaryCard
          title="対応中"
          count={5}
          icon={<PendingActionsIcon />}
          color="warning"
        />

        <SummaryCard
          title="完了"
          count={32}
          icon={<CheckCircleIcon />}
          color="success"
        />

       <SummaryCard
          title="期限超過"
          count={2}
          icon={<ErrorOutlinedIcon />}
          color="error"
        />
      </Box>

      <Box sx={{ marginTop: 3 }}>
        <RecentDefectTable defects={recentDefects} />
      </Box>
    </Box>
  );
}

export default DashboardPage;