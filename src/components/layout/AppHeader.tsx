import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

type AppHeaderProps = {
  onMenuClick: () => void;
};

export function AppHeader({
  onMenuClick,
}: AppHeaderProps) {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "ログアウトに失敗しました。",
        error,
      );
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ marginRight: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1 }}
        >
          不具合管理システム
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="body2">
            {user?.name
              ? `${user.name}さん`
              : user?.email ?? "ユーザー"}
          </Typography>

          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            ログアウト
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}