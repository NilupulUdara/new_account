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
  Grid,
  useMediaQuery,
  Theme,
  TableFooter,
  TablePagination,
  Checkbox,
  FormControlLabel,
  ListSubheader,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

interface Row {
  id: number;
  account: string;
  accountName: string;
  accountType: number;
  broughtForwardDebit: string;
  broughtForwardCredit: string;
  thisPeriodDebit: string;
  thisPeriodCredit: string;
  balanceCredit: string;
  balanceDebit: string;
}

export default function TrialBalance() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch GL accounts, chart classes, and chart types
  const { data: chartMasters = [] } = useQuery({
    queryKey: ["chartMasters"],
    queryFn: () => import("../../../../api/GLAccounts/ChartMasterApi").then(m => m.getChartMasters()),
  });

  const { data: chartClasses = [] } = useQuery({
    queryKey: ["chartClasses"],
    queryFn: () => import("../../../../api/GLAccounts/ChartClassApi").then(m => m.getChartClasses()),
  });

  const { data: chartTypes = [] } = useQuery({
    queryKey: ["chartTypes"],
    queryFn: () => import("../../../../api/GLAccounts/ChartTypeApi").then(m => m.getChartTypes()),
  });

  // Create dynamic account type map from chart types
  const accountTypeMap = useMemo(() => {
    const mapping: Record<string, string> = {};
    (chartTypes as any[]).forEach((chartType: any) => {
      mapping[String(chartType.id)] = chartType.name || chartType.type_name || `Type ${chartType.id}`;
    });
    
    // Fallback to hardcoded mapping if no data
    if (Object.keys(mapping).length === 0) {
      return {
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
    }
    
    return mapping;
  }, [chartTypes]);

  // Create dynamic mapping from account types to classes based on direct relationships
  const accountTypeToClassMap = useMemo(() => {
    const mapping: Record<string, { classId: number; className: string }> = {};
    
    (chartTypes as any[]).forEach((chartType: any) => {
      const classId = chartType.class_id;
      const classObj = (chartClasses as any[]).find(c => c.cid === classId);
      if (classObj) {
        mapping[String(chartType.id)] = {
          classId: classObj.cid,
          className: classObj.class_name
        };
      }
    });
    
    return mapping;
  }, [chartTypes, chartClasses]);

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
  const [noZeroValues, setNoZeroValues] = useState(false);
  const [onlyBalance, setOnlyBalance] = useState(false);
  const [groupTotalsOnly, setGroupTotalsOnly] = useState(false);
  const [openAccountSelect, setOpenAccountSelect] = useState(false);

  // Transform chart masters into trial balance rows with realistic amounts
  const rows: Row[] = useMemo(() => {
    return (chartMasters as any[]).map((account: any, index: number) => {
      // Generate realistic trial balance amounts based on account type
      const baseAmount = Math.floor(Math.random() * 10000) + 1000;
      
      // Different account types have different balance patterns
      let broughtForwardDebit = "0.00";
      let broughtForwardCredit = "0.00";
      let thisPeriodDebit = "0.00";
      let thisPeriodCredit = "0.00";
      let balanceDebit = "0.00";
      let balanceCredit = "0.00";

      // Asset accounts typically have debit balances
      if ([1, 2, 3].includes(account.account_type)) {
        broughtForwardDebit = (baseAmount * 0.8).toFixed(2);
        thisPeriodDebit = (baseAmount * 0.3).toFixed(2);
        thisPeriodCredit = (baseAmount * 0.2).toFixed(2);
        const netDebit = parseFloat(broughtForwardDebit) + parseFloat(thisPeriodDebit) - parseFloat(thisPeriodCredit);
        balanceDebit = netDebit.toFixed(2);
      }
      // Liability and equity accounts typically have credit balances
      else if ([4, 5, 6, 7].includes(account.account_type)) {
        broughtForwardCredit = (baseAmount * 0.8).toFixed(2);
        thisPeriodCredit = (baseAmount * 0.3).toFixed(2);
        thisPeriodDebit = (baseAmount * 0.2).toFixed(2);
        const netCredit = parseFloat(broughtForwardCredit) + parseFloat(thisPeriodCredit) - parseFloat(thisPeriodDebit);
        balanceCredit = netCredit.toFixed(2);
      }
      // Revenue accounts typically have credit balances (accumulated)
      else if ([8, 9].includes(account.account_type)) {
        broughtForwardCredit = (baseAmount * 2).toFixed(2);
        thisPeriodCredit = (baseAmount * 0.5).toFixed(2);
        thisPeriodDebit = (baseAmount * 0.1).toFixed(2);
        const netCredit = parseFloat(broughtForwardCredit) + parseFloat(thisPeriodCredit) - parseFloat(thisPeriodDebit);
        balanceCredit = netCredit.toFixed(2);
      }
      // Expense accounts typically have debit balances (accumulated)
      else if ([10, 11, 12].includes(account.account_type)) {
        broughtForwardDebit = (baseAmount * 1.5).toFixed(2);
        thisPeriodDebit = (baseAmount * 0.4).toFixed(2);
        thisPeriodCredit = (baseAmount * 0.05).toFixed(2);
        const netDebit = parseFloat(broughtForwardDebit) + parseFloat(thisPeriodDebit) - parseFloat(thisPeriodCredit);
        balanceDebit = netDebit.toFixed(2);
      }

      return {
        id: index + 1,
        account: account.account_code || `ACC${index + 1}`,
        accountName: account.account_name || `Account ${index + 1}`,
        accountType: account.account_type || 1,
        broughtForwardDebit,
        broughtForwardCredit,
        thisPeriodDebit,
        thisPeriodCredit,
        balanceCredit,
        balanceDebit,
      };
    });
  }, [chartMasters]);

  const paginatedRows = React.useMemo(() => {
    if (rowsPerPage === -1) return rows;
    return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [rows, page, rowsPerPage]);

  // Group rows by class and account type for display
  const groupedRows = useMemo(() => {
    const classGroups: Record<string, Record<string, Row[]>> = {};
    
    // First, create entries for all chart classes (so new classes appear even if they have no accounts)
    (chartClasses as any[]).forEach((chartClass: any) => {
      const className = chartClass.class_name;
      if (!classGroups[className]) {
        classGroups[className] = {};
      }
    });
    
    // Then group accounts by their account types within classes using direct mapping
    paginatedRows.forEach((row) => {
      const accountTypeId = String(row.accountType);
      const classInfo = accountTypeToClassMap[accountTypeId];
      
      if (classInfo) {
        const className = classInfo.className;
        if (!classGroups[className]) {
          classGroups[className] = {};
        }
        
        const typeText = accountTypeMap[accountTypeId] || "Unknown";
        if (!classGroups[className][typeText]) {
          classGroups[className][typeText] = [];
        }
        classGroups[className][typeText].push(row);
      }
      // Skip accounts that don't belong to any class
    });
    
    return classGroups;
  }, [paginatedRows, accountTypeMap, accountTypeToClassMap]);

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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={() => console.log("Trial Balance search", { selectedAccount, fromDate, toDate, dimension, noZeroValues, onlyBalance, groupTotalsOnly })}
                sx={{ height: '40px', width: '200px' }}
              >
                Show
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ p: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell rowSpan={2} align="center" sx={{ fontWeight: "bold", borderRight: "2px solid #e0e0e0" }}>Account</TableCell>
              <TableCell rowSpan={2} align="center" sx={{ fontWeight: "bold", borderRight: "2px solid #e0e0e0" }}>Account Name</TableCell>
              <TableCell colSpan={2} align="center" sx={{ fontWeight: "bold", borderRight: "2px solid #e0e0e0" }}>Brought Forward</TableCell>
              <TableCell colSpan={2} align="center" sx={{ fontWeight: "bold", borderRight: "2px solid #e0e0e0" }}>This Period</TableCell>
              <TableCell colSpan={2} align="center" sx={{ fontWeight: "bold" }}>Balance</TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0" }}>Debit</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", borderRight: "2px solid #e0e0e0" }}>Credit</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0" }}>Debit</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", borderRight: "2px solid #e0e0e0" }}>Credit</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0" }}>Debit</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>Credit</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {Object.entries(groupedRows).map(([className, typeGroups]) => {
              // Calculate class totals
              const allClassRows = Object.values(typeGroups).flat();
              const classTotals = {
                broughtForwardDebit: allClassRows.reduce((sum, r) => sum + (parseFloat(r.broughtForwardDebit) || 0), 0),
                broughtForwardCredit: allClassRows.reduce((sum, r) => sum + (parseFloat(r.broughtForwardCredit) || 0), 0),
                thisPeriodDebit: allClassRows.reduce((sum, r) => sum + (parseFloat(r.thisPeriodDebit) || 0), 0),
                thisPeriodCredit: allClassRows.reduce((sum, r) => sum + (parseFloat(r.thisPeriodCredit) || 0), 0),
                balanceCredit: allClassRows.reduce((sum, r) => sum + (parseFloat(r.balanceCredit) || 0), 0),
                balanceDebit: allClassRows.reduce((sum, r) => sum + (parseFloat(r.balanceDebit) || 0), 0),
              };

              return (
                <React.Fragment key={className}>
                  {/* Class Header */}
                  <TableRow sx={{ backgroundColor: "#1565c0", borderTop: "3px solid #0d47a1" }}>
                    <TableCell colSpan={8} sx={{ fontWeight: "bold", fontSize: "1.2em", color: "white", textAlign: "center" }}>
                      {(() => {
                        const chartClass = (chartClasses as any[]).find(c => c.class_name === className);
                        const classId = chartClass?.cid || chartClass?.id || '?';
                        return `Class ${classId} - ${className}`;
                      })()}
                    </TableCell>
                  </TableRow>

                  {/* Type Groups within Class */}
                  {Object.entries(typeGroups).map(([typeName, groupRows]) => {
                    // Calculate group totals
                    const groupTotals = {
                      broughtForwardDebit: groupRows.reduce((sum, r) => sum + (parseFloat(r.broughtForwardDebit) || 0), 0),
                      broughtForwardCredit: groupRows.reduce((sum, r) => sum + (parseFloat(r.broughtForwardCredit) || 0), 0),
                      thisPeriodDebit: groupRows.reduce((sum, r) => sum + (parseFloat(r.thisPeriodDebit) || 0), 0),
                      thisPeriodCredit: groupRows.reduce((sum, r) => sum + (parseFloat(r.thisPeriodCredit) || 0), 0),
                      balanceCredit: groupRows.reduce((sum, r) => sum + (parseFloat(r.balanceCredit) || 0), 0),
                      balanceDebit: groupRows.reduce((sum, r) => sum + (parseFloat(r.balanceDebit) || 0), 0),
                    };

                    return (
                      <React.Fragment key={typeName}>
                        {/* Group Header */}
                        <TableRow sx={{ backgroundColor: "#e3f2fd", borderTop: "2px solid #1976d2" }}>
                          <TableCell colSpan={8} sx={{ fontWeight: "bold", fontSize: "1.1em", color: "#1976d2" }}>
                            {typeName}
                          </TableCell>
                        </TableRow>

                        {/* Group Rows */}
                        {groupRows.map((r) => (
                          <TableRow key={r.id} hover>
                            <TableCell sx={{ borderRight: "2px solid #e0e0e0" }}>{r.account}</TableCell>
                            <TableCell sx={{ borderRight: "2px solid #e0e0e0" }}>{r.accountName}</TableCell>
                            <TableCell align="right" sx={{ borderRight: "1px solid #e0e0e0" }}>{r.broughtForwardDebit}</TableCell>
                            <TableCell align="right" sx={{ borderRight: "2px solid #e0e0e0" }}>{r.broughtForwardCredit}</TableCell>
                            <TableCell align="right" sx={{ borderRight: "1px solid #e0e0e0" }}>{r.thisPeriodDebit}</TableCell>
                            <TableCell align="right" sx={{ borderRight: "2px solid #e0e0e0" }}>{r.thisPeriodCredit}</TableCell>
                            <TableCell align="right" sx={{ borderRight: "1px solid #e0e0e0" }}>{r.balanceCredit}</TableCell>
                            <TableCell align="right">{r.balanceDebit}</TableCell>
                          </TableRow>
                        ))}

                        {/* Group Subtotal */}
                        <TableRow sx={{ backgroundColor: "#f5f5f5", borderTop: "1px solid #e0e0e0" }}>
                          <TableCell colSpan={2} sx={{ fontWeight: "bold", borderRight: "2px solid #e0e0e0", paddingLeft: 4 }}>
                            Subtotal - {typeName}:
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0" }}>
                            {groupTotals.broughtForwardDebit.toFixed(2)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: "bold", borderRight: "2px solid #e0e0e0" }}>
                            {groupTotals.broughtForwardCredit.toFixed(2)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0" }}>
                            {groupTotals.thisPeriodDebit.toFixed(2)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: "bold", borderRight: "2px solid #e0e0e0" }}>
                            {groupTotals.thisPeriodCredit.toFixed(2)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0" }}>
                            {groupTotals.balanceCredit.toFixed(2)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: "bold" }}>
                            {groupTotals.balanceDebit.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}

                  {/* Class Subtotal */}
                  <TableRow sx={{ backgroundColor: "#e8eaf6", borderTop: "2px solid #3f51b5" }}>
                    <TableCell colSpan={2} sx={{ fontWeight: "bold", borderRight: "2px solid #e0e0e0", paddingLeft: 2, fontSize: "1.1em", color: "#3f51b5" }}>
                      {(() => {
                        const chartClass = (chartClasses as any[]).find(c => c.class_name === className);
                        const classId = chartClass?.cid || chartClass?.id || '?';
                        return `Class ${classId} Total - ${className}`;
                      })()}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0", fontSize: "1.1em", color: "#3f51b5" }}>
                      {classTotals.broughtForwardDebit.toFixed(2)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold", borderRight: "2px solid #e0e0e0", fontSize: "1.1em", color: "#3f51b5" }}>
                      {classTotals.broughtForwardCredit.toFixed(2)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0", fontSize: "1.1em", color: "#3f51b5" }}>
                      {classTotals.thisPeriodDebit.toFixed(2)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold", borderRight: "2px solid #e0e0e0", fontSize: "1.1em", color: "#3f51b5" }}>
                      {classTotals.thisPeriodCredit.toFixed(2)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0", fontSize: "1.1em", color: "#3f51b5" }}>
                      {classTotals.balanceCredit.toFixed(2)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold", fontSize: "1.1em", color: "#3f51b5" }}>
                      {classTotals.balanceDebit.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}

            {/* Grand Total Row */}
            <TableRow sx={{ backgroundColor: "#e8f5e8", borderTop: "3px solid #4caf50" }}>
              <TableCell colSpan={2} sx={{ fontWeight: "bold", borderRight: "2px solid #e0e0e0", fontSize: "1.1em", color: "#2e7d32" }}>
                GRAND TOTAL {toDate ? ` - ${toDate}` : ''}:
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0", fontSize: "1.1em", color: "#2e7d32" }}>
                {rows.reduce((sum, r) => sum + (parseFloat(r.broughtForwardDebit) || 0), 0).toFixed(2)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", borderRight: "2px solid #e0e0e0", fontSize: "1.1em", color: "#2e7d32" }}>
                {rows.reduce((sum, r) => sum + (parseFloat(r.broughtForwardCredit) || 0), 0).toFixed(2)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0", fontSize: "1.1em", color: "#2e7d32" }}>
                {rows.reduce((sum, r) => sum + (parseFloat(r.thisPeriodDebit) || 0), 0).toFixed(2)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", borderRight: "2px solid #e0e0e0", fontSize: "1.1em", color: "#2e7d32" }}>
                {rows.reduce((sum, r) => sum + (parseFloat(r.thisPeriodCredit) || 0), 0).toFixed(2)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0", fontSize: "1.1em", color: "#2e7d32" }}>
                {rows.reduce((sum, r) => sum + (parseFloat(r.balanceCredit) || 0), 0).toFixed(2)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", fontSize: "1.1em", color: "#2e7d32" }}>
                {rows.reduce((sum, r) => sum + (parseFloat(r.balanceDebit) || 0), 0).toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={8}
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
