import React, { useState, useMemo } from "react";
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
  ListSubheader,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

interface Row {
  id: number;
  type: string;
  number: string;
  reference: string;
  date: string;
  account: string;
  dimension: string;
  personItem: string;
  debit: string;
  credit: string;
  memo: string;
}

export default function GLInquiry() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch GL accounts for Account dropdown
  const { data: chartMasters = [] } = useQuery({
    queryKey: ["chartMasters"],
    queryFn: () => import("../../../../api/GLAccounts/ChartMasterApi").then(m => m.getChartMasters()),
  });

  // Map of account type ids to descriptive text (used to group the dropdown)
  const accountTypeMap: Record<string, string> = {
    "1": "Current Assets",
    "2": "Inventory Assets",
    "3": "Capital Assets",
    "4": "Current Liabilities",
    "5": "Long Term Liabilities",
    "6": "Share Capital",
    "7": "Retained Earnings",
    "8": "Sales Revenue",
    "9": "Other Revenue",
    "10": "Cost of Good Sold",
    "11": "Payroll Expenses",
    "12": "General and Adminitrative Expenses",
  };

  // Group chart masters by descriptive account type for the select dropdown
  const groupedChartMasters = useMemo(() => {
    const groups: Record<string, any[]> = {};
    (chartMasters as any[]).forEach((acc: any) => {
      const typeText = accountTypeMap[String(acc.account_type)] || "Unknown";
      if (!groups[typeText]) groups[typeText] = [];
      groups[typeText].push(acc);
    });
    // sort each group's accounts by account_code for stable order
    Object.values(groups).forEach((arr) => arr.sort((a: any, b: any) => (String(a.account_code || "")).localeCompare(String(b.account_code || ""))));
    return groups;
  }, [chartMasters]);

  // Search form state
  const [selectedAccount, setSelectedAccount] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dimension, setDimension] = useState("");
  const [memo, setMemo] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [openAccountSelect, setOpenAccountSelect] = useState(false);

  // dummy rows
  const today = new Date().toISOString().split("T")[0];
  const rows: Row[] = [
    {
      id: 1,
      type: "Payment",
      number: "PAY-001",
      reference: "REF-001",
      date: today,
      account: "1000 - Cash",
      dimension: "Main",
      personItem: "Acme Corporation",
      debit: "1500.00",
      credit: "",
      memo: "Invoice payment"
    },
    {
      id: 2,
      type: "Deposit",
      number: "DEP-001",
      reference: "REF-002",
      date: today,
      account: "2000 - Accounts Receivable",
      dimension: "Sales",
      personItem: "Beta Ltd",
      debit: "",
      credit: "2500.00",
      memo: "Customer deposit"
    },
    {
      id: 3,
      type: "Transfer",
      number: "TRF-001",
      reference: "REF-003",
      date: today,
      account: "3000 - Inventory",
      dimension: "Warehouse",
      personItem: "Internal Transfer",
      debit: "500.00",
      credit: "",
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
          <PageTitle title="General Ledger Inquiry" />
          <Breadcrumb breadcrumbs={[{ title: "Home", href: "/home" }, { title: "General Ledger Inquiry" }]} />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          {/* First row */}
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              label="Account"
              value={selectedAccount}
              size="small"
              onChange={(e) => {
                setSelectedAccount(e.target.value);
                setOpenAccountSelect(false);
            }}
              SelectProps={{
                open: openAccountSelect,
                onOpen: () => setOpenAccountSelect(true),
                onClose: () => setOpenAccountSelect(false),
                renderValue: (value: any) => {
                  if (!value) return "All accounts";
                  const found = (chartMasters as any[]).find((c: any) => String(c.account_code) === String(value));
                  return found ? `${found.account_name} - ${found.account_code}` : String(value);
                },
              }}
            >
              <MenuItem value="" onClick={() => {
                setSelectedAccount("");
                setOpenAccountSelect(false);
              }}>
                All accounts
              </MenuItem>
              {Object.entries(groupedChartMasters).map(([typeText, accounts]) => (
                <React.Fragment key={typeText}>
                  <ListSubheader>{typeText}</ListSubheader>
                  {accounts.map((acc: any) => (
                    <MenuItem
                      key={String(acc.account_code)}
                      value={String(acc.account_code)}
                      onClick={() => {
                        setSelectedAccount(String(acc.account_code));
                        setOpenAccountSelect(false);
                      }}
                    >
                      {acc.account_name} {acc.account_code ? ` - ${acc.account_code}` : ""}
                    </MenuItem>
                  ))}
                </React.Fragment>
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
            <TextField
              fullWidth
              size="small"
              label="Dimension"
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
            />
          </Grid>

          {/* Second row */}
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Amount min"
              value={amountMin}
              onChange={(e) => setAmountMin(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Amount max"
              value={amountMax}
              onChange={(e) => setAmountMax(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              onClick={() => console.log("GL Inquiry search", { selectedAccount, fromDate, toDate, dimension, memo, amountMin, amountMax })}
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
              <TableCell>Account</TableCell>
              <TableCell>Dimension</TableCell>
              <TableCell>Person/Item</TableCell>
              <TableCell>Debit</TableCell>
              <TableCell>Credit</TableCell>
              <TableCell>Memo</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedRows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.number}</TableCell>
                <TableCell>{r.reference}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell>{r.account}</TableCell>
                <TableCell>{r.dimension}</TableCell>
                <TableCell>{r.personItem}</TableCell>
                <TableCell>{r.debit}</TableCell>
                <TableCell>{r.credit}</TableCell>
                <TableCell>{r.memo}</TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={10}
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
