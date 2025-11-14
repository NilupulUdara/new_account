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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

interface AssetRow {
  id: number;
  description: string;
  amount: string;
}

interface LiabilityRow {
  id: number;
  description: string;
  amount: string;
}

export default function BalanceSheetDrilldown() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  // Search form state
  const [asAtDate, setAsAtDate] = useState("");
  const [dimension, setDimension] = useState("");

  // Dummy assets data
  const assets: AssetRow[] = [
    {
      id: 1,
      description: "Current Assets",
      amount: "500.00"
    },
    {
      id: 2,
      description: "Inventory Assets",
      amount: "1000.00"
    },
  ];

  // Dummy liabilities data
  const liabilities: LiabilityRow[] = [
    {
      id: 1,
      description: "Current Liabilities",
      amount: "300.00"
    },
    {
      id: 2,
      description: "Long Term Liabilities",
      amount: "700.00"
    },
  ];

  const totalAssets = assets.reduce((sum, asset) => sum + (parseFloat(asset.amount) || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + (parseFloat(liability.amount) || 0), 0);

  return (
    <Stack spacing={2}>
      <Box sx={{ padding: theme.spacing(2), boxShadow: 2, borderRadius: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <Box>
          <PageTitle title="Balance Sheet" />
          <Breadcrumb breadcrumbs={[{ title: "Home", href: "/home" }, { title: "Balance Sheet" }]} />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="As at:"
              type="date"
              value={asAtDate}
              onChange={(e) => setAsAtDate(e.target.value)}
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

          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              onClick={() => console.log("Balance Sheet search", { asAtDate, dimension })}
              sx={{ height: '40px', width: '100%' }}
            >
              Show
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ p: 1 }}>
        <Table>
          <TableBody>
            {/* Assets Section */}
            <TableRow sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableCell colSpan={2} sx={{ fontWeight: "bold", fontSize: "1.2em", color: "black", textAlign: "center" }}>
                Assets
              </TableCell>
            </TableRow>

            {assets.map((asset) => (
              <TableRow key={asset.id} hover>
                <TableCell>{asset.description}</TableCell>
                <TableCell align="right">{asset.amount}</TableCell>
              </TableRow>
            ))}

            {/* Total Assets */}
            <TableRow sx={{ backgroundColor: "#e8eaf6" }}>
              <TableCell sx={{ fontWeight: "bold", paddingLeft: 2, fontSize: "1.1em", color: "#3f51b5" }}>
                Total Assets
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", fontSize: "1.1em", color: "#3f51b5" }}>
                {totalAssets.toFixed(2)}
              </TableCell>
            </TableRow>

            {/* Liabilities Section */}
            <TableRow sx={{ backgroundColor: "var(--pallet-lighter-blue)", marginTop: 2 }}>
              <TableCell colSpan={2} sx={{ fontWeight: "bold", fontSize: "1.2em", color: "black", textAlign: "center" }}>
                Liabilities
              </TableCell>
            </TableRow>

            {liabilities.map((liability) => (
              <TableRow key={liability.id} hover>
                <TableCell>{liability.description}</TableCell>
                <TableCell align="right">{liability.amount}</TableCell>
              </TableRow>
            ))}

            {/* Total Liabilities */}
            <TableRow sx={{ backgroundColor: "#e8eaf6" }}>
              <TableCell sx={{ fontWeight: "bold", paddingLeft: 2, fontSize: "1.1em", color: "#3f51b5" }}>
                Total Liabilities
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", fontSize: "1.1em", color: "#3f51b5" }}>
                {totalLiabilities.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
