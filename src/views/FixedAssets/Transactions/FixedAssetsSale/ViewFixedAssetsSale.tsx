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
import { getShippingCompanies } from "../../../../api/ShippingCompany/ShippingCompanyApi";

export default function ViewFixedAssetsSale() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    chargeTo,
    chargeBranch,
    paymentTerms,
    reference,
    customerOrderRef,
    dueDate,
    currency,
    shippingCompany,
    deliveries,
    ourOrderNo,
    salesType,
    invoiceDate,
    items = [],
    payments = [],
    subtotal,
    totalInvoice,
  } = state || {};

  // === Fetch Data ===
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  const { data: shippingCompanies = [] } = useQuery({
    queryKey: ["shippingCompanies"],
    queryFn: getShippingCompanies,
  });

  // === Resolve Names ===
  const chargeToName = useMemo(() => {
    if (!chargeTo) return "-";
    const found = (customers || []).find(
      (c: any) => String(c.id) === String(chargeTo)
    );
    return found ? found.name : chargeTo;
  }, [customers, chargeTo]);

  const shippingCompanyName = useMemo(() => {
    if (!shippingCompany) return "-";
    const found = (shippingCompanies || []).find(
      (s: any) => String(s.id) === String(shippingCompany)
    );
    return found ? found.shipper_name : shippingCompany;
  }, [shippingCompanies, shippingCompany]);

  // === Breadcrumbs ===
  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Direct Invoices" },
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
          <PageTitle title={`Direct Invoice - ${reference || "-"}`} />
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

      {/* Invoice Info */}
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: "var(--pallet-dark-blue)" }}
        >
          Invoice Information
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Charge To:</b> {chargeToName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Charge Branch:</b> {chargeBranch || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Payment Terms:</b> {paymentTerms || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Reference:</b> {reference || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Customer Order Ref:</b> {customerOrderRef || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Due Date:</b> {dueDate || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Currency:</b> {currency || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Shipping Company:</b> {shippingCompanyName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Deliveries:</b> {deliveries || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Our Order No:</b> {ourOrderNo || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Sales Type:</b> {salesType || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Invoice Date:</b> {invoiceDate || "-"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Items Table */}
      <Paper sx={{ p: 2 }}>
        <Typography sx={{ mb: 1, fontWeight: 600 }}>Item Details</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Item Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Discount %</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>No items available</TableCell>
                </TableRow>
              ) : (
                items.map((it: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{it.itemCode ?? "-"}</TableCell>
                    <TableCell>{it.description ?? "-"}</TableCell>
                    <TableCell>{it.quantity ?? "-"}</TableCell>
                    <TableCell>{it.unit ?? "-"}</TableCell>
                    <TableCell>{it.price ?? "-"}</TableCell>
                    <TableCell>{it.discount ?? "-"}</TableCell>
                    <TableCell>{it.total ?? "-"}</TableCell>
                  </TableRow>
                ))
              )}

              {/* Totals */}
              <TableRow>
                <TableCell colSpan={5}></TableCell>
                <TableCell>Sub-total</TableCell>
                <TableCell>{subtotal ?? "-"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5}></TableCell>
                <TableCell sx={{ fontWeight: 600 }}>TOTAL INVOICE</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {totalInvoice ?? "-"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Payments Table */}
      <Paper sx={{ p: 2 }}>
        <Typography sx={{ mb: 1, fontWeight: 600 }}>Payments</Typography>
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
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>No payments available</TableCell>
                </TableRow>
              ) : (
                payments.map((p: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{p.type ?? "-"}</TableCell>
                    <TableCell>{p.number ?? "-"}</TableCell>
                    <TableCell>{p.date ?? "-"}</TableCell>
                    <TableCell>{p.totalAmount ?? "-"}</TableCell>
                    <TableCell>{p.leftToAllocate ?? "-"}</TableCell>
                    <TableCell>{p.thisAllocation ?? "-"}</TableCell>
                  </TableRow>
                ))
              )}

              {/* Total Allocated */}
              <TableRow>
                <TableCell colSpan={5}></TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  Total Allocated
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

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
