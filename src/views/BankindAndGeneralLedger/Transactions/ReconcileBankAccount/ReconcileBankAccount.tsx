import React, { useState } from "react";
import {
  Box,
  Button,
  Stack,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  Checkbox,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBankAccounts } from "../../../../api/BankAccount/BankAccountApi";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

interface TransactionRow {
  id: number;
  type: string;
  number: string;
  reference: string;
  date: string;
  debit: string;
  credit: string;
  personItem: string;
  memo: string;
  selected: boolean;
}

export default function ReconcileBankAccount() {
  const navigate = useNavigate();

  // Fetch bank accounts for Account dropdown
  const { data: bankAccounts = [] } = useQuery({
    queryKey: ["bankAccounts"],
    queryFn: getBankAccounts,
  });

  // Form states
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedBankStatement, setSelectedBankStatement] = useState("");

  // Table data
  const [reconcileData, setReconcileData] = useState({
    reconcileDate: new Date().toISOString().split("T")[0],
    beginningBalance: "",
    endingBalance: "",
    accountTotal: "0.00",
    reconciledAmount: "0.00",
    difference: "0.00",
  });

  // Transaction table pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Transaction table data
  const [transactionRows, setTransactionRows] = useState<TransactionRow[]>([
    {
      id: 1,
      type: "Payment",
      number: "PAY-001",
      reference: "REF-001",
      date: new Date().toISOString().split("T")[0],
      debit: "500.00",
      credit: "0.00",
      personItem: "Customer A",
      memo: "Payment received",
      selected: false,
    },
    {
      id: 2,
      type: "Deposit",
      number: "DEP-001",
      reference: "REF-002",
      date: new Date().toISOString().split("T")[0],
      debit: "0.00",
      credit: "750.00",
      personItem: "Supplier B",
      memo: "Deposit made",
      selected: false,
    },
    {
      id: 3,
      type: "Transfer",
      number: "TRF-001",
      reference: "REF-003",
      date: new Date().toISOString().split("T")[0],
      debit: "200.00",
      credit: "0.00",
      personItem: "Internal Transfer",
      memo: "Bank transfer",
      selected: false,
    },
    {
      id: 4,
      type: "Payment",
      number: "PAY-002",
      reference: "REF-004",
      date: new Date().toISOString().split("T")[0],
      debit: "300.00",
      credit: "0.00",
      personItem: "Customer C",
      memo: "Invoice payment",
      selected: false,
    },
    {
      id: 5,
      type: "Deposit",
      number: "DEP-002",
      reference: "REF-005",
      date: new Date().toISOString().split("T")[0],
      debit: "0.00",
      credit: "450.00",
      personItem: "Supplier D",
      memo: "Advance payment",
      selected: false,
    },
    {
      id: 6,
      type: "Fee",
      number: "FEE-001",
      reference: "REF-006",
      date: new Date().toISOString().split("T")[0],
      debit: "25.00",
      credit: "0.00",
      personItem: "Bank Fee",
      memo: "Monthly service fee",
      selected: false,
    },
  ]);

  // Mock bank statements data (replace with actual API when available)
  const bankStatements = [
    { id: "1", name: "Statement 001 - Jan 2024" },
    { id: "2", name: "Statement 002 - Feb 2024" },
    { id: "3", name: "Statement 003 - Mar 2024" },
    { id: "4", name: "Statement 004 - Apr 2024" },
  ];

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Reconcile Bank Account" },
  ];

  // Get selected bank account details
  const selectedBankAccount = bankAccounts.find((acc: any) => String(acc.id) === selectedAccount);

  // Handle checkbox change
  const handleCheckboxChange = (id: number) => {
    setTransactionRows(prev =>
      prev.map(row =>
        row.id === id ? { ...row, selected: !row.selected } : row
      )
    );
  };

  // Handle pagination
  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Paginated rows
  const paginatedRows = React.useMemo(() => {
    if (rowsPerPage === -1) return transactionRows;
    return transactionRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [transactionRows, page, rowsPerPage]);

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
          <PageTitle title="Reconcile Bank Account" />
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

      {/* Form Fields */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Account"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              size="small"
            >
              <MenuItem value="">Select Account</MenuItem>
              {(bankAccounts as any[]).map((acc: any) => (
                <MenuItem key={acc.id} value={String(acc.id)}>
                  {acc.bank_account_name ?? (`${acc.bank_name || ""} - ${acc.bank_account_number || ""}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Bank Statement"
              value={selectedBankStatement}
              onChange={(e) => setSelectedBankStatement(e.target.value)}
              size="small"
            >
              <MenuItem value="">Select Bank Statement</MenuItem>
              {bankStatements.map((statement) => (
                <MenuItem key={statement.id} value={statement.id}>
                  {statement.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Reconciliation Table */}
      <TableContainer component={Paper} sx={{ p: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>Reconcile Date</TableCell>
              <TableCell>Beginning Balance</TableCell>
              <TableCell>Ending Balance</TableCell>
              <TableCell>Account Total</TableCell>
              <TableCell>Reconcilled Amount</TableCell>
              <TableCell>Difference</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <TextField
                  type="date"
                  size="small"
                  value={reconcileData.reconcileDate}
                  onChange={(e) => setReconcileData(prev => ({ ...prev, reconcileDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  value={reconcileData.beginningBalance}
                  onChange={(e) => setReconcileData(prev => ({ ...prev, beginningBalance: e.target.value }))}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  value={reconcileData.endingBalance}
                  onChange={(e) => setReconcileData(prev => ({ ...prev, endingBalance: e.target.value }))}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  value={reconcileData.accountTotal}
                  InputProps={{ readOnly: true }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  value={reconcileData.reconciledAmount}
                  InputProps={{ readOnly: true }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  value={reconcileData.difference}
                  InputProps={{ readOnly: true }}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Bank Account Info */}
      {selectedBankAccount && (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 1, textAlign: 'center' }}>
            {selectedBankAccount.bank_account_name || ""}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Currency: {selectedBankAccount.bank_curr_code}
          </Typography>
        </Paper>
      )}

      {/* Transaction Table */}
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
              <TableCell>Person/Item</TableCell>
              <TableCell>Memo</TableCell>
              <TableCell align="center">Action</TableCell>
              <TableCell align="center">X</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedRows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.number}</TableCell>
                <TableCell>{row.reference}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.debit}</TableCell>
                <TableCell>{row.credit}</TableCell>
                <TableCell>{row.personItem}</TableCell>
                <TableCell>{row.memo}</TableCell>
                <TableCell align="center">
                  <Button variant="contained" size="small" onClick={() => console.log("GL", row.number)}>
                    GL
                  </Button>
                </TableCell>
                <TableCell align="center">
                  <Checkbox
                    checked={row.selected}
                    onChange={() => handleCheckboxChange(row.id)}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={10}
                count={transactionRows.length}
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

      {/* Reconcile All Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, p: 1 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => console.log("Reconcile All")}
        >
          Reconcile All
        </Button>
      </Box>
    </Stack>
  );
}
