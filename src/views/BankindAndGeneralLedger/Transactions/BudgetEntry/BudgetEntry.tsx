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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFiscalYears } from "../../../../api/FiscalYear/FiscalYearApi";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

export default function BudgetEntry() {
  const navigate = useNavigate();

  // Fetch fiscal years
  const { data: fiscalYears = [] } = useQuery({
    queryKey: ["fiscalYears"],
    queryFn: getFiscalYears,
  });

  // Fetch GL accounts for Account code dropdown
  const { data: chartMasters = [] } = useQuery({
    queryKey: ["chartMasters"],
    queryFn: () => import("../../../../api/GLAccounts/ChartMasterApi").then(m => m.getChartMasters()),
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

  //  Form fields
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>("");
  const [selectedAccountCode, setSelectedAccountCode] = useState<string>("");
  const [dimension, setDimension] = useState<string>("");
  const [getText, setGetText] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Generate periods for the selected fiscal year
  const budgetPeriods = useMemo(() => {
    if (!selectedFiscalYear) return [];
    
    const fiscalYear = fiscalYears.find((fy: any) => String(fy.id) === selectedFiscalYear);
    if (!fiscalYear) return [];

    const periods = [];
    const startDate = new Date(fiscalYear.fiscal_year_from);
    const endDate = new Date(fiscalYear.fiscal_year_to);
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const period = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;
      periods.push({
        id: period,
        period,
        amount: "",
        dimIncl: "0",
        lastYear: "0"
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return periods;
  }, [selectedFiscalYear, fiscalYears]);

  // Handle period amount change
  const handlePeriodAmountChange = (periodId: string, amount: string) => {
    // This would update the period data - for now just log
    console.log(`Period ${periodId} amount changed to: ${amount}`);
  };

  // Handle Get button click
  const handleGetData = () => {
    // This would fetch budget data based on the form fields
    console.log("Getting budget data for:", { selectedFiscalYear, selectedAccountCode, dimension, getText });
  };

  // Handle Save
  const handleSave = async () => {
    if (!selectedFiscalYear || !selectedAccountCode) {
      setSaveError("Please select fiscal year and account code");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      // Save budget data logic here
      console.log("Saving budget data");
      setSaveSuccess(true);
    } catch (error: any) {
      console.error("Error saving budget:", error);
      setSaveError(error?.message || "Failed to save budget");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!selectedFiscalYear || !selectedAccountCode) {
      setSaveError("Please select fiscal year and account code");
      return;
    }

    // Delete budget data logic here
    console.log("Deleting budget data");
  };

  // Set default fiscal year
  useEffect(() => {
    if (fiscalYears.length > 0 && !selectedFiscalYear) {
      const currentFY = fiscalYears.find((fy: any) => !fy.isClosed);
      if (currentFY) {
        setSelectedFiscalYear(String(currentFY.id));
      }
    }
  }, [fiscalYears, selectedFiscalYear]);

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Budget Entry" },
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
          <PageTitle title="Budget Entry" />
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

      {/* Budget Entry Form */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              label="Fiscal Year"
              value={selectedFiscalYear}
              onChange={(e) => setSelectedFiscalYear(e.target.value)}
              size="small"
            >
              <MenuItem value="">Select fiscal year</MenuItem>
              {(fiscalYears as any[]).map((fy: any) => (
                <MenuItem key={fy.id} value={String(fy.id)}>
                  {fy.fiscal_year_from} - {fy.fiscal_year_to} {fy.closed ? "Closed" : "Active"}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              label="Account code"
              value={selectedAccountCode}
              onChange={(e) => setSelectedAccountCode(e.target.value)}
              size="small"
            >
              <MenuItem value="">Select account</MenuItem>
              {(chartMasters as any[]).map((acc: any) => (
                <MenuItem key={String(acc.account_code)} value={String(acc.account_code)}>
                  {acc.account_code} - {acc.account_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              label="Dimension"
              fullWidth
              size="small"
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label="Get"
                fullWidth
                size="small"
                value={getText}
                onChange={(e) => setGetText(e.target.value)}
                InputProps={{ readOnly: true }}
              />
              <Button
                variant="outlined"
                onClick={handleGetData}
                sx={{ minWidth: "60px" }}
              >
                Get
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Budget Periods Table */}
      <TableContainer component={Paper} sx={{ p: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>Period</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Dim. Incl.</TableCell>
              <TableCell>Last Year</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {budgetPeriods.map((period) => (
              <TableRow key={period.id} hover>
                <TableCell>{period.period}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={period.amount}
                    onChange={(e) => handlePeriodAmountChange(period.id, e.target.value)}
                    placeholder="0.00"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={period.dimIncl}
                    InputProps={{ readOnly: true }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={period.lastYear}
                    InputProps={{ readOnly: true }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableCell>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Total
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {budgetPeriods.reduce((sum, period) => sum + (Number(period.amount) || 0), 0).toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {budgetPeriods.reduce((sum, period) => sum + (Number(period.dimIncl) || 0), 0).toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {budgetPeriods.reduce((sum, period) => sum + (Number(period.lastYear) || 0), 0).toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Budget saved successfully!
        </Alert>
      )}
      {saveError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {saveError}
        </Alert>
      )}

      {/* Save and Delete Buttons */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2, p: 1 }}>
        <Button
          variant="contained"
          color="primary"
          disabled={isSaving}
          onClick={handleSave}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDelete}
        >
          Delete
        </Button>
      </Box>
    </Stack>
  );
}
