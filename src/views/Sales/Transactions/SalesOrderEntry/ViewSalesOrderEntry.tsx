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

export default function ViewSalesOrderEntry() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    customerId,
    customerRef,
    deliverToBranch,
    orderedOn,
    requestedDelivery,
    orderCurrency,
    deliverFromLocation,
    paymentTerms,
    deliveryAddress,
    reference,
    telephone,
    email,
    comments,
    deliveries = [],
    invoices = [],
    creditNotes = [],
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

  // Resolve names
  const customerName = useMemo(() => {
    if (!customerId) return "-";
    const found = (customers || []).find(
      (c: any) => String(c.id) === String(customerId)
    );
    return found ? found.name : "-";
  }, [customers, customerId]);

  const deliverFromName = useMemo(() => {
    if (!deliverFromLocation) return "-";
    const found = (locations || []).find(
      (l: any) => String(l.loc_code) === String(deliverFromLocation)
    );
    return found ? found.location_name : deliverFromLocation;
  }, [locations, deliverFromLocation]);

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "New Sales Order Entry" },
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
          <PageTitle title={`Sales Order - ${reference || "-"}`} />
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

      {/* Order Info, Deliveries, Invoices */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {/* Order Information */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: "var(--pallet-dark-blue)" }}
            >
              Order Information
            </Typography>
            <Typography><b>Customer Name:</b> {customerName}</Typography>
            <Typography>
              <b>Customer Ref:</b> {customerRef || "-"}
              &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
              <b>Deliver To Branch:</b> {deliverToBranch || "-"}
            </Typography>
            <Typography>
              <b>Ordered On:</b> {orderedOn || "-"}
              &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
              <b>Deliver From:</b> {deliverFromName || "-"}
            </Typography>
            <Typography><b>Payment Terms:</b> {paymentTerms || "-"}</Typography>
            <Typography><b>Delivery Address:</b> {deliveryAddress || "-"}</Typography>
            <Typography><b>Reference:</b> {reference || "-"}</Typography>
            <Typography><b>Telephone:</b> {telephone || "-"}</Typography>
            <Typography><b>Email:</b> {email || "-"}</Typography>
            <Typography><b>Comments:</b> {comments || "-"}</Typography>
          </Grid>

          {/* Deliveries */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: "var(--pallet-dark-blue)" }}
            >
              Deliveries
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Ref</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deliveries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>No deliveries</TableCell>
                    </TableRow>
                  ) : (
                    deliveries.map((d: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{d.ref ?? "-"}</TableCell>
                        <TableCell>{d.date ?? "-"}</TableCell>
                        <TableCell>{d.total ?? "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Invoices / Credits */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{ mb: 1, fontWeight: 600, color: "var(--pallet-dark-blue)" }}
            >
              Invoices / Credits
            </Typography>

            {/* Sales Table */}
            <Typography sx={{ fontWeight: 600, mb: 1 }}>Sales</Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Ref</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>No invoices</TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((inv: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{inv.ref ?? "-"}</TableCell>
                        <TableCell>{inv.date ?? "-"}</TableCell>
                        <TableCell>{inv.total ?? "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Credit Notes Table */}
            <Typography sx={{ fontWeight: 600, mb: 1 }}>Credit Notes</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Ref</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {creditNotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>No credit notes</TableCell>
                    </TableRow>
                  ) : (
                    creditNotes.map((cr: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{cr.ref ?? "-"}</TableCell>
                        <TableCell>{cr.date ?? "-"}</TableCell>
                        <TableCell>{cr.total ?? "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
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

              {/* Totals */}
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
