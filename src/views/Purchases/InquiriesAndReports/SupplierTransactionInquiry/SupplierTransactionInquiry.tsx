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
  currency: string;
  terms: string;
  current: number;
  days_1_30: number;
  days_31_60: number;
  over_60_days: number;
  total_balance: number;
  type: string;
  number: string;
  reference: string;
  supplier: string;
  supplierReference: string;
  date: string;
  due_date: string;
  amount: number;
}

export default function SupplierTransactionInquiry() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  // Filters
  const [selectedSupplier, setSelectedSupplier] = useState("ALL_SUPPLIERS");
  const [type, setType] = useState("ALL_TYPES");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });

  // Sample data
  const today = new Date().toISOString().split("T")[0];
  const rows: Row[] = [
    {
      id: 1,
      currency: "LKR",
      terms: "30 Days",
      current: 200.0,
      days_1_30: 100.0,
      days_31_60: 50.0,
      over_60_days: 25.0,
      total_balance: 375.0,
      type: "Sales Invoice",
      number: "SI-1001",
      reference: "REF-001",
      supplier: "ABC Suppliers Ltd",
      supplierReference: "SUP-REF-001",
      date: today,
      due_date: "2025-12-15",
      amount: 375.0,
    },
    {
      id: 2,
      currency: "USD",
      terms: "60 Days",
      current: 0,
      days_1_30: 0,
      days_31_60: 120.0,
      over_60_days: 0,
      total_balance: 120.0,
      type: "Credit Note",
      number: "CN-1002",
      reference: "REF-002",
      supplier: "XYZ Trading Co",
      supplierReference: "SUP-REF-002",
      date: today,
      due_date: "2025-12-20",
      amount: 120.0,
    },
  ];

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const paginatedRows = React.useMemo(() => {
    const filtered = rows;
    if (rowsPerPage === -1) return filtered;
    return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [rows, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
          <PageTitle title="Supplier Transaction Inquiry" />
          <Breadcrumb
            breadcrumbs={[
              { title: "Inquiries and Reports", href: "/sales/inquiriesandreports" },
              { title: "Supplier Transaction Inquiry" },
            ]}
          />
        </Box>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
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
                    key={s.supplier_id ?? s.id ?? s.debtor_no}
                    value={String(s.supplier_id ?? s.id ?? s.debtor_no)}
                  >
                    {s.name ?? s.supplier_name ?? s.debtor_name ?? s.supp_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
                <MenuItem value="SALES_INVOICE">Sales Invoice</MenuItem>
                <MenuItem value="CREDIT_NOTE">Credit Note</MenuItem>
                <MenuItem value="PAYMENT">Customer Payment</MenuItem>
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

          <Grid item xs={12} sm={6} md={1}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={() =>
                console.log("Search clicked", {
                  selectedSupplier,
                  type,
                  fromDate,
                  toDate,
                })
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
              <TableCell>Currency</TableCell>
              <TableCell>Terms</TableCell>
              <TableCell align="right">Current</TableCell>
              <TableCell align="right">1-30 Days</TableCell>
              <TableCell align="right">31-60 Days</TableCell>
              <TableCell align="right">Over 60 Days</TableCell>
              <TableCell align="right">Total Balance</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>#</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Supplier's Reference</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedRows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.currency}</TableCell>
                <TableCell>{r.terms}</TableCell>
                <TableCell align="right">{r.current.toFixed(2)}</TableCell>
                <TableCell align="right">{r.days_1_30.toFixed(2)}</TableCell>
                <TableCell align="right">{r.days_31_60.toFixed(2)}</TableCell>
                <TableCell align="right">{r.over_60_days.toFixed(2)}</TableCell>
                <TableCell align="right">{r.total_balance.toFixed(2)}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.number}</TableCell>
                <TableCell>{r.reference}</TableCell>
                <TableCell>{r.supplier}</TableCell>
                <TableCell>{r.supplierReference}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell>{r.due_date}</TableCell>
                <TableCell align="right">{r.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={15}
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
