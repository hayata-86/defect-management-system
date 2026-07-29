import { Box, Paper, Typography } from "@mui/material";
import type { ReactNode } from "react";

type SummaryCardProps = {
  title: string;
  count: number;
  unit?: string;
  icon: ReactNode;
  color: "primary" | "warning" | "success" | "error";
};

export function SummaryCard({
  title,
  count,
  unit = "件",
  icon,
  color,
}: SummaryCardProps) {
  return (
    <Paper
      sx={{
        padding: 2.5,
        border: 1,
        borderColor: "divider",
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "baseline",
              gap: 0.5,
              marginTop: 1,
            }}
          >
            <Typography variant="h3" component="span">
              {count}
            </Typography>

            <Typography color="text.secondary">
              {unit}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            color: `${color}.main`,
            backgroundColor: `${color}.light`,
            opacity: 0.9,
            "& svg": {
              fontSize: 28,
            },
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
}
