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
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

interface IncomeRow {
  id: number;
  groupAccountName: string;
  period: string;
  compareValue: string;
  achievePercent: string;
}

interface CostRow {
  id: number;
  groupAccountName: string;
  period: string;
  compareValue: string;
  achievePercent: string;
}

export default function ProfitAndLossDrilldown() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  // Search form state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [compareTo, setCompareTo] = useState("Accumulated");
  const [dimension, setDimension] = useState("");

  const compareToOptions = [
    { value: "Accumulated", label: "Accumulated" },
    { value: "Period Y-1", label: "Period Y-1" },
    { value: "Budget", label: "Budget" },
  ];

  // Dummy income data
  const incomeData: IncomeRow[] = [
    {
      id: 1,
      groupAccountName: "Sales Revenue",
      period: "12500.00",
      compareValue: "12000.00",
      achievePercent: "104.17%"
    },
    {
      id: 2,
      groupAccountName: "Service Revenue",
      period: "3200.00",
      compareValue: "3000.00",
      achievePercent: "106.67%"
    },
  ];

  // Dummy costs data
  const costsData: CostRow[] = [
    {
      id: 1,
      groupAccountName: "Cost of Goods Sold",
      period: "8500.00",
      compareValue: "8200.00",
      achievePercent: "103.66%"
    },
    {
      id: 2,
      groupAccountName: "Operating Expenses",
      period: "4200.00",
      compareValue: "4100.00",
      achievePercent: "102.44%"
    },
  ];

  const totalIncomePeriod = incomeData.reduce((sum, item) => sum + (parseFloat(item.period) || 0), 0);
  const totalIncomeCompare = incomeData.reduce((sum, item) => sum + (parseFloat(item.compareValue) || 0), 0);
  const totalIncomeAchieve = totalIncomeCompare > 0 ? ((totalIncomePeriod / totalIncomeCompare) * 100).toFixed(2) + "%" : "0.00%";

  const totalCostsPeriod = costsData.reduce((sum, item) => sum + (parseFloat(item.period) || 0), 0);
  const totalCostsCompare = costsData.reduce((sum, item) => sum + (parseFloat(item.compareValue) || 0), 0);
  const totalCostsAchieve = totalCostsCompare > 0 ? ((totalCostsPeriod / totalCostsCompare) * 100).toFixed(2) + "%" : "0.00%";

  const calculatedReturnPeriod = totalIncomePeriod - totalCostsPeriod;
  const calculatedReturnCompare = totalIncomeCompare - totalCostsCompare;
  const calculatedReturnAchieve = calculatedReturnCompare > 0 ? ((calculatedReturnPeriod / calculatedReturnCompare) * 100).toFixed(2) + "%" : "0.00%";

  return (
    <Stack spacing={2}>
      <Box sx={{ padding: theme.spacing(2), boxShadow: 2, borderRadius: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <Box>
          <PageTitle title="Profit and Loss Drilldown" />
          <Breadcrumb breadcrumbs={[{ title: "Home", href: "/home" }, { title: "Profit and Loss Drilldown" }]} />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={2}>
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

          <Grid item xs={12} sm={2}>
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
              select
              fullWidth
              size="small"
              label="Compare To"
              value={compareTo}
              onChange={(e) => setCompareTo(e.target.value)}
            >
              {compareToOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
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

          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              onClick={() => console.log("Profit and Loss search", { fromDate, toDate, compareTo, dimension })}
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
              <TableCell colSpan={4} align="center" sx={{ fontWeight: "bold", fontSize: "1.2em", borderBottom: "2px solid #e0e0e0" }}>
                Income
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0" }}>Group/Account Name</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0" }}>Period</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0" }}>{compareTo}</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>Achieve %</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {incomeData.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>{row.groupAccountName}</TableCell>
                <TableCell align="right" sx={{ borderRight: "1px solid #e0e0e0" }}>{row.period}</TableCell>
                <TableCell align="right" sx={{ borderRight: "1px solid #e0e0e0" }}>{row.compareValue}</TableCell>
                <TableCell align="right">{row.achievePercent}</TableCell>
              </TableRow>
            ))}

            {/* Total Income */}
            <TableRow sx={{ backgroundColor: "#e8eaf6" }}>
              <TableCell sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0", fontSize: "1.1em", color: "#3f51b5" }}>
                Total Income
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0", fontSize: "1.1em", color: "#3f51b5" }}>
                {totalIncomePeriod.toFixed(2)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0", fontSize: "1.1em", color: "#3f51b5" }}>
                {totalIncomeCompare.toFixed(2)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", fontSize: "1.1em", color: "#3f51b5" }}>
                {totalIncomeAchieve}
              </TableCell>
            </TableRow>

            {/* Costs Section */}
            <TableRow sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableCell colSpan={4} align="center" sx={{ fontWeight: "bold", fontSize: "1.2em", borderBottom: "2px solid #e0e0e0" }}>
                Costs
              </TableCell>
            </TableRow>
            <TableRow sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableCell align="center" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0" }}>Group/Account Name</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0" }}>Period</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0" }}>{compareTo}</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>Achieve %</TableCell>
            </TableRow>

            {costsData.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>{row.groupAccountName}</TableCell>
                <TableCell align="right" sx={{ borderRight: "1px solid #e0e0e0" }}>{row.period}</TableCell>
                <TableCell align="right" sx={{ borderRight: "1px solid #e0e0e0" }}>{row.compareValue}</TableCell>
                <TableCell align="right">{row.achievePercent}</TableCell>
              </TableRow>
            ))}

            {/* Total Costs */}
            <TableRow sx={{ backgroundColor: "#e8eaf6" }}>
              <TableCell sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0", fontSize: "1.1em", color: "#3f51b5" }}>
                Total Costs
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0", fontSize: "1.1em", color: "#3f51b5" }}>
                {totalCostsPeriod.toFixed(2)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0", fontSize: "1.1em", color: "#3f51b5" }}>
                {totalCostsCompare.toFixed(2)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", fontSize: "1.1em", color: "#3f51b5" }}>
                {totalCostsAchieve}
              </TableCell>
            </TableRow>

            {/* Calculated Return */}
            <TableRow sx={{ backgroundColor: "#fff3e0", borderTop: "3px solid black" }}>
              <TableCell sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0", fontSize: "1.1em", color: "black" }}>
                Calculated Return
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0", fontSize: "1.1em", color: "black" }}>
                {calculatedReturnPeriod.toFixed(2)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0", fontSize: "1.1em", color: "black" }}>
                {calculatedReturnCompare.toFixed(2)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", fontSize: "1.1em", color: "black" }}>
                {calculatedReturnAchieve}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
