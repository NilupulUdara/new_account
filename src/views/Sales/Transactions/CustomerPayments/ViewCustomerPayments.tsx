import React, { useMemo } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Button,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";
import { getCustomers } from "../../../../api/Customer/AddCustomerApi";
import { getBankAccounts } from "../../../../api/BankAccount/BankAccountApi";

export default function ViewCustomerPayments() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    fromCustomer,
    customerCurrency,
    intoBankAccount,
    reference,
    amount,
    bankAmount,
    dateOfDeposit,
    discount,
    paymentType,
    allocations = [],
    totalAllocated,
  } = state || {};

  // Fetch customer list
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  // Fetch bank accounts list
  const { data: bankAccounts = [] } = useQuery({
    queryKey: ["bankAccounts"],
    queryFn: getBankAccounts,
  });

  // Resolve customer name
  const customerName = useMemo(() => {
    if (!fromCustomer) return "-";
    const found = (customers || []).find(
      (c: any) => String(c.id) === String(fromCustomer)
    );
    return found ? found.name : fromCustomer;
  }, [customers, fromCustomer]);

  // Resolve bank account name
  const bankAccountName = useMemo(() => {
    if (!intoBankAccount) return "-";
    const found = (bankAccounts || []).find(
      (b: any) => String(b.id) === String(intoBankAccount)
    );
    return found ? found.bank_account_name || found.account_name : intoBankAccount;
  }, [bankAccounts, intoBankAccount]);

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Customer Payments" },
  ];

  return (
    <Stack spacing={2}>
      {/* Header */}
      <Box
        sx={{
          padding: 2,
          boxShadow: 2,
          borderRadius: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Box>
          <PageTitle title={`Customer Payment - ${reference || "-"}`} />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </Box>

      {/* Payment Information */}
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: "var(--pallet-dark-blue)" }}
        >
          Customer Payment #
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>From Customer:</b> {customerName || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Customer Currency:</b> {customerCurrency || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Into Bank Account:</b> {bankAccountName || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Reference:</b> {reference || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Amount:</b> {amount || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Bank Amount:</b> {bankAmount || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Date of Deposit:</b> {dateOfDeposit || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Discount:</b> {discount || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Payment Type:</b> {paymentType || "-"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Allocations Table */}
      <Paper sx={{ p: 2 }}>
        {/* Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
          <Button variant="contained" color="primary">
            Print
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Close
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
