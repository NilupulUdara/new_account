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
import { getDebtorTrans } from "../../../../api/DebtorTrans/DebtorTransApi";
import { getBankTrans } from "../../../../api/BankTrans/BankTransApi";

export default function ViewCustomerPayments() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    fromCustomer,
    reference,
    amount,
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

  // Fetch debtor transactions
  const { data: debtorTransList = [] } = useQuery({
    queryKey: ["debtorTrans"],
    queryFn: getDebtorTrans,
  });

  // Fetch bank transactions
  const { data: bankTransList = [] } = useQuery({
    queryKey: ["bankTrans"],
    queryFn: getBankTrans,
  });

  // Find the debtor transaction with trans_type = 12 and matching reference
  const debtorTrans = debtorTransList.find(
    (dt: any) => dt.trans_type === 12 && dt.reference === reference
  );

  // Find the corresponding bank transaction
  const bankTrans = bankTransList.find(
    (bt: any) => bt.type === 12 && bt.trans_no === debtorTrans?.trans_no
  );

  // Resolve customer name
  const customerName = useMemo(() => {
    if (!debtorTrans?.debtor_no) return "-";
    const found = (customers || []).find(
      (c: any) => String(c.debtor_no) === String(debtorTrans.debtor_no)
    );
    return found ? found.name : debtorTrans.debtor_no;
  }, [customers, debtorTrans]);

  // Resolve customer currency
  const customerCurrency = useMemo(() => {
    if (!debtorTrans?.debtor_no) return "-";
    const found = (customers || []).find(
      (c: any) => String(c.debtor_no) === String(debtorTrans.debtor_no)
    );
    return found ? found.curr_code || found.currency || "-" : "-";
  }, [customers, debtorTrans]);

  // Resolve bank account name
  const bankAccountName = useMemo(() => {
    if (!bankTrans?.bank_act) return "-";
    const found = (bankAccounts || []).find(
      (b: any) => String(b.id) === String(bankTrans.bank_act)
    );
    return found ? found.bank_account_name || found.account_name : bankTrans.bank_act;
  }, [bankAccounts, bankTrans]);

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
          <PageTitle title={`Customer Payment - ${debtorTrans?.trans_no || reference || "-"}`} />
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
          Customer Payment #{debtorTrans?.trans_no }
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
              <b>Reference:</b> {debtorTrans?.reference || reference || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Amount:</b> {debtorTrans?.ov_amount?.toFixed(2) || amount || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Bank Amount:</b> {bankTrans?.amount?.toFixed(2) || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Date of Deposit:</b> {debtorTrans?.tran_date || dateOfDeposit || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Discount:</b> {debtorTrans?.ov_discount?.toFixed(2) || discount || "-"}
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
