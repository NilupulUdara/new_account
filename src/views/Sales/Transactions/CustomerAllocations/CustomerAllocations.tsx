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
  TableFooter,
  TablePagination,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "../../../../api/Customer/AddCustomerApi";
import { getDebtorTrans } from "../../../../api/DebtorTrans/DebtorTransApi";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

export default function CustomerAllocations() {
  const navigate = useNavigate();

  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: getCustomers });
  const { data: debtorTrans = [] } = useQuery({ queryKey: ["debtorTrans"], queryFn: getDebtorTrans, refetchOnMount: true });
  const [selectedCustomer, setSelectedCustomer] = useState("ALL_CUSTOMERS");
  const [showSettled, setShowSettled] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Filter and map debtor transactions
  const rows = debtorTrans
    .filter((dt: any) => {
      const customerMatch = selectedCustomer === "ALL_CUSTOMERS" || String(dt.debtor_no) === selectedCustomer;
      const settledMatch = showSettled || (dt.alloc || 0) < (dt.ov_amount || 0);
      const typeMatch = dt.trans_type === 11 || dt.trans_type === 12;
      return customerMatch && settledMatch && typeMatch;
    })
    .map((dt: any) => {
      const customer = customers.find((c: any) => c.debtor_no === dt.debtor_no);
      return {
        id: dt.trans_no,
        type: dt.trans_type === 11 ? "Customer Credit Note" : "Customer Payment",
        number: dt.trans_no,
        reference: dt.reference,
        date: dt.tran_date,
        customer: customer?.name || dt.debtor_no,
        currency: customer?.curr_code || "USD",
        total: dt.ov_amount,
        left: (dt.ov_amount || 0) - (dt.alloc || 0),
        trans_type: dt.trans_type,
      };
    });

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
      <Box sx={{ padding: theme.spacing(2), boxShadow: 2, borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <PageTitle title="Customer Allocations" />
          <Breadcrumb breadcrumbs={[{ title: "Home", href: "/home" }, { title: "Customer Allocations" }]} />
        </Box>

        <Stack direction="row" alignItems="center" spacing={1}>
          <FormControl sx={{ minWidth: 250 }} size="small">
            <InputLabel>Select Customer</InputLabel>
            <Select value={selectedCustomer} label="Select Customer" onChange={(e) => setSelectedCustomer(String(e.target.value))}>
              <MenuItem value="ALL_CUSTOMERS">All Customers</MenuItem>
              {(customers || []).map((c: any) => (
                <MenuItem key={c.customer_id ?? c.id ?? c.debtor_no} value={String(c.customer_id ?? c.id ?? c.debtor_no)}>{c.name ?? c.customer_name ?? c.debtor_name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={<Checkbox checked={showSettled} onChange={(e) => setShowSettled(e.target.checked)} />}
            label="Show Settled Items"
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
              <TableCell>Customer</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Left to Allocate</TableCell>
              <TableCell align="center">Actions</TableCell>
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
              paginatedRows.map((r, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{r.number}</TableCell>
                  <TableCell>{r.reference}</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>{r.customer}</TableCell>
                  <TableCell>{r.currency}</TableCell>
                  <TableCell>{r.total}</TableCell>
                  <TableCell>{r.left}</TableCell>
                  <TableCell align="center">
                    <Button variant="outlined" size="small" onClick={() => navigate("/sales/transactions/allocate-customer-payments-credit-notes/view-allocations", { state: { transNo: r.number, transType: r.trans_type } })}>
                      Allocate
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={9}
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
