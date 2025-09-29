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

function SalesMaintenance() {
  const navigate = useNavigate();

  const allItems = [
    { text: "Add and Manage Customers", icon: <PersonAddIcon sx={{ fontSize: 40, color: "#1976d2" }} />, change: +24, path: "/sales/maintenance/add-and-manage-customers" },
    { text: "Customer Branches", icon: <StoreIcon sx={{ fontSize: 40, color: "#1976d2" }} />, change: +24, path: "/sales/maintenance/customer-branches" },
    { text: "Sales Groups", icon: <GroupIcon sx={{ fontSize: 40, color: "#1976d2" }} />, change: +24, path: "/sales/maintenance/sales-groups" },
    { text: "Recurrent Invoices", icon: <RepeatIcon sx={{ fontSize: 40, color: "#1976d2" }} />, change: +24, path: "/sales/maintenance/recurrent-invoices" },
    { text: "Sales Types", icon: <CategoryIcon sx={{ fontSize: 40, color: "#1976d2" }} />, change: +24, path: "/sales/maintenance/sales-types" },
    { text: "Sales Persons", icon: <PersonIcon sx={{ fontSize: 40, color: "#1976d2" }} />, change: +24, path: "/sales/maintenance/sales-persons" },
    { text: "Sales Areas", icon: <MapIcon sx={{ fontSize: 40, color: "#1976d2" }} />, change: +24, path: "/sales/maintenance/sales-areas" },
    { text: "Credit Status Setup", icon: <CreditScoreIcon sx={{ fontSize: 40, color: "#1976d2" }} />, change: +24, path: "/sales/maintenance/credit-status-setup" },
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

export default SalesMaintenance;
