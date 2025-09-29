import React from "react";
import {
  Stack,
  Grid,
  Paper,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PaymentIcon from "@mui/icons-material/Payment";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import DescriptionIcon from "@mui/icons-material/Description";
import PrintIcon from "@mui/icons-material/Print";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate } from "react-router";
import DashboardCard from "../../../components/DashboardCard";

function PurchaseTransactions() {
  const navigate = useNavigate();

  const allItems = [
    {
      text: "PURCHASE ORDER ENTRY",
      change: +36,
      icon: <RequestQuoteIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/purchase/transactions/purchase-order-entry",
    },
    {
      text: "OUTSTANDING PURCHASE ORDERS MAINTENANCE",
      change: -14,
      icon: <ShoppingCartIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/purchase/transactions/outstanding-purchase-orders-maintenance",
    },
    {
      text: "DIRECT GRN",
      change: +36,
      icon: <LocalShippingIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/purchase/transactions/direct-grn",
    },
    {
      text: "DIRECT SUPPLIER INVOICE",
      change: +36,
      icon: <ReceiptIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/purchase/transactions/direct-supplier-invoice",
    },
    {
      text: "PAYMENT to SUPPLIERS",
      change: -14,
      icon: <AssignmentTurnedInIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/purchase/transactions/payment-to-suppliers",
    },
    {
      text: "SUPPLIER INVOICE",
      change: +36,
      icon: <PaymentIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/purchase/transactions/supplier-invoice",
    },
    {
      text: "SUPPLIER CREDIT NOTES",
      change: +36,
      icon: <NoteAddIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/purchase/transactions/supplier-credit-notes",
    },
    {
      text: "ALLOCATE SUPPLIER PAYMENTS OR CREDIT NOTES",
      change: +12,
      icon: <ReceiptIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/purchase/transactions/allocate-supplier-payments-credit-notes",
    },
  ];

  const handleItemClick = (path, text) => {
    if (path) {
      navigate(path);
    } else {
      console.log(`Clicked: ${text} (No route defined)`);
    }
  };

  const renderCard = (item, index) => (
    <Paper
      key={index}
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        borderRadius: 3,
        mb: 4,
        mx: 6,
        height: 120,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          cursor: "pointer",
        },
      }}
      onClick={() => handleItemClick(item.path, item.text)}
    >
      <Box display="flex" alignItems="center" gap={2}>

        <Box>
          <Typography variant="subtitle1" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
            {item.text}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            compared last…{" "}
            <span style={{ fontWeight: "bold", color: item.change >= 0 ? "green" : "red" }}>
              {item.change >= 0 ? `+${item.change}% ↑` : `${item.change}% ↓`}
            </span>
          </Typography>
        </Box>
      </Box>

      <Box display="flex" alignItems="center" gap={1}>
        {item.icon}
        <ArrowForwardIosIcon fontSize="large" sx={{ color: "gray" }} />
      </Box>
    </Paper>
  );

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

export default PurchaseTransactions;
