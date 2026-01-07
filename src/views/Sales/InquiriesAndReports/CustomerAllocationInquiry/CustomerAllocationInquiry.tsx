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
import { getCustomers } from "../../../../api/Customer/AddCustomerApi";
import { getCustAllocations } from "../../../../api/CustAllocation/CustAllocationApi";
import { getDebtorTrans } from "../../../../api/DebtorTrans/DebtorTransApi";
import { getPaymentTerms } from "../../../../api/PaymentTerm/PaymentTermApi";
import { getBranches } from "../../../../api/CustomerBranch/CustomerBranchApi";
import { getTransTypes } from "../../../../api/Reflines/TransTypesApi";
import { getFiscalYears } from "../../../../api/FiscalYear/FiscalYearApi";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

interface Row {
  id: number;
  type: string;
  number: string;
  reference: string;
  order: string;
  date: string;
  dueDate: string;
  debit: number;
  credit: number;
  allocated: number;
  balance: number;
  trans_type: string;
}

export default function CustomerAllocationInquiry() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  // pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // filters
  const [selectedCustomer, setSelectedCustomer] = useState("ALL_CUSTOMERS");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [type, setType] = useState("ALL_TYPES");
  const [showSettled, setShowSettled] = useState(false);

  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: getCustomers });
  const { data: custAllocations = [] } = useQuery({ queryKey: ["custAllocations"], queryFn: getCustAllocations });
  const { data: debtorTrans = [] } = useQuery({ queryKey: ["debtorTrans"], queryFn: getDebtorTrans });
  const { data: paymentTerms = [] } = useQuery({ queryKey: ["paymentTerms"], queryFn: getPaymentTerms });
  const { data: branches = [] } = useQuery({ queryKey: ["branches"], queryFn: () => getBranches() });
  const { data: transTypes = [] } = useQuery({ queryKey: ["transTypes"], queryFn: getTransTypes });
  const { data: fiscalYears = [] } = useQuery({ queryKey: ["fiscalYears"], queryFn: getFiscalYears });

  // Map debtor trans to table rows
  const rows: Row[] = (debtorTrans || []).map((dt: any, idx: number) => {
    const total = (dt.ov_amount || 0) + (dt.ov_gst || 0) + (dt.ov_freight || 0) + (dt.ov_freight_tax || 0) + (dt.ov_discount || 0);
    const allocatedTotal = dt.alloc || 0;
    
    // Resolve transaction type
    const transTypeObj = transTypes.find((tt: any) => String(tt.trans_type) === String(dt.trans_type));
    const transTypeLabel = transTypeObj ? (transTypeObj.description || transTypeObj.name || String(dt.trans_type)) : String(dt.trans_type);
    
    return {
      id: dt.id ?? idx,
      type: transTypeLabel,
      number: String(dt.trans_no || ""),
      reference: dt.reference || "",
      order: dt.order_no || "",
      date: dt.tran_date ? String(dt.tran_date).split(" ")[0] : "",
      dueDate: dt.due_date ? String(dt.due_date).split(" ")[0] : "",
      debit: (String(dt.trans_type) === "10" || String(dt.trans_type) === "13") ? total : 0,
      credit: (String(dt.trans_type) === "12" || String(dt.trans_type) === "11") ? total : 0,
      allocated: allocatedTotal,
      balance: total - allocatedTotal,
      trans_type: String(dt.trans_type || ""),
    } as Row;
  });

  // pagination
  const { filteredRows, paginatedRows } = React.useMemo(() => {
    let filtered = rows;
    if (selectedCustomer && selectedCustomer !== "ALL_CUSTOMERS") {
      filtered = filtered.filter((r) => {
        // Find debtor trans to match customer
        const debtorTransFrom = debtorTrans.find((dt: any) => String(dt.trans_no) === String(r.number));
        return String(debtorTransFrom?.debtor_no ?? "") === String(selectedCustomer);
      });
    }
    if (type && type !== "ALL_TYPES") {
      // If type is numeric, match against the trans_type directly from the row
      const isNumeric = /^\d+$/.test(String(type));
      if (isNumeric) {
        filtered = filtered.filter((r) => String(r.trans_type ?? "") === String(type));
      } else {
        // For non-numeric, match by type label
        filtered = filtered.filter((r) => String(r.type ?? "").toUpperCase().includes(type.toUpperCase()));
      }
    }
    // date range filtering if provided
    if (fromDate) {
      filtered = filtered.filter((r) => r.date ? String(r.date) >= String(fromDate) : false);
    }
    if (toDate) {
      filtered = filtered.filter((r) => r.date ? String(r.date) <= String(toDate) : false);
    }
    // Show settled filtering
    filtered = filtered.filter((r) => {
      const debtorTransFrom = debtorTrans.find((dt: any) => String(dt.trans_no) === String(r.number));
      if (debtorTransFrom) {
        const total = (debtorTransFrom.ov_amount || 0) + (debtorTransFrom.ov_gst || 0) + (debtorTransFrom.ov_freight || 0) + (debtorTransFrom.ov_freight_tax || 0) + (debtorTransFrom.ov_discount || 0);
        const isSettled = total === (debtorTransFrom.alloc || 0);
        return showSettled ? isSettled : !isSettled;
      }
      return !showSettled; // If no debtor trans, treat as unsettled
    });

    const paginated = rowsPerPage === -1 ? filtered : filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    return { filteredRows: filtered, paginatedRows: paginated };
  }, [rows, page, rowsPerPage, selectedCustomer, type, fromDate, toDate, showSettled, debtorTrans]);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Reset page if out of range
  React.useEffect(() => {
    const maxPage = Math.ceil(filteredRows.length / rowsPerPage) - 1;
    if (page > maxPage) {
      setPage(Math.max(0, maxPage));
    }
  }, [filteredRows.length, rowsPerPage, page]);

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
          <PageTitle title="Customer Allocation Inquiry" />
          <Breadcrumb
            breadcrumbs={[
              { title: "Inquiries and Reports", href: "/sales/inquiriesandreports" },
              { title: "Customer Allocation Inquiry" },
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
                <MenuItem value="0">Journal Entries</MenuItem>             </Select>
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
                console.log("Search clicked", { selectedCustomer, fromDate, toDate, type, showSettled })
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
              <TableCell>Order</TableCell>
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
                <TableCell>{r.order}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell>{r.dueDate}</TableCell>
                <TableCell align="right">{r.debit.toFixed(2)}</TableCell>
                <TableCell align="right">{r.credit.toFixed(2)}</TableCell>
                <TableCell align="right">{r.allocated.toFixed(2)}</TableCell>
                <TableCell align="right">{r.balance.toFixed(2)}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {(() => {
                      const debtorTransFrom = debtorTrans.find((dt: any) => String(dt.trans_no) === String(r.number));
                      if (debtorTransFrom) {
                        const total = (debtorTransFrom.ov_amount || 0) + (debtorTransFrom.ov_gst || 0) + (debtorTransFrom.ov_freight || 0) + (debtorTransFrom.ov_freight_tax || 0) + (debtorTransFrom.ov_discount || 0);
                        const isSettled = total === (debtorTransFrom.alloc || 0);
                        if (!isSettled || String(debtorTransFrom.trans_type) === "12") {
                          const buttonText = String(debtorTransFrom.trans_type) === "10" ? "Payment" : "Allocation";
                          const onClickHandler = buttonText === "Payment" 
                            ? () => navigate('/sales/transactions/customer-payments', { state: { transNo: r.number, transType: debtorTransFrom.trans_type } })
                            : () => navigate('/sales/transactions/allocate-customer-payments-credit-notes/view-allocations', { state: { transNo: r.number, transType: debtorTransFrom.trans_type } });
                          return <Button variant="outlined" size="small" onClick={onClickHandler}>{buttonText}</Button>;
                        }
                      }
                      return null;
                    })()}
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
