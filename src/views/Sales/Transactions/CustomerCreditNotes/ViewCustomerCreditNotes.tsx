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

export default function ViewCustomerCreditNotes() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    customer,
    branch,
    reference,
    salesType,
    date,
    shippingCompany,
    currency,
    items = [],
    totalCredit,
  } = state || {};

  // Fetch customers
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  // Fetch shipping companies
  const { data: shippingCompanies = [] } = useQuery({
    queryKey: ["shippingCompanies"],
    queryFn: getShippingCompanies,
  });

  // Resolve customer name
  const customerName = useMemo(() => {
    if (!customer) return "-";
    const found = (customers || []).find(
      (c) => String(c.id) === String(customer)
    );
    return found ? found.name : customer;
  }, [customers, customer]);

  // Resolve shipping company name
  const shippingName = useMemo(() => {
    if (!shippingCompany) return "-";
    const found = (shippingCompanies || []).find(
      (s) => String(s.shipper_id) === String(shippingCompany)
    );
    return found ? found.shipper_name : shippingCompany;
  }, [shippingCompanies, shippingCompany]);

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Customer Credit Notes" },
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
          <PageTitle title={`Customer Credit Note - ${reference || "-"}`} />
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

      {/* Credit Note Info */}
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: "var(--pallet-dark-blue)" }}
        >
          Customer Credit Note Details
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Customer:</b> {customerName || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Branch:</b> {branch || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Reference:</b> {reference || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Sales Type:</b> {salesType || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Date:</b> {date || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Shipping Company:</b> {shippingName || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Currency:</b> {currency || "-"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Items Table */}
      <Paper sx={{ p: 2 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: "var(--pallet-dark-blue)" }}
        >
          Item Details
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "var(--pallet-light-blue)" }}>
              <TableRow>
                <TableCell><b>Item Code</b></TableCell>
                <TableCell><b>Item Description</b></TableCell>
                <TableCell align="right"><b>Quantity</b></TableCell>
                <TableCell align="right"><b>Unit</b></TableCell>
                <TableCell align="right"><b>Price</b></TableCell>
                <TableCell align="right"><b>Discount %</b></TableCell>
                <TableCell align="right"><b>Total</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items && items.length > 0 ? (
                items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.itemCode || "-"}</TableCell>
                    <TableCell>{item.description || "-"}</TableCell>
                    <TableCell align="right">{item.quantity || "-"}</TableCell>
                    <TableCell align="right">{item.unit || "-"}</TableCell>
                    <TableCell align="right">{item.price || "-"}</TableCell>
                    <TableCell align="right">{item.discount || "-"}</TableCell>
                    <TableCell align="right">{item.total || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No items found
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell colSpan={6} align="right">
                  <b>Total Credit:</b>
                </TableCell>
                <TableCell align="right">
                  <b>{totalCredit || "-"}</b>
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
