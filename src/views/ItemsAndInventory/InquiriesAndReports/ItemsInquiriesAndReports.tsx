import React from "react";

import {
  Stack,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Grid,
  Typography,
  Box,
} from "@mui/material";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate } from "react-router";
import DashboardCard from "../../../components/DashboardCard";

function ItemsInquiriesAndReports() {
  const navigate = useNavigate();

  const allItems = [
    {
      text: "INVENTORY ITEM MOVEMENTS",
      change: +10,
      icon: <RequestQuoteIcon
        sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/itemsandinventory/inquiriesandreports/inventory-item-movements"
    },
    {
      text: "INVENTORY ITEM STATUS",
      change: -5, icon:
      <ShoppingCartIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/itemsandinventory/inquiriesandreports/inventory-item-status"
    },
    {
      text: "INVENTORY REPORTS",
      change: +8,
      icon: <ReceiptLongIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/itemsandinventory/inquiriesandreports/inventory-reports"
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

export default ItemsInquiriesAndReports;