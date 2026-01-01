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
import { getDebtorTrans } from "../../../../api/DebtorTrans/DebtorTransApi";
import { getCustomers } from "../../../../api/Customer/AddCustomerApi";
import { getPaymentTerms } from "../../../../api/PaymentTerm/PaymentTermApi";
import { getBranches } from "../../../../api/CustomerBranch/CustomerBranchApi";
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
  trans_type_id?: string | number;
  number: string;
  order: string;
  reference: string;
  date: string;
  due_date: string;
  branch: string;
  amount: number;
  debtor_no?: string | number;
  branch_code?: string | number;
}

export default function CustomerTransactionInquiry() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  // Filters
  const [selectedCustomer, setSelectedCustomer] = useState("ALL_CUSTOMERS");
  const [type, setType] = useState("ALL_TYPES");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showZeroValues, setShowZeroValues] = useState(false);

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  const { data: paymentTerms = [] } = useQuery({ queryKey: ["paymentTerms"], queryFn: getPaymentTerms });
  const { data: branches = [] } = useQuery({ queryKey: ["branches"], queryFn: () => getBranches() });
  const { data: transTypes = [] } = useQuery({ queryKey: ["transTypes"], queryFn: getTransTypes });

  // Fetch debtor transactions
  const { data: debtorTrans = [] } = useQuery({ queryKey: ["debtorTrans"], queryFn: getDebtorTrans });

  // Map debtor_trans records to table rows, pulling currency and payment terms from debtor master when available
  const rows: Row[] = (debtorTrans || []).map((t: any, idx: number) => {
    const customer = (customers || []).find((c: any) => String(c.debtor_no) === String(t.debtor_no) || String(c.debtor_no) === String(t.debtor_no));
    // Resolve payment term description from paymentTerms lookup
    const paymentTermId = customer?.payment_terms ?? t.payment_terms;
    const paymentTermObj = (paymentTerms || []).find((pt: any) => String(pt.terms_indicator) === String(paymentTermId));
    const paymentTermLabel = paymentTermObj ? (paymentTermObj.description || paymentTermObj.terms_indicator) : (paymentTermId ? String(paymentTermId) : "");
    const branchObj = (branches || []).find((b: any) => String(b.branch_code) === String(t.branch_code) && String(b.debtor_no ?? "") === String(t.debtor_no ?? "")) || (branches || []).find((b: any) => String(b.branch_ref ?? b.branch_code ?? "") === String(t.branch_code ?? ""));
    // Resolve transaction type description
    const transTypeObj = (transTypes || []).find((tt: any) => String(tt.trans_type) === String(t.trans_type));
    const transTypeLabel = transTypeObj ? (transTypeObj.description || transTypeObj.name || String(t.trans_type)) : String(t.trans_type);
      return {
      id: t.trans_no ?? t.id ?? idx,
      debtor_no: t.debtor_no ?? "",
      trans_type_id: t.trans_type ?? "",
      currency: customer?.curr_code ?? t.curr_code ?? "",
      terms: paymentTermLabel,
      current: t.ov_amount ?? 0,
      days_1_30: 0,
      days_31_60: 0,
      over_60_days: 0,
      total_balance: t.ov_amount ?? 0,
      type: transTypeLabel,
      number: t.trans_no ? String(t.trans_no) : "",
      order: t.order_no ? String(t.order_no) : "",
      reference: t.reference ?? "",
      date: t.tran_date ? String(t.tran_date).split(" ")[0] : "",
      due_date: t.due_date ? String(t.due_date).split(" ")[0] : "",
      branch: branchObj?.br_name ?? String(t.branch_code ?? ""),
      amount: Number(t.ov_amount ?? 0),
      branch_code: t.branch_code,
    } as Row;
  });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { filteredRows, paginatedRows } = React.useMemo(() => {
    let filtered = showZeroValues ? rows : rows.filter((r) => r.total_balance !== 0);
    if (selectedCustomer && selectedCustomer !== "ALL_CUSTOMERS") {
      filtered = filtered.filter((r) => String(r.debtor_no ?? "") === String(selectedCustomer));
    }
    if (type && type !== "ALL_TYPES") {
      // If type is numeric, match against the trans_type id directly
      const isNumeric = /^\d+$/.test(String(type));
      if (isNumeric) {
        filtered = filtered.filter((r) => String(r.trans_type_id ?? "") === String(type));
      } else {
        const typeMatchers: Record<string, string[]> = {
          SALES_INVOICES: ["INVOICE"],
          UNSETTLE_TRANSACTIONS: ["UNSETTLE", "UNSETTLED"],
          PAYMENTS: ["PAYMENT"],
          CREDIT_NOTES: ["CREDIT"],
          DELIVERY_NOTES: ["DELIVERY"],
          JOURNAL_ENTRIES: ["JOURNAL"],
        };
        const keywords = typeMatchers[type] ?? [type];
        filtered = filtered.filter((r) => {
          const label = String(r.type ?? "").toUpperCase();
          return keywords.some((k) => label.includes(k.toUpperCase()));
        });
      }
    }
    // date range filtering if provided
    if (fromDate) {
      filtered = filtered.filter((r) => r.date ? String(r.date) >= String(fromDate) : false);
    }
    if (toDate) {
      filtered = filtered.filter((r) => r.date ? String(r.date) <= String(toDate) : false);
    }

    const paginated = rowsPerPage === -1 ? filtered : filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    return { filteredRows: filtered, paginatedRows: paginated };
  }, [rows, page, rowsPerPage, showZeroValues, selectedCustomer, type, fromDate, toDate]);

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
          <PageTitle title="Customer Transaction Inquiry" />
          <Breadcrumb
            breadcrumbs={[
              { title: "Inquiries and Reports", href: "/sales/inquiriesandreports" },
              { title: "Customer Transaction Inquiry" },
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
              <InputLabel id="customer-label">Select Customer</InputLabel>
              <Select
                labelId="customer-label"
                value={selectedCustomer}
                label="Select Customer"
                onChange={(e) => {
                  setSelectedCustomer(String(e.target.value));
                  setPage(0);
                }}
              >
                <MenuItem value="ALL_CUSTOMERS">All Customers</MenuItem>
                {(customers || []).map((c: any) => (
                  <MenuItem
                    key={c.customer_id ?? c.id ?? c.debtor_no}
                    value={String(c.debtor_no ?? c.customer_id ?? c.id ?? "")}
                  >
                    {c.name ?? c.customer_name ?? c.debtor_name}
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
                onChange={(e) => {
                  setType(String(e.target.value));
                  setPage(0);
                }}
              >
                <MenuItem value="ALL_TYPES">All Types</MenuItem>
                <MenuItem value="10">Sales Invoices</MenuItem>
                <MenuItem value="UNSETTLE_TRANSACTIONS">Unsettle Transactions</MenuItem>
                <MenuItem value="12">Payments</MenuItem>
                <MenuItem value="11">Credit Notes</MenuItem>
                <MenuItem value="13">Delivery Notes</MenuItem>
                <MenuItem value="0">Journal Entries</MenuItem>
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

          <Grid item xs={12} sm={6} md={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showZeroValues}
                  onChange={(e) => setShowZeroValues(e.target.checked)}
                  color="primary"
                />
              }
              label="Zero Values"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={1}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={() =>
                console.log("Search clicked", {
                  selectedCustomer,
                  type,
                  fromDate,
                  toDate,
                  showZeroValues,
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
              <TableCell>Order</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Branch</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedRows.map((r, idx) => (
              <TableRow key={`${r.id}-${idx}`} hover>
                <TableCell>{r.currency}</TableCell>
                <TableCell>{r.terms}</TableCell>
                <TableCell align="right">{r.current.toFixed(2)}</TableCell>
                <TableCell align="right">{r.days_1_30.toFixed(2)}</TableCell>
                <TableCell align="right">{r.days_31_60.toFixed(2)}</TableCell>
                <TableCell align="right">{r.over_60_days.toFixed(2)}</TableCell>
                <TableCell align="right">{r.total_balance.toFixed(2)}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.number}</TableCell>
                <TableCell>{r.order}</TableCell>
                <TableCell>{r.reference}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell>{r.due_date}</TableCell>
                <TableCell>{r.branch}</TableCell>
                <TableCell align="right">{r.amount.toFixed(2)}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button variant="outlined" size="small" onClick={() => navigate("/bankingandgeneralledger/transactions/gl-postings", { state: { id: r.id } })}>GL</Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        const t = String(r.trans_type_id);
                        // Sales Invoice -> open invoice update in inquiries
                        if (t === "10") {
                          navigate(
                            "/sales/inquiriesandreports/customer-transaction-inquiry/update-customer-invoice/",
                            { state: { trans_no: r.number, reference: r.reference, date: r.date, debtor_no: r.debtor_no } }
                          );
                        }
                        // Credit Note -> open customer credit edit under transactions
                        else if (t === "11") {
                          navigate(
                            "/sales/transactions/update-customer-credit-notes/",
                            { state: { trans_no: r.number, reference: r.reference, date: r.date, debtor_no: r.debtor_no } }
                          );
                        }
                        // Payment -> navigate to customer payments entry
                        else if (t === "12") {
                          navigate(
                            "/sales/transactions/customer-payments",
                            { state: { trans_no: r.number, reference: r.reference, date: r.date, debtor_no: r.debtor_no } }
                          );
                        }
                        // Delivery Note -> open customer delivery update
                        else if (t === "13") {
                          navigate(
                            "/sales/transactions/update-customer-delivery/",
                            { state: { trans_no: r.number, reference: r.reference, date: r.date, debtor_no: r.debtor_no } }
                          );
                        }
                      }}
                    >
                      Edit
                    </Button>
                    {String(r.trans_type_id) === "13" && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate("/sales/transactions/direct-delivery/customer-invoice", { state: { trans_no: r.number, reference: r.reference, date: r.date, debtor_no: r.debtor_no } })}
                      >
                        Invoice
                      </Button>
                    )}
                    {String(r.trans_type_id) === "10" && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                            console.log('Credit this clicked', r);
                            navigate("/sales/transactions/credit-invoice/", { state: { trans_no: r.number, reference: r.reference, date: r.date, debtor_no: r.debtor_no, branch_code: r.branch_code } });
                        }}
                      >
                        Credit this
                      </Button>
                    )}
                    <Button variant="outlined" size="small">Print</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={16}
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
