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

function ManufacturingMaintenance() {
  const navigate = useNavigate();

  const allItems = [
    {
      text: "BILLS of MATERIALS",
      icon: <PersonAddIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24,
      path: "/manufacturing/maintenance/bils-of-materials"
    },
    {
      text: "WORK CENTERS",
      icon: <StoreIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      change: +24,
      path: "/manufacturing/maintenance/work-centres"
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

export default ManufacturingMaintenance;
