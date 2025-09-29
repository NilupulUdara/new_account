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

function BankingTransactions() {
  const navigate = useNavigate();

  const allItems = [
    {
      text: "PAYMENTS",
      change: +36,
      icon: <RequestQuoteIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/bankingandgeneralledger/transactions/bankingandgeneralledger-quotation-entry",
    },
    {
      text: "DEPOSITS",
      change: -14,
      icon: <ShoppingCartIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/bankingandgeneralledger/transactions/bankingandgeneralledger-order-entry",
    },
    {
      text: "BANK ACCOUNT TRANSFERS",
      change: +36,
      icon: <LocalShippingIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/bankingandgeneralledger/transactions/bank-account-transfers",
    },
    {
      text: "JOURNAL ENTRY",
      change: +36,
      icon: <ReceiptIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/bankingandgeneralledger/transactions/journal-entry",
    },
    {
      text: "BUDGET ENTRY",
      change: -14,
      icon: <AssignmentTurnedInIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/bankingandgeneralledger/transactions/budget-entry",
    },
    {
      text: "RECONCILE BANK ACCOUNT",
      change: +36,
      icon: <PaymentIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/bankingandgeneralledger/transactions/reconcile-bank-account",
    },
    {
      text: "REVENU / COST ACCRUALS",
      change: +36,
      icon: <NoteAddIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      path: "/bankingandgeneralledger/transactions/revenue-cost-accruals",
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

export default BankingTransactions;
