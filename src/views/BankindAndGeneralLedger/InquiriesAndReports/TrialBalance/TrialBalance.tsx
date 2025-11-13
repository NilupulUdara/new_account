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
  Grid,
  useMediaQuery,
  Theme,
  TableFooter,
  TablePagination,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

interface Row {
  id: number;
  type: string;
  description: string;
  amount: string;
  outputsInputs: string;
}

export default function TrialBalance() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Search form state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dimension, setDimension] = useState("");
  const [noZeroValues, setNoZeroValues] = useState(false);
  const [onlyBalance, setOnlyBalance] = useState(false);
  const [groupTotalsOnly, setGroupTotalsOnly] = useState(false);

  // dummy rows
  const rows: Row[] = [
    {
      id: 1,
      type: "VAT",
      description: "Sales Tax",
      amount: "1500.00",
      outputsInputs: "300.00"
    },
    {
      id: 2,
      type: "GST",
      description: "Purchase Tax",
      amount: "-800.00",
      outputsInputs: "-550.00"
    },
    {
      id: 3,
      type: "VAT",
      description: "Service Tax",
      amount: "300.00",
      outputsInputs: "900.00"
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
          <PageTitle title="Trial Balance" />
          <Breadcrumb breadcrumbs={[{ title: "Home", href: "/home" }, { title: "Trial Balance" }]} />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          {/* First row: From, To, Dimension */}
          <Grid item xs={12} sm={4}>
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

          <Grid item xs={12} sm={4}>
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

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Dimension"
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
            />
          </Grid>

          {/* Second row: Checkboxes and Show button */}
          <Grid item xs={12} sm={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={noZeroValues}
                  onChange={(e) => setNoZeroValues(e.target.checked)}
                />
              }
              label="No zero values"
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={onlyBalance}
                  onChange={(e) => setOnlyBalance(e.target.checked)}
                />
              }
              label="Only balance"
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={groupTotalsOnly}
                  onChange={(e) => setGroupTotalsOnly(e.target.checked)}
                />
              }
              label="Group totals only"
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              onClick={() => console.log("Trial Balance search", { fromDate, toDate, dimension, noZeroValues, onlyBalance, groupTotalsOnly })}
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
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Outputs/Inputs</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedRows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.description}</TableCell>
                <TableCell>{r.amount}</TableCell>
                <TableCell>{r.outputsInputs}</TableCell>
              </TableRow>
            ))}

            {/* Total Row */}
            <TableRow sx={{ backgroundColor: "#f5f5f5", borderTop: "2px solid #e0e0e0" }}>
              <TableCell></TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Total payable or refund:
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                {rows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0).toFixed(2)}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={4}
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
