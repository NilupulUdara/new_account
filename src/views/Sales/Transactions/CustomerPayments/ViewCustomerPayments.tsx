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
import { getSalesOrders } from "../../../../api/SalesOrders/SalesOrdersApi";
import { getCustAllocations } from "../../../../api/CustAllocation/CustAllocationApi";

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

  // Fetch sales orders and cust_allocations to derive allocations if needed
  const { data: salesOrders = [] } = useQuery({ queryKey: ["salesOrders"], queryFn: () => getSalesOrders().then((r: any) => r.data) });
  const { data: custAllocations = [] } = useQuery({ queryKey: ["custAllocations"], queryFn: () => getCustAllocations().then((r: any) => r.data) });

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
        {/* derive allocations to display: prefer passed-in `allocations`, else cust_allocations for this payment, else sales_orders for the customer */}
        {/** Normalize allocations into fields: type, number, date, total_amount, left_to_allocate, this_allocation */}

        {/* Render normalized rows */}
        {(() => {
          const derived = ((): any => {
            const debtorNo = debtorTrans?.debtor_no ?? fromCustomer;
            const custAllocsForPayment = (custAllocations || []).filter((ca: any) => Number(ca.trans_no_from) === Number(debtorTrans?.trans_no));
            const salesOrdersForCustomer = (salesOrders || []).filter((so: any) =>
              Number(so.trans_type) === 30 &&
              String(so.debtor_no) === String(debtorNo) &&
              Number(so.prep_amount || 0) > Number(so.alloc || 0)
            );

            if (allocations && allocations.length > 0) {
              return allocations.map((a: any) => ({
                type: a.type || 'Sales Order',
                number: a.number ?? a.trans_no_to ?? a.trans_no_from ?? '-',
                date: a.date || a.date_alloc || '-',
                total_amount: Number(a.total_amount ?? a.amt ?? 0),
                left_to_allocate: a.left_to_allocate != null ? Number(a.left_to_allocate) : (a.prep_amount ? Number(a.prep_amount) - Number(a.alloc || 0) : null),
                this_allocation: Number(a.this_allocation ?? a.amt ?? 0),
              }));
            }

            if (custAllocsForPayment.length > 0) {
              return custAllocsForPayment.map((ca: any) => {
                const so = (salesOrders || []).find((s: any) => Number(s.order_no) === Number(ca.trans_no_to));
                return {
                  type: 'Sales Order',
                  number: ca.trans_no_to,
                  date: ca.date_alloc || '-',
                  total_amount: Number(so?.prep_amount ?? ca.amt ?? 0),
                  left_to_allocate: so ? Math.max(0, Number(so.prep_amount || 0) - Number(so.alloc || 0)) : null,
                  this_allocation: Number(ca.amt ?? 0),
                };
              });
            }

            if (salesOrdersForCustomer.length > 0) {
              return salesOrdersForCustomer.map((so: any) => ({
                type: 'Sales Order',
                number: so.order_no,
                date: so.ord_date || so.delivery_date || '-',
                total_amount: Number(so.prep_amount ?? 0),
                left_to_allocate: Math.max(0, Number(so.prep_amount ?? 0) - Number(so.alloc ?? 0)),
                this_allocation: 0,
              }));
            }

            return [];
          })();

          if (!derived || derived.length === 0) {
            return (
              <Typography variant="body2" sx={{ mb: 2 }}>
                No allocations for this payment.
              </Typography>
            );
          }

          return (
            <>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Allocations
              </Typography>
              <TableContainer sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>#</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Total Amount</TableCell>
                      <TableCell align="right">Left to allocate</TableCell>
                      <TableCell align="right">This allocation</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {derived.map((a: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell>{a.type || '-'}</TableCell>
                        <TableCell>{a.number ?? '-'}</TableCell>
                        <TableCell>{a.date ?? '-'}</TableCell>
                        <TableCell align="right">{(Number(a.total_amount ?? 0)).toFixed(2)}</TableCell>
                        <TableCell align="right">{a.left_to_allocate != null ? Number(a.left_to_allocate).toFixed(2) : '-'}</TableCell>
                        <TableCell align="right">{(Number(a.this_allocation ?? 0)).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <b>Total Allocated:</b> {Number(totalAllocated ?? derived.reduce((s: number, x: any) => s + (Number(x.this_allocation || 0)), 0)).toFixed(2)}
              </Typography>
            </>
          );
        })()}
        

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
