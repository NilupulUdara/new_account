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

// APIs
import { getSuppliers } from "../../../../api/Supplier/SupplierApi";

export default function ViewSupplierPaymentEntry() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    supplier,
    bankAccount,
    datePaid,
    amount,
    discount,
    reference,
    paymentType,
  } = state || {};

  // Fetch suppliers
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });

  // Supplier name
  const supplierName = useMemo(() => {
    const found = suppliers.find(
      (s: any) => String(s.supplier_id) === String(supplier)
    );
    return found ? found.supp_name : supplier || "-";
  }, [suppliers, supplier]);

  const breadcrumbItems = [
    { title: "Purchases", href: "/purchases" },
    { title: "Payment to Supplier " },
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
          <PageTitle title={`Payment to Supplier  - ${reference || "-"}`} />
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
          Payment to Supplier 
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>To Supplier:</b> {supplierName}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography>
              <b>From Bank Account:</b> {bankAccount || "-"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Date Paid:</b> {datePaid || "-"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Payment Type:</b> {paymentType || "-"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Amount:</b> {amount ?? "-"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Discount:</b> {discount ?? "-"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Reference:</b> {reference || "-"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Allocation Table */}
      <Paper sx={{ p: 2 }}>
        <Typography sx={{ mb: 2, fontWeight: 600 }}>Allocations</Typography>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Number</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Left to Allocate</TableCell>
                <TableCell>This Allocation</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {/* Sample data - replace with actual data */}
              <TableRow>
                <TableCell>Purchase Invoice</TableCell>
                <TableCell>PI-001</TableCell>
                <TableCell>2025-01-15</TableCell>
                <TableCell>1500.00</TableCell>
                <TableCell>500.00</TableCell>
                <TableCell>1000.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Credit Note</TableCell>
                <TableCell>CN-002</TableCell>
                <TableCell>2025-01-20</TableCell>
                <TableCell>-200.00</TableCell>
                <TableCell>0.00</TableCell>
                <TableCell>-200.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Buttons */}
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
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
