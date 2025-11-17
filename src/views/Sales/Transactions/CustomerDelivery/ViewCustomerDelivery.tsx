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

export default function ViewCustomerDelivery() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    chargeTo,
    chargeBranch,
    deliveredTo,
    reference,
    customerOrderRef,
    dispatchDate,
    currency,
    shippingCompany,
    dueDate,
    ourOrderNo,
    saleType,
    items = [],
    subtotal,
    totalAmount,
  } = state || {};

  // Fetch customers for display
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  // Fetch locations for display
  const { data: locations = [] } = useQuery({
    queryKey: ["inventoryLocations"],
    queryFn: getInventoryLocations,
  });

  // Resolve display names
  const chargeToName = useMemo(() => {
    if (!chargeTo) return "-";
    const found = (customers || []).find(
      (c: any) => String(c.id) === String(chargeTo)
    );
    return found ? found.name : chargeTo;
  }, [customers, chargeTo]);

  const deliveredToName = useMemo(() => {
    if (!deliveredTo) return "-";
    const found = (locations || []).find(
      (l: any) => String(l.loc_code) === String(deliveredTo)
    );
    return found ? found.location_name : deliveredTo;
  }, [locations, deliveredTo]);

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Direct Deliveries" },
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
          <PageTitle title={`Direct Delivery - ${reference || "-"}`} />
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

      {/* Delivery Information */}
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: "var(--pallet-dark-blue)" }}
        >
          Delivery Information
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Charge To:</b> {chargeToName || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Charge Branch:</b> {chargeBranch || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Delivered To:</b> {deliveredToName || "-"}
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
              <b>Dispatch Date:</b> {dispatchDate || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Currency:</b> {currency || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Shipping Company:</b> {shippingCompany || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Due Date:</b> {dueDate || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Our Order No:</b> {ourOrderNo || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Sale Type:</b> {saleType || "-"}
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
                <TableCell>Subtotal</TableCell>
                <TableCell>{subtotal ?? "-"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5}></TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {totalAmount ?? "-"}
                </TableCell>
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
