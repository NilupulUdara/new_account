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
  FormControl,
  InputLabel,
  Select,
  TableFooter,
  TablePagination,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTransTypes } from "../../../../api/Reflines/TransTypesApi";
import { getUsers } from "../../../../api/UserManagement/userManagement";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

interface Row {
  id: number;
  date: string;
  type: string;
  transNumber: string;
  counterparty: string;
  reference: string;
  amount: string;
  memo: string;
  user: string;
}

export default function JournalInquiry() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // API calls
  const { data: transTypes = [] } = useQuery({ queryKey: ["transTypes"], queryFn: getTransTypes });
  const { data: usersData = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const data = await getUsers();
      return data.map((user: any) => ({
        id: user.id,
        fullName: `${user.first_name} ${user.last_name}`,
        department: user.department,
        email: user.email,
        role: user.role,
        status: user.status,
      }));
    },
  });

  // Search form state
  const [reference, setReference] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [showClosed, setShowClosed] = useState(false);

  // dummy rows
  const today = new Date().toISOString().split("T")[0];
  const rows: Row[] = [
    {
      id: 1,
      date: today,
      type: "Payment",
      transNumber: "PAY-001",
      counterparty: "Acme Corporation",
      reference: "REF-001",
      amount: "1500.00",
      memo: "Invoice payment",
      user: "John Doe"
    },
    {
      id: 2,
      date: today,
      type: "Deposit",
      transNumber: "DEP-001",
      counterparty: "Beta Ltd",
      reference: "REF-002",
      amount: "2500.00",
      memo: "Customer deposit",
      user: "Jane Smith"
    },
    {
      id: 3,
      date: today,
      type: "Transfer",
      transNumber: "TRF-001",
      counterparty: "Internal Transfer",
      reference: "REF-003",
      amount: "500.00",
      memo: "Bank transfer",
      user: "Mike Johnson"
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
          <PageTitle title="Journal Inquiry" />
          <Breadcrumb breadcrumbs={[{ title: "Home", href: "/home" }, { title: "Journal Inquiry" }]} />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          {/* First row */}
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={selectedType}
                label="Type"
                onChange={(e) => setSelectedType(String(e.target.value))}
              >
                <MenuItem value="">All Types</MenuItem>
                {(transTypes as any[]).map((t: any) => (
                  <MenuItem key={String(t.trans_type ?? t.id ?? t.code)} value={String(t.trans_type ?? t.id ?? t.code)}>
                    {t.description ?? t.name ?? t.label ?? String(t.trans_type ?? t.id ?? t.code)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
            <FormControl fullWidth size="small">
              <InputLabel>User</InputLabel>
              <Select
                value={selectedUser}
                label="User"
                onChange={(e) => setSelectedUser(String(e.target.value))}
              >
                <MenuItem value="">All Users</MenuItem>
                {usersData.map((u: any) => (
                  <MenuItem key={u.id} value={String(u.id)}>
                    {u.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showClosed}
                  onChange={(e) => setShowClosed(e.target.checked)}
                />
              }
              label="Show closed"
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={() => console.log("Journal Inquiry search", { reference, selectedType, fromDate, toDate, memo, selectedUser, showClosed })}
              sx={{ height: '40px', width: '100%' }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ p: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Trans #</TableCell>
              <TableCell>Counterparty</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Memo</TableCell>
              <TableCell>User</TableCell>
              <TableCell align="center">View</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedRows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.date}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.transNumber}</TableCell>
                <TableCell>{r.counterparty}</TableCell>
                <TableCell>{r.reference}</TableCell>
                <TableCell>{r.amount}</TableCell>
                <TableCell>{r.memo}</TableCell>
                <TableCell>{r.user}</TableCell>
                <TableCell align="center">
                  <Button variant="contained" size="small" onClick={() => console.log("GL view for", r.transNumber)}>
                    GL
                  </Button>
                </TableCell>
                <TableCell align="center">
                  <Button variant="outlined" size="small" onClick={() => console.log("Edit", r.transNumber)}>
                    Edit
                  </Button>
                </TableCell>
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
