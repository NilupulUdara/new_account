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

export default function ViewSupplierAllocations() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    supplierId,
    date,
    totalAmount,
    allocations = [],
    totalAllocated,
    leftToAllocate,
  } = state || {};

  // Fetch suppliers
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });

  // Resolve supplier name
  const supplierName = useMemo(() => {
    if (!supplierId) return "-";
    const found = suppliers.find((s) => String(s.supplier_id) === String(supplierId));
    return found ? found.supp_name : "-";
  }, [supplierId, suppliers]);

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Supplier Allocations" },
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
          <PageTitle title="Supplier Allocation" />
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

      {/* Allocation Summary */}
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: "var(--pallet-dark-blue)" }}
        >
          Supplier Allocation Details
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography><b>Supplier Name:</b> {supplierName}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><b>Date:</b> {date || "-"}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><b>Total:</b> {totalAmount || "-"}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Allocation Table */}
      <Paper sx={{ p: 2 }}>
        <Typography sx={{ mb: 2, fontWeight: 600 }}>
          Allocations
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "var(--pallet-light-blue)" }}>
              <TableRow>
                <TableCell><b>Transaction Type</b></TableCell>
                <TableCell><b>#</b></TableCell>
                <TableCell><b>Supplier Ref</b></TableCell>
                <TableCell><b>Date</b></TableCell>
                <TableCell><b>Due Date</b></TableCell>
                <TableCell align="right"><b>Amount</b></TableCell>
                <TableCell align="right"><b>Other Allocations</b></TableCell>
                <TableCell align="right"><b>Left to Allocate</b></TableCell>
                <TableCell align="right"><b>This Allocation</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {allocations.length > 0 ? (
                allocations.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.transType || "-"}</TableCell>
                    <TableCell>{row.transNo || "-"}</TableCell>
                    <TableCell>{row.supplierRef || "-"}</TableCell>
                    <TableCell>{row.date || "-"}</TableCell>
                    <TableCell>{row.dueDate || "-"}</TableCell>
                    <TableCell align="right">{row.amount || "-"}</TableCell>
                    <TableCell align="right">{row.otherAllocations || "-"}</TableCell>
                    <TableCell align="right">{row.leftToAllocate || "-"}</TableCell>
                    <TableCell align="right">{row.thisAllocation || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No allocation records found
                  </TableCell>
                </TableRow>
              )}

              {/* Total Rows */}
              <TableRow>
                <TableCell colSpan={7}></TableCell>
                <TableCell align="right"><b>Total Allocated</b></TableCell>
                <TableCell align="right"><b>{totalAllocated || "-"}</b></TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={7}></TableCell>
                <TableCell align="right"><b>Left to Allocate</b></TableCell>
                <TableCell align="right"><b>{leftToAllocate || "-"}</b></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="outlined">Refresh</Button>
        <Button variant="contained" color="primary">Process</Button>
        <Button variant="outlined" color="secondary" onClick={() => navigate(-1)}>
          Back to Allocation
        </Button>
      </Stack>
    </Stack>
  );
}
