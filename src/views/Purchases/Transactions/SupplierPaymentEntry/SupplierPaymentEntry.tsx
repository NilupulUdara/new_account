import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";

// APIs
import { getSuppliers } from "../../../../api/Supplier/SupplierApi";
import { getTags } from "../../../../api/DimensionTag/DimensionTagApi";
import { getBankAccounts } from "../../../../api/BankAccount/BankAccountApi";

// Mock function for bank balance - replace with actual API call
const getBankBalance = async (bankId: number) => {
  // Mock implementation - replace with actual API call
  return Math.floor(Math.random() * 10000) + 1000; // Random balance between 1000-11000
};

export default function SupplierPaymentEntry() {
  const navigate = useNavigate();

  // ================== FORM STATES ==================
  const [supplier, setSupplier] = useState(0);
  const [datePaid, setDatePaid] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [bankCharge, setBankCharge] = useState(0);
  const [bankAccount, setBankAccount] = useState(0);
  const [reference, setReference] = useState("");
  const [dimension, setDimension] = useState(0);
  const [bankBalance, setBankBalance] = useState(0);

  const [amountDiscount, setAmountDiscount] = useState(0);
  const [amountPayment, setAmountPayment] = useState(0);
  const [memo, setMemo] = useState("");

  // ================== API STATES ==================
  const [suppliers, setSuppliers] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [banks, setBanks] = useState([]);

  // ================== TABLE ROWS (Allocated amounts) ==================
  const [rows, setRows] = useState([
    // Example structure – will be populated from API later
    {
      id: 1,
      type: "Invoice",
      number: "INV-123",
      supplierRef: "REF-777",
      date: "2025-01-10",
      dueDate: "2025-02-10",
      amount: 500,
      otherAlloc: 100,
      left: 400,
      allocation: 0,
    },
  ]);

  // ================== GENERATE REFERENCE ==================
  useEffect(() => {
    const year = new Date().getFullYear();
    const rnd = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    setReference(`SP-${rnd}/${year}`);
  }, []);

  // ================== FETCH API DATA ==================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersData, dimensionsData, banksData] = await Promise.all([
          getSuppliers(),
          getTags(),
          getBankAccounts(),
        ]);

        setSuppliers(suppliersData);
        setDimensions(dimensionsData);
        setBanks(banksData);
      } catch (error) {
        console.error("Error loading payment page:", error);
      }
    };

    fetchData();
  }, []);

  // ================== GET BANK BALANCE ==================
  useEffect(() => {
    if (bankAccount) {
      getBankBalance(bankAccount).then((bal) => setBankBalance(bal ?? 0));
    }
  }, [bankAccount]);

  // ================== HANDLE ROW UPDATE ==================
  const handleRowChange = (id, field, value) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              [field]: value,
            }
          : r
      )
    );
  };

  // ================== BUTTON: ALL ==================
  const allocateAll = (id) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, allocation: r.left }
          : r
      )
    );
  };

  // ================== BUTTON: NONE ==================
  const allocateNone = (id) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, allocation: 0 } : r
      )
    );
  };

  // ================== SUBMIT ==================
  const handleSubmit = () => {
    alert("Supplier Payment Saved!");
    navigate(-1);
  };

  const breadcrumbItems = [
    { title: "Purchases", href: "/purchases" },
    { title: "Supplier Payment Entry" },
  ];

  return (
    <Stack spacing={2}>
      {/* Header */}
      <Box
        sx={{
          padding: 2,
          boxShadow: 2,
          borderRadius: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <PageTitle title="Supplier Payment Entry" />
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

      {/* ================== FORM FIELDS ================== */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {/* Column 1: Payment To, From Bank Account, Bank Balance */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <TextField
                select
                fullWidth
                label="Payment To (Supplier)"
                size="small"
                value={supplier}
                onChange={(e) => setSupplier(Number(e.target.value))}
              >
                {suppliers.map((s) => (
                  <MenuItem key={s.supplier_id} value={s.supplier_id}>
                    {s.supp_short_name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                size="small"
                label="From Bank Account"
                value={bankAccount}
                onChange={(e) => setBankAccount(Number(e.target.value))}
              >
                {banks.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.bank_account_name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Bank Balance"
                size="small"
                value={bankBalance}
                InputProps={{ readOnly: true }}
              />
            </Stack>
          </Grid>

          {/* Column 2: Date Paid, Reference */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <TextField
                label="Date Paid"
                type="date"
                fullWidth
                size="small"
                value={datePaid}
                onChange={(e) => setDatePaid(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Reference"
                size="small"
                value={reference}
                InputProps={{ readOnly: true }}
              />
            </Stack>
          </Grid>

          {/* Column 3: Bank Charge, Dimension */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <TextField
                label="Bank Charge"
                size="small"
                type="number"
                value={bankCharge}
                onChange={(e) => setBankCharge(Number(e.target.value))}
              />

              <TextField
                select
                fullWidth
                size="small"
                label="Dimension"
                value={dimension}
                onChange={(e) => setDimension(Number(e.target.value))}
              >
                {dimensions.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* ================== TABLE ================== */}
      <Typography
        variant="subtitle1"
        sx={{ textAlign: "center", mt: 2, fontWeight: 600 }}
      >
        Allocated amounts in USD:
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>Transaction Type</TableCell>
              <TableCell>#</TableCell>
              <TableCell>Supplier Ref</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Other Allocations</TableCell>
              <TableCell>Left to Allocate</TableCell>
              <TableCell>This Allocation</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.number}</TableCell>
                <TableCell>{row.supplierRef}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.dueDate}</TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>{row.otherAlloc}</TableCell>
                <TableCell>{row.left}</TableCell>

                {/* Allocation Input */}
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={row.allocation}
                    onChange={(e) =>
                      handleRowChange(row.id, "allocation", Number(e.target.value))
                    }
                  />
                </TableCell>

                <TableCell>
                  <Button size="small" onClick={() => allocateAll(row.id)}>
                    All
                  </Button>
                  <Button size="small" onClick={() => allocateNone(row.id)}>
                    None
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ================== PAYMENT + DISCOUNT + MEMO ================== */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Amount of Discount"
              size="small"
              type="number"
              fullWidth
              value={amountDiscount}
              onChange={(e) => setAmountDiscount(Number(e.target.value))}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="Amount of Payment"
              size="small"
              type="number"
              fullWidth
              value={amountPayment}
              onChange={(e) => setAmountPayment(Number(e.target.value))}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1">Memo:</Typography>
            <TextField
              multiline
              rows={3}
              fullWidth
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </Grid>
        </Grid>

        {/* Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Cancel
          </Button>

          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Save Payment
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
