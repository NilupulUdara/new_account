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
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
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
import { getCurrencies } from "../../../../api/Currency/currencyApi";
import { getTaxTypes } from "../../../../api/Tax/taxServices";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

// TabPanel helper
function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ mt: 2 }}>{children}</Box>}</div>;
}

export default function JournalEntry() {
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

  // Fetch currencies for currency dropdown
  const { data: currencies = [] } = useQuery({
    queryKey: ["currencies"],
    queryFn: getCurrencies,
  });

  // Fetch tax types for Tax Register table
  const { data: taxTypes = [] } = useQuery({
    queryKey: ["taxTypes"],
    queryFn: getTaxTypes,
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

  //  Table data (journal entry rows)
  const [rows, setRows] = useState([
    {
      id: 1,
      accountCode: "",
      accountDescription: "",
      dimension: "",
      debit: "",
      credit: "",
      memo: "",
      selectedAccountCode: "",
    },
  ]);

  //  Form fields
  const [memo, setMemo] = useState("");
  const [journalDate, setJournalDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [documentDate, setDocumentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [referencePrefix, setReferencePrefix] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [currency, setCurrency] = useState("");
  const [eventDate, setEventDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [includeInTaxRegister, setIncludeInTaxRegister] = useState(false);
  const [sourceRef, setSourceRef] = useState("");
  const [vatDate, setVatDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [dateError, setDateError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [openSelectRowId, setOpenSelectRowId] = useState<number | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Set reference number when fiscal year loads (or fallback when DB empty)
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
        setReferenceNumber(`${formattedNumber}/${year}`);
      })
      .catch((error) => {
        console.error("Error fetching stock moves for reference generation:", error);
        // Fallback to 001 if there's an error or DB is empty
        setReferenceNumber(`001/${year}`);
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

  // Handle journal date change with validation
  const handleJournalDateChange = (value: string) => {
    setJournalDate(value);
    validateDate(value);
  };

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  //  Handle input change in table
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
        debit: "",
        credit: "",
        memo: "",
        selectedAccountCode: "",
      },
    ]);
  };

  //  Remove row (optional)
  const handleRemoveRow = (id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Save journal entry
  const handleSaveJournalEntry = async () => {
    // Validation
    if (!journalDate) {
      setSaveError("Please select a journal date");
      return;
    }
    if (rows.length === 0 || rows.every((row: any) => !row.selectedAccountCode || (!row.debit && !row.credit))) {
      setSaveError("Please add at least one line with account and debit or credit amount");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      // For now, do not call stock-move APIs. Prepare a simple payload and mark success.
      const reference = referencePrefix ? `${referencePrefix}-${referenceNumber}` : referenceNumber;
      const payload = {
        journalDate,
        documentDate,
        reference,
        currency,
        eventDate,
        includeInTaxRegister,
        sourceRef,
        lines: rows.map((r: any) => ({
          accountCode: r.accountCode,
          accountDescription: r.accountDescription,
          dimension: r.dimension,
          debit: r.debit,
          credit: r.credit,
          memo: r.memo,
        })),
      };

      console.log("Prepared journal entry payload:", payload);

      // Navigate to success page with relevant data
      navigate("/bankingandgeneralledger/transactions/journal-entry/success", {
        state: {
          reference,
          date: journalDate,
          documentDate,
          eventDate,
          currency,
          lines: payload.lines,
        }
      });
    } catch (error: any) {
      console.error("Error preparing journal entry payload:", error);
      setSaveError(error?.message || "Failed to prepare journal entry");
    } finally {
      setIsSaving(false);
    }
  };

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Journal Entry" },
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
          <PageTitle title="Journal Entry" />
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

      {/* Journal Entry Header Fields */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          {/* First row: Journal Date, Document Date, Reference */}
          <Grid item xs={12} sm={4}>
            <TextField
              label="Journal Date"
              type="date"
              fullWidth
              size="small"
              value={journalDate}
              onChange={(e) => handleJournalDateChange(e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!dateError}
              helperText={dateError}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Document Date"
              type="date"
              fullWidth
              size="small"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <TextField
                  select
                  fullWidth
                  label="Prefix"
                  value={referencePrefix}
                  onChange={(e) => setReferencePrefix(e.target.value)}
                  size="small"
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="JE">JE</MenuItem>
                  <MenuItem value="JV">JV</MenuItem>
                  <MenuItem value="ADJ">ADJ</MenuItem>
                  <MenuItem value="REV">REV</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  label="Reference"
                  fullWidth
                  size="small"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Enter reference"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Second row: Currency, Event Date, Include in tax register */}
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              size="small"
            >
              <MenuItem value="">Select currency</MenuItem>
              {(currencies as any[]).map((curr: any) => (
                <MenuItem key={curr.id} value={curr.currency_abbreviation}>
                  {curr.currency_abbreviation} - {curr.currency_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Event Date"
              type="date"
              fullWidth
              size="small"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeInTaxRegister}
                  onChange={(e) => setIncludeInTaxRegister(e.target.checked)}
                />
              }
              label="Include in tax register"
            />
          </Grid>

          {/* Source ref under Event Date */}
          <Grid item xs={12} sm={4} sx={{ ml: { sm: '33.33%' } }}>
            <TextField
              label="Source ref"
              fullWidth
              size="small"
              value={sourceRef}
              onChange={(e) => setSourceRef(e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        textColor="primary"
        indicatorColor="primary"
        sx={{ backgroundColor: "#fff", borderRadius: 1 }}
      >
        <Tab label="GL Posting" />
        <Tab label="Tax Register" disabled={!includeInTaxRegister} />
      </Tabs>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {/*  Table */}
      <TableContainer component={Paper} sx={{ p: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Account Code</TableCell>
              <TableCell>Account Description</TableCell>
              <TableCell>Dimension</TableCell>
              <TableCell>Debit</TableCell>
              <TableCell>Credit</TableCell>
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
                  <TextField size="small" type="number" value={row.debit} onChange={(e) => handleChange(row.id, "debit", e.target.value)} />
                </TableCell>
                <TableCell>
                  <TextField size="small" type="number" value={row.credit} onChange={(e) => handleChange(row.id, "credit", e.target.value)} />
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
              <TableCell colSpan={4}>
                <Typography align="right" sx={{ pr: 2, fontWeight: 600 }}>
                  Total Debit: {rows.reduce((sum, r) => sum + Number(r.debit || 0), 0).toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell colSpan={4}>
                <Typography sx={{ fontWeight: 600 }}>
                  Total Credit: {rows.reduce((sum, r) => sum + Number(r.credit || 0), 0).toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell colSpan={3}></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* VAT Date */}
        <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
          <TextField
            label="VAT Date"
            type="date"
            size="small"
            value={vatDate}
            onChange={(e) => setVatDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ maxWidth: 200 }}
          />
        </Box>

        {/* Tax Register Table */}
        <TableContainer component={Paper} sx={{ p: 1 }}>
          <Table>
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Input Tax</TableCell>
                <TableCell>Output Tax</TableCell>
                <TableCell>Net Amount</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {(taxTypes as any[]).map((tax, index) => (
                <TableRow key={tax.id} hover>
                  <TableCell>
                    {tax.description} ({tax.default_rate}%)
                  </TableCell>
                  <TableCell>
                    <TextField size="small" type="number" value="0" InputProps={{ readOnly: true }} />
                  </TableCell>
                  <TableCell>
                    <TextField size="small" type="number" value="0" InputProps={{ readOnly: true }} />
                  </TableCell>
                  <TableCell>
                    <TextField size="small" type="number" placeholder="0.00" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
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
          Journal entry saved successfully!
        </Alert>
      )}
      {saveError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {saveError}
        </Alert>
      )}

      {/*  Submit Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, p: 1 }}>
        <Button
          variant="contained"
          color="primary"
          disabled={!!dateError || isSaving}
          onClick={handleSaveJournalEntry}
        >
          {isSaving ? "Processing..." : "Process Journal Entry"}
        </Button>
      </Box>
    </Stack>
  );
}
