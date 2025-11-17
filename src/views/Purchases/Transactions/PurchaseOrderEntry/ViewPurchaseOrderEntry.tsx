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
  TableFooter,
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

export default function ViewPurchaseOrderEntry() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    supplier,
    reference,
    orderDate,
    deliveryAddress,
    deliverIntoLocation,
    items = [],
    subTotal,
    amountTotal,
    memo,
  } = state || {};

  // Fetch suppliers
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });

  // Supplier name resolve
  const supplierName = useMemo(() => {
    if (!supplier) return "-";
    const found = suppliers?.find(
      (s) => String(s.supplier_id) === String(supplier)
    );
    return found ? found.supp_name : supplier;
  }, [supplier, suppliers]);

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Purchase Order" },
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
          <PageTitle title={`Purchase Order - ${reference || "-"}`} />
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

      {/* Order Information */}
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: "var(--pallet-dark-blue)" }}
        >
          Order Information
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
              <b>Order Date:</b> {orderDate || "-"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Delivery Address:</b> {deliveryAddress || "-"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Deliver Into Location:</b> {deliverIntoLocation || "-"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Line Detail Table */}
      <Paper sx={{ p: 2 }}>
        <Typography sx={{ mb: 1, fontWeight: 600 }}>Line Detail</Typography>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Item Code</TableCell>
                <TableCell>Item Description</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Requested By</TableCell>
                <TableCell>Line Total</TableCell>
                <TableCell>Quantity Received</TableCell>
                <TableCell>Quantity Invoiced</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>No items available</TableCell>
                </TableRow>
              ) : (
                items.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.itemCode ?? "-"}</TableCell>
                    <TableCell>{row.description ?? "-"}</TableCell>
                    <TableCell>{row.quantity ?? "-"}</TableCell>
                    <TableCell>{row.unit ?? "-"}</TableCell>
                    <TableCell>{row.price ?? "-"}</TableCell>
                    <TableCell>{row.requestedBy ?? "-"}</TableCell>
                    <TableCell>{row.lineTotal ?? "-"}</TableCell>
                    <TableCell>{row.qtyReceived ?? "-"}</TableCell>
                    <TableCell>{row.qtyInvoiced ?? "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>

            {/* Table Footer with Totals */}
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6} sx={{ fontWeight: 600, textAlign: 'right' }}>
                  Sub Total:
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {subTotal ?? "-"}
                </TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={6} sx={{ fontWeight: 600, textAlign: 'right' }}>
                  Amount Total:
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {amountTotal ?? "-"}
                </TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>

        {/* Memo */}
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>Memo</Typography>
          <Paper sx={{ p: 2, minHeight: 80 }}>
            <Typography>{memo || "No memo added"}</Typography>
          </Paper>
        </Box>

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
