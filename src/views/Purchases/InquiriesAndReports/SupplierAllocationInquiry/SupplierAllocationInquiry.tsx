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
import { getSuppTrans } from "../../../../api/SuppTrans/SuppTransApi";
import { getTransTypes } from "../../../../api/Reflines/TransTypesApi";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

interface Row {
  id: number;
  type: string;
  typeCode?: number;
  number: string;
  reference: string;
  supplier?: string;
  supplierId?: string | number;
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

  const today = new Date().toISOString().split("T")[0];

  const { data: suppTrans = [] } = useQuery({ queryKey: ["suppTrans"], queryFn: getSuppTrans });
  const { data: transTypes = [] } = useQuery({ queryKey: ["transTypes"], queryFn: getTransTypes });

  // map suppTrans to rows for allocation view
  const rows: Row[] = React.useMemo(() => {
    const mapped = (Array.isArray(suppTrans) ? suppTrans : []).map((t: any) => {
      const typeCode = Number(t.trans_type ?? t.type ?? 0) || 0;
      const transNo = t.trans_no ?? t.transno ?? t.id ?? 0;
      const reference = t.reference ?? t.ref ?? "";
      const supplierId = t.supplier_id ?? t.supplier ?? t.supp_id ?? null;
      const suppObj = (suppliers || []).find((s: any) => String(supplierId) === String(s.supplier_id ?? s.id));
      const supplierName = suppObj?.supp_name ?? suppObj?.name ?? suppObj?.supplier_name ?? "";
      const tranDate = t.trans_date ?? t.transdate ?? t.date ?? "";
      const dueDate = t.due_date ?? t.duedate ?? t.dueDate ?? "";
      const ovAmount = Number(t.ov_amount ?? t.ovamount ?? t.ovAmount ?? 0) || 0;
      const ovDiscount = Number(t.ov_discount ?? t.ovdiscount ?? t.ovDiscount ?? 0) || 0;
      const ovGst = Number(t.ov_gst ?? t.ov_gst ?? t.ovGst ?? 0) || 0;
      const amount = ovAmount + ovDiscount + ovGst;
      const alloc = Number(t.alloc ?? t.allocation ?? 0) || 0;

      let debit = 0;
      let credit = 0;
      if (typeCode === 20) {
        credit = amount;
        debit = 0;
      } else {
        debit = amount;
        credit = 0;
      }

      // show positive values for debit/credit/allocated in the table
      debit = Math.abs(Number(debit || 0));
      credit = Math.abs(Number(credit || 0));
      const allocated = Math.abs(Number(alloc || 0));

      const balance = typeCode === 20 ? (credit - allocated) : (debit - allocated);
      // lookup trans type description
      const tt = (transTypes || []).find((x: any) => Number(x.trans_type ?? x.type ?? x.code) === typeCode);
      const typeDesc = tt?.description ?? tt?.name ?? String(typeCode);

      return {
        id: transNo,
        type: String(typeDesc),
        typeCode: typeCode,
        number: String(transNo),
        reference,
        supplier: supplierName,
        supplierId: supplierId ?? "",
        suppReference: t.supp_reference ?? t.supp_ref ?? t.supplier_reference ?? "",
        date: tranDate ? String(tranDate).split("T")[0] : "",
        dueDate: dueDate ? String(dueDate).split("T")[0] : "",
        debit: Number(debit || 0),
        credit: Number(credit || 0),
        allocated: Number(allocated || 0),
        balance: Number(balance || 0),
      } as Row;
    });

    // Deduplicate mapped rows (keep first occurrence) to avoid duplicates coming from API
    const seenMap = new Set<string>();
    const uniqueMapped: Row[] = [];
    for (const r of mapped) {
      const key = `${r.typeCode ?? ''}|${r.number ?? ''}|${r.reference ?? ''}|${r.supplierId ?? ''}`;
      if (!seenMap.has(key)) {
        seenMap.add(key);
        uniqueMapped.push(r);
      }
    }

    // order: typeCode 20 first, then 21, then 22; keep others after
    const byType20 = uniqueMapped.filter((r) => Number(r.typeCode) === 20);
    const byType21 = uniqueMapped.filter((r) => Number(r.typeCode) === 21);
    const byType22 = uniqueMapped.filter((r) => Number(r.typeCode) === 22);
    const others = uniqueMapped.filter((r) => ![20, 21, 22].includes(Number(r.typeCode)));

    return [...byType20, ...byType21, ...byType22, ...others];
  }, [suppTrans, suppliers, transTypes]);

  // apply filters: supplier, date range, type, and showSettled
  const filteredRows = React.useMemo(() => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    // normalize to start/end of day for inclusive comparison
    if (from) {
      from.setHours(0, 0, 0, 0);
    }
    if (to) {
      to.setHours(23, 59, 59, 999);
    }

    // map type filter keywords to trans_type numeric codes
    const typeMap: Record<string, number | null> = {
      INVOICES: 20,
      PAYMENTS: 22,
      CREDIT_NOTES: 21,
    };
    const typeCodeFilter = type && type !== "ALL_TYPES" ? (typeMap[type] ?? null) : null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const prelim = rows.filter((r) => {
      // supplier filter
      if (selectedSupplier && selectedSupplier !== "ALL_SUPPLIERS") {
        if (!r.supplierId || String(r.supplierId) !== String(selectedSupplier)) return false;
      }

      // date filter (between from and to inclusive) on trans_date (r.date)
      if ((from || to) && r.date) {
        const rd = new Date(r.date);
        if (isNaN(rd.getTime())) return false;
        if (from && rd < from) return false;
        if (to && rd > to) return false;
      }

      // type filter and special categories
      if (type && type !== "ALL_TYPES") {
        if (type === "OVERDUE_INVOICES") {
          if (Number(r.typeCode) !== 20) return false;
          if (!r.dueDate) return false;
          const dd = new Date(r.dueDate);
          if (isNaN(dd.getTime()) || dd >= today) return false;
        } else if (type === "OVERDUE_CREDIT_NOTES") {
          if (Number(r.typeCode) !== 21) return false;
          if (!r.dueDate) return false;
          const dd = new Date(r.dueDate);
          if (isNaN(dd.getTime()) || dd >= today) return false;
        } else if (type === "JOURNAL_ENTRIES") {
          if (!r.type || String(r.type).toLowerCase().indexOf("journal") === -1) return false;
        } else if (typeCodeFilter != null) {
          if (Number(r.typeCode) !== Number(typeCodeFilter)) return false;
        }
      }

      // showSettled: when false hide balance === 0 rows
      if (!showSettled) {
        if (Math.abs(Number(r.balance) || 0) < 0.005) return false;
      }

      return true;
    });

    // Deduplicate rows by a stronger composite key to avoid duplicates from backend/mapping
    const seen = new Set<string>();
    const deduped: Row[] = [];
    for (const r of prelim) {
      const key = `${r.typeCode ?? ''}|${r.number ?? ''}|${r.reference ?? ''}|${r.date ?? ''}|${r.supplierId ?? ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(r);
      }
    }

    return deduped;
  }, [rows, selectedSupplier, fromDate, toDate, type, showSettled]);

  // pagination
  const paginatedRows = React.useMemo(() => {
    if (rowsPerPage === -1) return filteredRows;
    return filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

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
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="supplier-label">Select Supplier</InputLabel>
              <Select
                labelId="supplier-label"
                value={selectedSupplier}
                label="Select Supplier"
                onChange={(e) => {
                  setSelectedSupplier(String(e.target.value));
                  setPage(0);
                }}
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
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(0);
              }}
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
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(0);
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                value={type}
                label="Type"
                onChange={(e) => {
                  setType(String(e.target.value));
                  setPage(0);
                }}
              >
                <MenuItem value="ALL_TYPES">All Types</MenuItem>
                <MenuItem value="INVOICES">Invoices</MenuItem>
                <MenuItem value="OVERDUE_INVOICES">Overdue Invoices</MenuItem>
                <MenuItem value="PAYMENTS">Payments</MenuItem>
                <MenuItem value="CREDIT_NOTES">Credit Notes</MenuItem>
                <MenuItem value="OVERDUE_CREDIT_NOTES">Overdue Credit Notes</MenuItem>
                <MenuItem value="JOURNAL_ENTRIES">Journal Entries</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showSettled}
                  onChange={(e) => {
                    setShowSettled(e.target.checked);
                    setPage(0);
                  }}
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
              <TableCell>Supplier</TableCell>
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
                <TableCell>{r.supplier}</TableCell>
                <TableCell>{r.suppReference}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell>{r.dueDate}</TableCell>
                <TableCell align="right">{r.debit.toFixed(2)}</TableCell>
                <TableCell align="right">{r.credit.toFixed(2)}</TableCell>
                <TableCell align="right">{r.allocated.toFixed(2)}</TableCell>
                <TableCell align="right">{r.balance.toFixed(2)}</TableCell>
                <TableCell align="center">
                  {Number(r.typeCode) === 20 && Number(r.balance) > 0 && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate("/purchase/transactions/payment-to-suppliers", { state: { supplier: r.supplierId, source_id: r.id } })}
                    >
                      Payment
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={11}
                count={filteredRows.length}
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
