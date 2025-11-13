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
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";

export default function ViewSalesQuotationEntry() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    customerId,
    customerOrderRef,
    orderedOn,
    validUntil,
    orderCurrency,
    paymentTerms,
    deliveryAddress,
    deliverToBranch,
    deliverFromLocation,
    reference,
    telephone,
    email,
    comments,
    items = [],
    subtotal,
    includedTax,
    totalAmount,
  } = state || {};

  // Fetch customers for display
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  // Fetch inventory locations for display
  const { data: locations = [] } = useQuery({
    queryKey: ["inventoryLocations"],
    queryFn: getInventoryLocations,
  });

  // Resolve customer and location names
  const customerName = useMemo(() => {
    if (!customerId) return undefined;
    const found = (customers || []).find(
      (c: any) => String(c.id) === String(customerId)
    );
    return found ? found.name : "-";
  }, [customers, customerId]);

  const deliverFromName = useMemo(() => {
    if (!deliverFromLocation) return undefined;
    const found = (locations || []).find(
      (l: any) => String(l.loc_code) === String(deliverFromLocation)
    );
    return found ? found.location_name : deliverFromLocation;
  }, [locations, deliverFromLocation]);

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Sales Quotations" },
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
          <PageTitle title={`Sales Quotation - ${reference || "-"}`} />
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

      {/* Quotation Details */}
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: "var(--pallet-dark-blue)" }}
        >
          Quotation Details
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography><b>Customer Name:</b> {customerName || "-"}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Customer Order Ref:</b> {customerOrderRef || "-"}
              &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
              <b>Deliver To Branch:</b> {deliverToBranch || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>
              <b>Ordered On:</b> {orderedOn || "-"}
              &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
              <b>Valid Until:</b> {validUntil || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Order Currency:</b> {orderCurrency || "-"}
              &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
              <b>Deliver From:</b> {deliverFromName || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography><b>Payment Terms:</b> {paymentTerms || "-"}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography><b>Telephone:</b> {telephone || "-"}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><b>Email:</b> {email || "-"}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography><b>Delivery Address:</b> {deliveryAddress || "-"}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography><b>Comments:</b> {comments || "-"}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Items Table */}
      <Paper sx={{ p: 2 }}>
        <Typography sx={{ mb: 1, fontWeight: 600 }}>Items</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Item Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Quantity Delivered</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>No items available</TableCell>
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
                    <TableCell>{it.quantityDelivered ?? "-"}</TableCell>
                  </TableRow>
                ))
              )}
              <TableRow>
                <TableCell colSpan={5}></TableCell>
                <TableCell>Subtotal</TableCell>
                <TableCell>{subtotal ?? "-"}</TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5}></TableCell>
                <TableCell>Included Tax</TableCell>
                <TableCell>{includedTax ?? "-"}</TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5}></TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{totalAmount ?? "-"}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Action Buttons */}
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
