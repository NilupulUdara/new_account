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
import { getSuppTrans } from "../../../../api/SuppTrans/SuppTransApi";
import { getTransTypes } from "../../../../api/Reflines/TransTypesApi";
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
  typeCode?: number;
  number: string;
  reference: string;
  supplier: string;
  supplierId?: string;
  supplierReference: string;
  date: string;
  due_date: string;
  amount: number;
  alloc?: number;
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

  // supplier transactions from API
  const { data: suppTrans = [] } = useQuery({ queryKey: ["suppTrans"], queryFn: getSuppTrans });
  const { data: transTypes = [] } = useQuery({ queryKey: ["transTypes"], queryFn: getTransTypes });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const displayRows = React.useMemo(() => {
    // map suppTrans to table rows and sort by type (numeric)
    const mapped = (Array.isArray(suppTrans) ? suppTrans : []).map((t: any) => {
      const transType = Number(t.trans_type ?? t.type ?? t.transType ?? 0) || 0;
      const transNo = t.trans_no ?? t.transno ?? t.transno ?? t.id ?? 0;
      const reference = t.reference ?? t.ref ?? "";
      const supplierId = t.supplier_id ?? t.supplier ?? t.supp_id ?? t.debtor_no ?? null;
      const suppObj = (suppliers || []).find((s: any) => String(supplierId) === String(s.supplier_id ?? s.id ?? s.debtor_no));
      const supplierName = suppObj?.supp_name ?? suppObj?.name ?? suppObj?.supplier_name ?? "";
      const supplierCurr = suppObj?.curr_code ?? suppObj?.currency_abbreviation ?? "";
      const suppRef = t.supp_reference ?? t.supp_ref ?? t.supplier_reference ?? "";
      // lookup trans type description
      const tt = (transTypes || []).find((x: any) => String(x.trans_type ?? x.type ?? x.code) === String(transType));
      const typeDesc = tt?.description ?? tt?.name ?? String(transType);
      const tranDate = t.trans_date ?? t.transdate ?? t.date ?? "";
      const dueDate = t.due_date ?? t.duedate ?? t.dueDate ?? "";
      const ovAmount = Number(t.ov_amount ?? t.ovamount ?? t.ovAmount ?? 0) || 0;
      const ovDiscount = Number(t.ov_discount ?? t.ovdiscount ?? t.ovDiscount ?? 0) || 0;
      const ovGst = Number(t.ov_gst ?? t.ov_gst ?? t.ovGst ?? 0) || 0;
      const amount = ovAmount + ovDiscount + ovGst;
      const alloc = Number(t.alloc ?? t.allocation ?? t.alloc_amount ?? t.amount_alloc ?? 0) || 0;

      return {
        id: transNo,
        type: typeDesc,
        typeCode: transType,
        number: transNo,
        reference,
        supplier: supplierName,
        supplierId: supplierId ? String(supplierId) : "",
        supplierReference: suppRef,
        date: tranDate,
        due_date: dueDate,
        currency: supplierCurr,
        amount,
        alloc,
      } as Row;
    });

    // apply supplier filter
    const filteredBySupplier = mapped.filter((r) => {
      if (selectedSupplier && selectedSupplier !== "ALL_SUPPLIERS") {
        return String(r.supplierId || "") === String(selectedSupplier);
      }
      return true;
    });

    // apply date range filter (if provided)
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const filteredByDate = filteredBySupplier.filter((r) => {
      if (!from && !to) return true;
      if (!r.date) return false;
      const rd = new Date(r.date);
      if (isNaN(rd.getTime())) return false;
      if (from && rd < from) return false;
      if (to && rd > to) return false;
      return true;
    });

    // apply type filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredByType = filteredByDate.filter((r) => {
      if (!type || type === "ALL_TYPES") return true;
      // special categories
      if (type === "UNSETTLED") {
        // consider unsettled as non-payment transactions with non-zero amount
        return Number(r.amount) !== 0 && Number(r.typeCode) !== 22;
      }
      if (type === "OVERDUE_CREDIT_NOTES") {
        return Number(r.typeCode) === 21 && r.due_date && new Date(r.due_date) < today;
      }
      if (type === "JOURNAL_ENTRIES") {
        return String(r.type).toLowerCase().includes("journal");
      }
      // numeric type codes (e.g., "20", "21", "22", "25")
      const asNum = Number(type);
      if (!isNaN(asNum)) return Number(r.typeCode) === asNum;
      return true;
    });

    // sort by type numeric ascending using typeCode
    filteredByType.sort((a: any, b: any) => (Number(a.typeCode) || 0) - (Number(b.typeCode) || 0));
    return filteredByType;
  }, [suppTrans, suppliers, transTypes, selectedSupplier, fromDate, toDate, type]);

  const paginatedRows = React.useMemo(() => {
    const filtered = displayRows;
    if (rowsPerPage === -1) return filtered;
    return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [displayRows, page, rowsPerPage]);

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
          <Grid item xs={12} sm={6} md={2}>
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

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                value={type}
                label="Type"
                onChange={(e) => setType(String(e.target.value))}
              >
                <MenuItem value="ALL_TYPES">All Types</MenuItem>
                <MenuItem value="25">GRNs</MenuItem>
                <MenuItem value="20">Invoices</MenuItem>
                <MenuItem value="UNSETTLED">Unsettled Transactions</MenuItem>
                <MenuItem value="22">Payments</MenuItem>
                <MenuItem value="21">Credit Notes</MenuItem>
                <MenuItem value="OVERDUE_CREDIT_NOTES">Overdue Credit Notes</MenuItem>
                <MenuItem value="JOURNAL_ENTRIES">Journal Entries</MenuItem>
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
              <TableCell>Type</TableCell>
              <TableCell>#</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Supplier's Reference</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">GL</TableCell>
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
                <TableCell>{r.supplierReference}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell>{r.due_date}</TableCell>
                <TableCell>{r.currency}</TableCell>
                <TableCell align="right">{r.amount.toFixed(2)}</TableCell>
                <TableCell align="center">
                  <Button variant="outlined" size="small" onClick={() => navigate("/bankingandgeneralledger/transactions/gl-postings", { state: { id: r.id } })}>
                    GL
                  </Button>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {(Number(r.typeCode) === 20 || Number(r.typeCode) === 21) && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          const supplierId = r.supplierId ? (isNaN(Number(r.supplierId)) ? r.supplierId : Number(r.supplierId)) : undefined;
                          if (Number(r.typeCode) === 20) {
                            navigate("/purchase/transactions/supplier-invoice", { state: { supplier: supplierId } });
                          } else if (Number(r.typeCode) === 21) {
                            navigate("/purchase/transactions/supplier-credit-notes", { state: { supplier: supplierId } });
                          }
                        }}
                      >
                        Edit
                      </Button>
                    )}
                    {(Number(r.typeCode) === 20 && Number(r.amount) > (Number(r.alloc) || 0)) && (
                      <Button variant="outlined" size="small" onClick={() => navigate("/purchase/transactions/supplier-credit/create", { state: { id: r.id, supplier: r.supplierId } })}>
                        Credit
                      </Button>
                    )}
                    {(Number(r.typeCode) === 21 || Number(r.typeCode) === 22) && (
                      <Button variant="outlined" size="small">Print</Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={11}
                count={displayRows.length}
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
