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
  TextField,
  MenuItem,
  Grid,
  useMediaQuery,
  Theme,
  TableFooter,
  TablePagination,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBankAccounts } from "../../../../api/BankAccount/BankAccountApi";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

interface Row {
  id: number;
  type: string;
  number: string;
  reference: string;
  date: string;
  debit: string;
  credit: string;
  balance: string;
  personItem: string;
  memo: string;
}

export default function BankAccountInquiry() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch bank accounts for Account dropdown
  const { data: bankAccounts = [] } = useQuery({
    queryKey: ["bankAccounts"],
    queryFn: getBankAccounts,
  });

  // Search form state
  const [selectedAccount, setSelectedAccount] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // dummy rows
  const today = new Date().toISOString().split("T")[0];
  const rows: Row[] = [
    {
      id: 1,
      type: "Payment",
      number: "PAY-001",
      reference: "REF-001",
      date: today,
      debit: "1500.00",
      credit: "",
      balance: "8500.00",
      personItem: "Acme Corporation",
      memo: "Invoice payment"
    },
    {
      id: 2,
      type: "Deposit",
      number: "DEP-001",
      reference: "REF-002",
      date: today,
      debit: "",
      credit: "2500.00",
      balance: "11000.00",
      personItem: "Beta Ltd",
      memo: "Customer deposit"
    },
    {
      id: 3,
      type: "Transfer",
      number: "TRF-001",
      reference: "REF-003",
      date: today,
      debit: "500.00",
      credit: "",
      balance: "10500.00",
      personItem: "Internal Transfer",
      memo: "Bank transfer"
    },
  ];

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
      <Box sx={{ padding: theme.spacing(2), boxShadow: 2, borderRadius: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <Box>
          <PageTitle title="Bank Account Inquiry" />
          <Breadcrumb breadcrumbs={[{ title: "Home", href: "/home" }, { title: "Bank Account Inquiry" }]} />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              label="Account"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              size="small"
            >
              <MenuItem value="">Select account</MenuItem>
              {(bankAccounts as any[]).map((acc: any) => (
                <MenuItem key={acc.id} value={String(acc.id)}>
                  {acc.bank_account_name ?? (`${acc.bank_name || ""} - ${acc.bank_account_number || ""}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="From"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="To"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              onClick={() => console.log("Bank Account Inquiry search", { selectedAccount, fromDate, toDate })}
              sx={{ height: '40px', width: '100%' }}
            >
              Show
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ p: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>#</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Debit</TableCell>
              <TableCell>Credit</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>Person/Item</TableCell>
              <TableCell>Memo</TableCell>
              <TableCell align="center">GL</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {/* Opening Balance Row */}
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell colSpan={4} sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0" }}>
                Opening Balance - {fromDate || "From Date"}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>
                0.00
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>

            {paginatedRows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.number}</TableCell>
                <TableCell>{r.reference}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell>{r.debit}</TableCell>
                <TableCell>{r.credit}</TableCell>
                <TableCell>{r.balance}</TableCell>
                <TableCell>{r.personItem}</TableCell>
                <TableCell>{r.memo}</TableCell>
                <TableCell align="center">
                  <Button variant="contained" size="small" onClick={() => console.log("GL view for", r.number)}>
                    GL
                  </Button>
                </TableCell>
                <TableCell align="center">
                  <Button variant="outlined" size="small" onClick={() => console.log("Edit", r.number)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {/* Ending Balance Row */}
            <TableRow sx={{ backgroundColor: "#f5f5f5", borderTop: "2px solid #e0e0e0" }}>
              <TableCell colSpan={4} sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0" }}>
                Ending Balance - {toDate || "To Date"}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>
                {rows.reduce((sum, r) => sum + (parseFloat(r.debit) || 0), 0).toFixed(2)}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>
                {rows.reduce((sum, r) => sum + (parseFloat(r.credit) || 0), 0).toFixed(2)}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>
                {(rows.reduce((sum, r) => sum + (parseFloat(r.debit) || 0), 0) - rows.reduce((sum, r) => sum + (parseFloat(r.credit) || 0), 0)).toFixed(2)}
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
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
