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

function PurchaseInquiriesAndReports() {
  const navigate = useNavigate();

  const allItems = [
    { text: "PURCHASE ORDERS INQUIRY", change: +10, icon: <RequestQuoteIcon sx={{ fontSize: 40, color: "#1976d2" }} />, path: "/purchase/inquiriesandreports/purchase-orders-inquiry" },
    { text: "SUPPLIER TRANSACTION INQUIRY", change: -5, icon: <ShoppingCartIcon sx={{ fontSize: 40, color: "#1976d2" }} />, path: "/purchase/inquiriesandreports/supplier-transaction-inquiry" },
    { text: "SUPPLIER ALLOCATION INQUIRY", change: +8, icon: <ReceiptLongIcon sx={{ fontSize: 40, color: "#1976d2" }} />, path: "/purchase/inquiriesandreports/supplier-allocation-inquiry" },
    { text: "SUPPLIER & PURCHASING REPORTS", change: 0, icon: <AssignmentIcon sx={{ fontSize: 40, color: "#1976d2" }} />, path: "/purchase/inquiriesandreports/supplier-and-purchasing-reports" },
  ];

  const handleItemClick = (path, text) => {
    if (text === "SUPPLIER & PURCHASING REPORTS") {
      navigate("/reports", { state: { selectedClass: "Supplier" } });
    } else if (path) {
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

export default PurchaseInquiriesAndReports;