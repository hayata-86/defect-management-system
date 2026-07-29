import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, Typography } from "@mui/material";

type DashboardHeaderProps = {
  updatedAt: string;
  onRefresh: () => void;
};

export function DashboardHeader({
  updatedAt,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Typography variant="h3" component="h1">
          ダッシュボード
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ marginTop: 0.5 }}
        >
          不具合の対応状況を確認できます。
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          最終更新：{updatedAt}
        </Typography>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
        >
          更新
        </Button>
      </Box>
    </Box>
  );
}
