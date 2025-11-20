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
  TableFooter,
  Paper,
  TextField,
  MenuItem,
  Grid,
  useMediaQuery,
  Theme,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  TablePagination,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSuppliers } from "../../../../api/Supplier/SupplierApi";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

interface Row {
  id: number;
  type: string;
  number: string;
  reference: string;
  suppReference: string;
  date: string;
  dueDate: string;
  debit: number;
  credit: number;
  allocated: number;
  balance: number;
}

export default function SupplierAllocationInquiry() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  // pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // filters
  const [selectedSupplier, setSelectedSupplier] = useState("ALL_SUPPLIERS");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [type, setType] = useState("ALL_TYPES");
  const [showSettled, setShowSettled] = useState(false);

  const { data: suppliers = [] } = useQuery({ queryKey: ["suppliers"], queryFn: getSuppliers });

  // sample data
  const today = new Date().toISOString().split("T")[0];
  const rows: Row[] = [
    { id: 1, type: "Purchase Invoice", number: "PI-1001", reference: "REF-001", suppReference: "SUPP-REF-001", date: today, dueDate: "2025-12-14", debit: 150.0, credit: 0, allocated: 50, balance: 100 },
    { id: 2, type: "Supplier Payment", number: "SP-1002", reference: "REF-002", suppReference: "SUPP-REF-002", date: today, dueDate: "2025-12-15", debit: 0, credit: 320.0, allocated: 120, balance: 200 },
  ];

  // pagination
  const paginatedRows = React.useMemo(() => {
    if (rowsPerPage === -1) return rows;
    return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [rows, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Stack spacing={2}>
      {/* Header */}
      <Box
        sx={{
          padding: theme.spacing(2),
          boxShadow: 2,
          borderRadius: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Box>
          <PageTitle title="Supplier Allocation Inquiry" />
          <Breadcrumb
            breadcrumbs={[
              { title: "Inquiries and Reports", href: "/purchases/inquiriesandreports" },
              { title: "Supplier Allocation Inquiry" },
            ]}
          />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="supplier-label">Select Supplier</InputLabel>
              <Select
                labelId="supplier-label"
                value={selectedSupplier}
                label="Select Supplier"
                onChange={(e) => setSelectedSupplier(String(e.target.value))}
              >
                <MenuItem value="ALL_SUPPLIERS">All Suppliers</MenuItem>
                {(suppliers || []).map((s: any) => (
                  <MenuItem
                    key={s.supplier_id}
                    value={String(s.supplier_id)}
                  >
                    {s.supp_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="From Date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="To Date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                value={type}
                label="Type"
                onChange={(e) => setType(String(e.target.value))}
              >
                <MenuItem value="ALL_TYPES">All Types</MenuItem>
                <MenuItem value="PURCHASE_INVOICE">Purchase Invoice</MenuItem>
                <MenuItem value="SUPPLIER_PAYMENT">Supplier Payment</MenuItem>
                <MenuItem value="DEBIT_NOTE">Debit Note</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showSettled}
                  onChange={(e) => setShowSettled(e.target.checked)}
                  color="primary"
                />
              }
              label="Show Settled"
            />
          </Grid>

          <Grid item xs={12} sm={2} md={1}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={() =>
                console.log("Search clicked", { selectedSupplier, fromDate, toDate, type, showSettled })
              }
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} sx={{ p: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>#</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Supp Reference</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell align="right">Debit</TableCell>
              <TableCell align="right">Credit</TableCell>
              <TableCell align="right">Allocated</TableCell>
              <TableCell align="right">Balance</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedRows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.number}</TableCell>
                <TableCell>{r.reference}</TableCell>
                <TableCell>{r.suppReference}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell>{r.dueDate}</TableCell>
                <TableCell align="right">{r.debit.toFixed(2)}</TableCell>
                <TableCell align="right">{r.credit.toFixed(2)}</TableCell>
                <TableCell align="right">{r.allocated.toFixed(2)}</TableCell>
                <TableCell align="right">{r.balance.toFixed(2)}</TableCell>
                <TableCell align="center">
                  <Button variant="outlined" size="small" onClick={() => navigate("/purchase/transactions/allocate-supplier-payments-credit-notes/view-supplier-allocations", { state: { id: r.id } })}>Allocation</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={11}
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                showFirstButton
                showLastButton
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Stack>
  );
}
