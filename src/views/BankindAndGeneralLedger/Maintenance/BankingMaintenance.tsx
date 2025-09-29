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

function BankingMaintenance() {
  const navigate = useNavigate();

  const allItems = [
    {
      text: "BANK ACCOUNTS",
      icon: <PersonAddIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24,
      path: "/bankingandgeneralledger/maintenance/bank-accounts"
    },
    {
      text: "QUICK ENTRIES",
      icon: <StoreIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24, path: "/bankingandgeneralledger/maintenance/quick-entries"
    },
    {
      text: "ACCOUNT TAGS",
      icon: <GroupIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24, path: "/bankingandgeneralledger/maintenance/account-tags"
    },
    {
      text: "CURRENCIES",
      icon: <RepeatIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24, path: "/bankingandgeneralledger/maintenance/currencies"
    },
    {
      text: "EXCHANGE RATES",
      icon: <CategoryIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24, path: "/bankingandgeneralledger/maintenance/exchange-rates"
    },
    {
      text: "GL ACCOUNTS",
      icon: <PersonIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24, path: "/bankingandgeneralledger/maintenance/gl-accounts"
    },
    {
      text: "GL ACCOUNT GROUPS",
      icon: <MapIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24, path: "/bankingandgeneralledger/maintenance/gl-account-groups"
    },
    {
      text: "GL ACCOUNT CLASSES",
      icon: <CreditScoreIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24, path: "/bankingandgeneralledger/maintenance/gl-account-classes"
    },
        {
      text: "CLOSING GL TRANSACTIONS",
      icon: <CreditScoreIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24, path: "/bankingandgeneralledger/maintenance/closing-gl-transactions"
    },
        {
      text: "REVALUATION OF CURRENCY ACCOUNTS",
      icon: <CreditScoreIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24, path: "/bankingandgeneralledger/maintenance/revaluation-of-currency-accounts"
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

export default BankingMaintenance;
