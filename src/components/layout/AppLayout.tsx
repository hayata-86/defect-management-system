import { Box, Toolbar } from "@mui/material";
import { useState } from "react";
import { Outlet } from "react-router-dom";

import { AppHeader } from "./AppHeader";
import { SideNavigation } from "./SideNavigation";

const drawerWidth = 240;

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(true);

  const handleMenuClick = () => {
    setMenuOpen((previous) => !previous);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppHeader onMenuClick={handleMenuClick} />

      <SideNavigation open={menuOpen} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: menuOpen
            ? `calc(100% - ${drawerWidth}px)`
            : "100%",
          padding: 3,
          transition: (theme) =>
            theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.shortest,
            }),
        }}
      >
        <Toolbar />

        <Outlet />
      </Box>
    </Box>
  );
}
