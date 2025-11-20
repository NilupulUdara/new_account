import React, { useState } from "react";
import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSuppliers } from "../../../../api/Supplier/SupplierApi";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

export default function SupplierAllocations() {
  const navigate = useNavigate();

  const { data: suppliers = [] } = useQuery({ queryKey: ["suppliers"], queryFn: getSuppliers });
  const [selectedSupplier, setSelectedSupplier] = useState("ALL_SUPPLIERS");
  const [showSettled, setShowSettled] = useState(false);

  // no data initially - show placeholder row
  const rows: any[] = [];

  return (
    <Stack spacing={2}>
      <Box sx={{ padding: theme.spacing(2), boxShadow: 2, borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <PageTitle title="Supplier Allocations" />
          <Breadcrumb breadcrumbs={[{ title: "Home", href: "/home" }, { title: "Supplier Allocations" }]} />
        </Box>

        <Stack direction="row" alignItems="center" spacing={1}>
          <FormControl sx={{ minWidth: 250 }} size="small">
            <InputLabel>Select Supplier</InputLabel>
            <Select value={selectedSupplier} label="Select Supplier" onChange={(e) => setSelectedSupplier(String(e.target.value))}>
              <MenuItem value="ALL_SUPPLIERS">All Suppliers</MenuItem>
              {(suppliers || []).map((s: any) => (
                <MenuItem key={s.supplier_id ?? s.id ?? s.debtor_no} value={String(s.supplier_id ?? s.id ?? s.debtor_no)}>{s.name ?? s.supplier_name ?? s.debtor_name ?? s.supp_name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={<Checkbox checked={showSettled} onChange={(e) => setShowSettled(e.target.checked)} />}
            label="Show Settled Items:"
          />
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
            Back
          </Button>
        </Stack>
      </Box>

      {/* Customer select moved to header; retained here intentionally removed to avoid duplicate */}

      <TableContainer component={Paper} sx={{ p: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>Transaction Type</TableCell>
              <TableCell>#</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Left to Allocate</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body2">No Records Found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r, idx) => (
                <TableRow key={r.id ?? idx} hover>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{r.number}</TableCell>
                  <TableCell>{r.reference}</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>{r.supplier}</TableCell>
                  <TableCell>{r.currency}</TableCell>
                  <TableCell>{r.total}</TableCell>
                  <TableCell>{r.left}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      onClick={() => navigate("/purchase/transactions/allocate-supplier-payments-credit-notes/view-supplier-allocations", { state: { id: r.id } })}
                    >
                      Allocate
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
