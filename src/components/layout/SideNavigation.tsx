import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventNoteIcon from "@mui/icons-material/EventNote";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AssignmentIcon from "@mui/icons-material/Assignment";
import {
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const drawerWidth = 240;

type SideNavigationProps = {
  open: boolean;
};

const menuItems = [
  {
    label: "ダッシュボード",
    path: "/",
    icon: <DashboardIcon />,
  },
  {
    label: "不具合一覧",
    path: "/defects",
    icon: <ListAltIcon />,
  },
  {
    label: "不具合登録",
    path: "/defects/new",
    icon: <AddCircleOutlineOutlinedIcon />,
  },
  {
    label: "月次振り返り",
    path: "/monthly-review",
    icon: <EventNoteIcon />,
  },
  {
  label: "担当課題数",
  path: "/monthly-workloads",
  icon: <AssignmentIcon />,
  },
  {
    label: "分析",
    path: "/analysis",
    icon: <AssessmentIcon />,
  },
];

export function SideNavigation({ open }: SideNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />

      <Divider />

      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>

            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
