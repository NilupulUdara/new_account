import React from "react";
import {
  Stack,
  Paper,
  Grid,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import StoreIcon from "@mui/icons-material/Store";
import GroupIcon from "@mui/icons-material/Group";
import RepeatIcon from "@mui/icons-material/Repeat";
import CategoryIcon from "@mui/icons-material/Category";
import PersonIcon from "@mui/icons-material/Person";
import MapIcon from "@mui/icons-material/Map";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate } from "react-router";
import DashboardCard from "../../../components/DashboardCard";

function SetupMaintenance() {
  const navigate = useNavigate();

  const allItems = [
    {
      text: "VOID A TRANSACTION",
      icon: <PersonAddIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24,
      path: "/setup/maintenance/void-a-transaction"
    },
    {
      text: "VIEW OR PRINT TRANSACTION",
      icon: <StoreIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24, path: "/setup/maintenance/view-or-print-transaction"
    },
    {
      text: "ATTACH DOCUMENTS",
      icon: <GroupIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24, path: "/setup/maintenance/attach-documents"
    },
    {
      text: "SYSTEM DIAGNOSTICS",
      icon: <RepeatIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24, path: "/setup/maintenance/system-diagnostics"
    },
    {
      text: "BACKUP AND RESTORE",
      icon: <CategoryIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24, path: "/setup/maintenance/backup-and-restore"
    },
    {
      text: "CREATE/UPDATE COMPANIES",
      icon: <PersonIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24, path: "/setup/maintenance/create-update-companies"
    },
    {
      text: "INSTALL/UPDATE LANGUAGES",
      icon: <MapIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24, path: "/setup/maintenance/install-languages"
    },
    {
      text: "INSTALL/ACTIVATE EXTENSIONS",
      icon: <CreditScoreIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24, path: "/setup/maintenance/install-extensions"
    },
        {
      text: "INSTALL/ACTIVATE THEMES",
      icon: <CreditScoreIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24, path: "/setup/maintenance/install-themes"
    },
        {
      text: "INSTALL/ACTIVATE CHART OF ACCOUNTS",
      icon: <CreditScoreIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24, path: "/setup/maintenance/install-chart-of-accounts"
    },
    {
      text: "SOFTWARE UPDATE",
      icon: <CreditScoreIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24, path: "/setup/maintenance/software-upgrade"
    },
  ];

  const handleItemClick = (path, text) => {
    if (path) {
      navigate(path);
    } else {
      console.log(`Clicked: ${text} (No route defined)`);
    }
  };

  return (
    <Stack sx={{ minHeight: "100vh", backgroundColor: "#f0f0f0", p: 3 }}>

      <Grid container spacing={2}>
        {allItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <DashboardCard
              text={item.text}
              icon={item.icon}
              change={item.change}
              onClick={() => handleItemClick(item.path, item.text)}
            />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

export default SetupMaintenance;
