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
import { getSuppliers } from "../../../../api/Supplier/SupplierApi";

export default function ViewSupplierCreditNote() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    supplier,
    reference,
    supplierRef,
    date: invoiceDate,
    creditNoteDate,
    dueDate,
    items = [],
    subtotal,
    totalCreditNote,
  } = state || {};

  // Fetch suppliers for display
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });

  // Supplier name resolve
  const supplierName = useMemo(() => {
    if (!supplier) return "-";
    const found = (suppliers || []).find(
      (s: any) => String(s.supplier_id) === String(supplier)
    );
    return found ? found.supp_name : supplier;
  }, [suppliers, supplier]);

  // Supplier currency resolve
  const supplierCurrency = useMemo(() => {
    if (!supplier) return "-";
    const found = (suppliers || []).find(
      (s: any) => String(s.supplier_id) === String(supplier)
    );
    return found ? (found.curr_code || "-") : "-";
  }, [suppliers, supplier]);

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "SUPPLIER CREDIT NOTE" },
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
          <PageTitle title={`SUPPLIER CREDIT NOTE - ${reference || "-"}`} />
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

      {/* Invoice Information */}
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: "var(--pallet-dark-blue)" }}
        >
          SUPPLIER CREDIT NOTE {reference || "-"}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Supplier:</b> {supplierName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Reference:</b> {reference || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Supplier's Reference:</b> {supplierRef || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Invoice Date:</b> {invoiceDate || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Due Date:</b> {dueDate || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Currency:</b> {supplierCurrency}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Items Table */}
      <Paper sx={{ p: 2 }}>
        <Typography sx={{ mb: 1, fontWeight: 600 }}>
          Received Items Credited on this Note
        </Typography>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Delivery</TableCell>
                <TableCell>Item</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Line Value</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>No items available</TableCell>
                </TableRow>
              ) : (
                items.map((row: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{row.delivery ?? "-"}</TableCell>
                    <TableCell>{row.item ?? "-"}</TableCell>
                    <TableCell>{row.description ?? "-"}</TableCell>
                    <TableCell>{row.quantity ?? "-"}</TableCell>
                    <TableCell>{row.price ?? "-"}</TableCell>
                    <TableCell>{row.lineValue ?? "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Totals Section for Items */}
        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ width: 260 }}>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography>Subtotal:</Typography>
              <Typography>{subtotal ?? "-"}</Typography>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ fontWeight: 600 }}
            >
              <Typography sx={{ fontWeight: 600 }}>Total Credit Note:</Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {totalCreditNote ?? "-"}
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* Allocations Table */}
      <Paper sx={{ p: 2 }}>
        <Typography sx={{ mb: 1, fontWeight: 600 }}>
          Allocations
        </Typography>

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
              <TableRow>
                <TableCell colSpan={6}>No allocations available</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Allocation Totals */}
        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ width: 260 }}>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography>Total Allocated:</Typography>
              <Typography>0.00</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography>Left to Allocate:</Typography>
              <Typography>0.00</Typography>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* Action Buttons */}
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
