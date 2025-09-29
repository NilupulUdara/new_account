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

function SalesTransactions() {
  const navigate = useNavigate();

  const allItems = [
    {
      text: "SALES QUOTATION ENTRY",
      change: +36,
      icon: <RequestQuoteIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/sales/transactions/sales-quotation-entry",
    },
    {
      text: "SALES ORDER ENTRY",
      change: -14,
      icon: <ShoppingCartIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/sales/transactions/sales-order-entry",
    },
    {
      text: "DIRECT DELIVERY",
      change: +36,
      icon: <LocalShippingIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/sales/transactions/direct-delivery",
    },
    {
      text: "DIRECT INVOICE",
      change: +36,
      icon: <ReceiptIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/sales/transactions/direct-invoice",
    },
    {
      text: "DELIVERY AGAINST SALES ORDERS",
      change: -14,
      icon: <AssignmentTurnedInIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/sales/transactions/delivery-against-sales-orders",
    },
    {
      text: "INVOICE AGAINST SALES DELIVERY",
      change: +36,
      icon: <PaymentIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/sales/transactions/invoice-against-sales-delivery",
    },
    {
      text: "INVOICE PREPAID ORDERS",
      change: +36,
      icon: <NoteAddIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/sales/transactions/invoice-prepaid-orders",
    },
    {
      text: "TEMPLATE DELIVERY",
      change: +20,
      icon: <DescriptionIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/sales/transactions/template-delivery",
    },
    {
      text: "TEMPLATE INVOICE",
      change: +12,
      icon: <ReceiptIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/sales/transactions/template-invoice",
    },
    {
      text: "CREATE AND PRINT RECURRENT INVOICES",
      change: -8,
      icon: <PrintIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/sales/transactions/create-print-recurrent-invoices",
    },
    {
      text: "CUSTOMER PAYMENTS",
      change: +36,
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/sales/transactions/customer-payments",
    },
    {
      text: "CUSTOMER CREDIT NOTES",
      change: +15,
      icon: <CreditScoreIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/sales/transactions/customer-credit-notes",
    },
    {
      text: "ALLOCATE CUSTOMER PAYMENTS OR CREDIT NOTES",
      change: -5,
      icon: <AssignmentTurnedInIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/sales/transactions/allocate-customer-payments-credit-notes",
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

export default SalesTransactions;
