import React, { useState, useMemo, useEffect } from "react";
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
  Typography,
  MenuItem,
  Grid,
  Alert,
  ListSubheader,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFiscalYears } from "../../../../api/FiscalYear/FiscalYearApi";
import { createStockMove, getStockMoves } from "../../../../api/StockMoves/StockMovesApi";
import useCurrentUser from "../../../../hooks/useCurrentUser";
import { getBankAccounts } from "../../../../api/BankAccount/BankAccountApi";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

export default function Deposits() {
  const navigate = useNavigate();

  // Fetch fiscal years
  const { data: fiscalYears = [] } = useQuery({
    queryKey: ["fiscalYears"],
    queryFn: getFiscalYears,
  });

  // Fetch GL accounts for Account Description dropdown
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

  // Fetch bank accounts for 'From' dropdown
  const { data: bankAccounts = [] } = useQuery({
    queryKey: ["bankAccounts"],
    queryFn: getBankAccounts,
  });

  // Find current fiscal year (not closed and contains today's date)
  const currentFiscalYear = useMemo(() => {
    const today = new Date();
    const openFiscalYears = fiscalYears.filter((fy: any) => !fy.isClosed);

    // First try to find fiscal year that contains today's date
    const currentFY = openFiscalYears.find((fy: any) => {
      const from = new Date(fy.fiscal_year_from);
      const to = new Date(fy.fiscal_year_to);
      return today >= from && today <= to;
    });

    // If no fiscal year contains today's date, use the first open one
    return currentFY || openFiscalYears[0];
  }, [fiscalYears]);

  const { user } = useCurrentUser();
  const userId = user?.id ?? (Number(localStorage.getItem("userId")) || 0);

  //  Table data (payments rows)
  const [rows, setRows] = useState([
    {
      id: 1,
      accountCode: "",
      accountDescription: "",
      dimension: "",
      amount: "",
      memo: "",
      selectedAccountCode: "",
    },
  ]);

  //  Form fields
  const [memo, setMemo] = useState("");
  const [location, setLocation] = useState("");
  const [payTo, setPayTo] = useState("");
  const [fromField, setFromField] = useState("");
  const [toTheOrderOf, setToTheOrderOf] = useState("");
  const [bankBalance, setBankBalance] = useState("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [reference, setReference] = useState("");
  const [dateError, setDateError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [openSelectRowId, setOpenSelectRowId] = useState<number | null>(null);

  // Set reference when fiscal year loads (or fallback when DB empty)
  useEffect(() => {
    // Determine year: prefer fiscal year start if available, otherwise use current calendar year
    const year = currentFiscalYear
      ? new Date(currentFiscalYear.fiscal_year_from).getFullYear()
      : new Date().getFullYear();

    // Fetch existing references to generate next sequential number
    // Only consider stock moves of the same transaction type (17 = adjustment)
    getStockMoves()
      .then((stockMoves) => {
        const moves = Array.isArray(stockMoves) ? stockMoves : [];
        const yearReferences = moves
          .filter((move: any) => move && move.type === 17 && move.reference && String(move.reference).endsWith(`/${year}`))
          .map((move: any) => String(move.reference))
          .map((ref: string) => {
            const match = String(ref).match(/^(\d{3})\/\d{4}$/);
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter((num: number) => !isNaN(num) && num > 0);

        const nextNumber = yearReferences.length > 0 ? Math.max(...yearReferences) + 1 : 1;
        const formattedNumber = nextNumber.toString().padStart(3, '0');
        setReference(`${formattedNumber}/${year}`);
      })
      .catch((error) => {
        console.error("Error fetching stock moves for reference generation:", error);
        // Fallback to 001 if there's an error or DB is empty
        setReference(`001/${year}`);
      });
  }, [currentFiscalYear]);

  // Validate date is within fiscal year
  const validateDate = (selectedDate: string) => {
    if (!currentFiscalYear) {
      setDateError("No active fiscal year found");
      return false;
    }

    const selected = new Date(selectedDate);
    const from = new Date(currentFiscalYear.fiscal_year_from);
    const to = new Date(currentFiscalYear.fiscal_year_to);

    if (selected < from || selected > to) {
      setDateError(`Date must be within the fiscal year (${from.toLocaleDateString()} - ${to.toLocaleDateString()})`);
      return false;
    }

    setDateError("");
    return true;
  };

  // Handle date change with validation
  const handleDateChange = (value: string) => {
    setDate(value);
    validateDate(value);
  };

  //  Handle input change in table (generic)
  const handleChange = (id: number, field: string, value: any) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  //  Add new row
  const handleAddItem = () => {
    setRows((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        accountCode: "",
        accountDescription: "",
        dimension: "",
        amount: "",
        memo: "",
        selectedAccountCode: "",
      },
    ]);
  };

  //  Remove row (optional)
  const handleRemoveRow = (id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSaveAdjustment = async () => {
    // Validation
    if (!date) {
      setSaveError("Please select a date");
      return;
    }
    if (rows.length === 0 || rows.every((row: any) => !row.selectedAccountCode || !row.amount)) {
      setSaveError("Please add at least one line with account and amount");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const payload = {
        payTo,
        from: fromField,
        reference,
        toTheOrderOf,
        bankBalance,
        date,
        lines: rows.map((r: any) => ({
          accountCode: r.accountCode,
          accountDescription: r.accountDescription,
          dimension: r.dimension,
          amount: r.amount,
          memo: r.memo,
        })),
      };

      setSaveSuccess(true);
      // keep user on page and show success message for now; navigation/saving to server can be implemented later
    } catch (error: any) {
      console.error("Error preparing deposit payload:", error);
      setSaveError(error?.message || "Failed to prepare deposit");
    } finally {
      setIsSaving(false);
    }
  };

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Deposits" },
  ];

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
          <PageTitle title="Bank Account Deposit Entry" />
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

      {/* New header fields: Date, Pay To, From / Reference, To the order of, Bank balance */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          {/* First row: Date, Pay To, From */}
          <Grid item xs={12} sm={4}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              size="small"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!dateError}
              helperText={dateError}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="From"
              value={payTo}
              onChange={(e) => setPayTo(e.target.value)}
              size="small"
            >
              <MenuItem value="">Select</MenuItem>
              <MenuItem value="miscellaneous">Miscellaneous</MenuItem>
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="supplier">Supplier</MenuItem>
              <MenuItem value="quick">Quick Entry</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Into"
              fullWidth
              size="small"
              value={fromField}
              onChange={(e) => setFromField(e.target.value)}
            >
              <MenuItem value="">Select account</MenuItem>
              {(bankAccounts as any[]).map((acc: any) => (
                <MenuItem key={acc.id} value={String(acc.id)}>
                  {acc.bank_account_name ?? (`${acc.bank_name || ""} - ${acc.bank_account_number || ""}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Second row: Reference, Name */}
          <Grid item xs={12} sm={4}>
            <TextField
              label="Reference"
              fullWidth
              size="small"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Enter reference"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Name"
              fullWidth
              size="small"
              value={toTheOrderOf}
              onChange={(e) => setToTheOrderOf(e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/*  Table */}
      <TableContainer component={Paper} sx={{ p: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Account Code</TableCell>
              <TableCell>Account Description</TableCell>
              <TableCell>Dimension</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Memo</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id} hover data-row-id={row.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <TextField size="small" value={row.accountCode} InputProps={{ readOnly: true }} />
                </TableCell>
                <TableCell>
                  <TextField
                    select
                    size="small"
                    value={String(row.selectedAccountCode || row.accountCode || "")}
                    SelectProps={{
                        open: openSelectRowId === row.id,
                        onOpen: () => setOpenSelectRowId(row.id),
                        onClose: () => setOpenSelectRowId(null),
                        renderValue: (value: any) => {
                            if (!value) return "";
                            const found = (chartMasters as any[]).find((c: any) => String(c.account_code) === String(value));
                            return found ? `${found.account_name} - ${found.account_code}` : String(value);
                        },
                    }}
                    onChange={(e) => {
                      const selectedCode = String(e.target.value);
                      const selected = (chartMasters as any[]).find((c: any) => String(c.account_code) === selectedCode);
                      const desc = selected ? selected.account_name : "";
                      const code = selected ? String(selected.account_code) : selectedCode;
                      handleChange(row.id, "selectedAccountCode", code);
                      handleChange(row.id, "accountDescription", desc);
                      handleChange(row.id, "accountCode", code);
                      setOpenSelectRowId(null);
                    }}
                  >
                    <MenuItem value="" onClick={() => {
                      handleChange(row.id, "selectedAccountCode", "");
                      handleChange(row.id, "accountCode", "");
                      handleChange(row.id, "accountDescription", "");
                      setOpenSelectRowId(null);
                    }}>Select account</MenuItem>
                    {Object.entries(groupedChartMasters).map(([typeText, accounts]) => (
                      <React.Fragment key={typeText}>
                        <ListSubheader>{typeText}</ListSubheader>
                        {accounts.map((acc: any) => (
                          <MenuItem
                            key={String(acc.account_code)}
                            value={String(acc.account_code)}
                            onClick={() => {
                              const code = String(acc.account_code ?? "");
                              handleChange(row.id, "selectedAccountCode", code);
                              handleChange(row.id, "accountCode", code);
                              handleChange(row.id, "accountDescription", acc.account_name || "");
                              setOpenSelectRowId(null);
                            }}
                          >
                            {acc.account_name} {acc.account_code ? ` - ${acc.account_code}` : ""}
                          </MenuItem>
                        ))}
                      </React.Fragment>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell>
                  <TextField size="small" value={row.dimension} onChange={(e) => handleChange(row.id, "dimension", e.target.value)} />
                </TableCell>
                <TableCell>
                  <TextField size="small" type="number" value={row.amount} onChange={(e) => handleChange(row.id, "amount", e.target.value)} />
                </TableCell>
                <TableCell>
                  <TextField size="small" value={row.memo} onChange={(e) => handleChange(row.id, "memo", e.target.value)} />
                </TableCell>
                <TableCell align="center">
                  {index === rows.length - 1 ? (
                    <Button variant="contained" color="primary" size="small" startIcon={<AddIcon />} onClick={handleAddItem}>
                      Add
                    </Button>
                  ) : (
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => {
                        const rowElement = document.querySelector(`[data-row-id="${row.id}"]`);
                        if (rowElement) {
                          const firstInput = rowElement.querySelector('input') as HTMLInputElement;
                          if (firstInput) firstInput.focus();
                        }
                      }}>Edit</Button>
                      <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => handleRemoveRow(row.id)}>Delete</Button>
                    </Stack>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell colSpan={7}>
                <Typography align="right" sx={{ pr: 2, fontWeight: 600 }}>
                  Total: {rows.reduce((sum, r) => sum + Number(r.amount || 0), 0).toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      {/*  Memo Field */}
      <Box sx={{ mt: 2, pl: 1, pr: 1 }}>
        <Typography sx={{ mb: 1, fontWeight: 600 }}>Memo:</Typography>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Enter memo or notes..."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </Box>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Payment processed successfully!
        </Alert>
      )}
      {saveError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {saveError}
        </Alert>
      )}

      {/*  Submit Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, pr: 1 }}>
        <Button
          variant="contained"
          color="primary"
          disabled={!!dateError || isSaving}
          onClick={handleSaveAdjustment}
        >
          {isSaving ? "Saving..." : "Process Deposit"}
        </Button>
      </Box>
    </Stack>
  );
}
