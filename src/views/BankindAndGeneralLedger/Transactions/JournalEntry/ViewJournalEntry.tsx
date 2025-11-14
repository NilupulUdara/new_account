import React, { useState } from "react";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Stack, Button } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";

export default function ViewJournalEntry() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { reference, date, payTo, from, toTheOrderOf, lines = [] } = state || {};

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Journal Entry" },
  ];

  // Dummy journal entries data
  const journalEntries = [
    {
      id: 1,
      journalDate: date || "2025-11-14",
      accountCode: "1001",
      accountName: "Cash at Bank",
      dimension: "",
      debit: "1500.00",
      credit: "",
      memo: "Payment processed"
    },
    {
      id: 2,
      journalDate: date || "2025-11-14",
      accountCode: "2001",
      accountName: "Accounts Payable",
      dimension: "",
      debit: "",
      credit: "1500.00",
      memo: "Vendor payment"
    },
  ];

  const totalDebit = journalEntries.reduce((sum, entry) => sum + (parseFloat(entry.debit) || 0), 0);
  const totalCredit = journalEntries.reduce((sum, entry) => sum + (parseFloat(entry.credit) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          padding: 2,
          boxShadow: 2,
          borderRadius: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Box>
          <PageTitle title={`View Journal Entry - ${reference ? reference.split("/")[0] : "N/A"}`} />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>

      {/* First Table: General Ledger Transaction Details */}
      <Paper sx={{ p: 2 }}>


        <TableContainer component={Paper} sx={{ p: 1 }}>
          <Table>
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>General Ledger Transaction Details</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Transaction Date</TableCell>
                <TableCell>Document Data</TableCell>
                <TableCell>Event Date</TableCell>
                <TableCell>GL #</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Bank Payment #{reference ? reference.split("/")[0] : "N/A"}</TableCell>
                <TableCell>{reference || "N/A"}</TableCell>
                <TableCell>{date || "N/A"}</TableCell>
                <TableCell>{date}</TableCell>
                <TableCell>{date}</TableCell>
                <TableCell>{reference ? reference.split("/")[0] : "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ backgroundColor: "#e8eaf6", fontWeight: "bold", textAlign: "left" }}>
                  Entered By
                </TableCell>
                <TableCell colSpan={3} sx={{ textAlign: "left" }}>
                  John Doe
                </TableCell>
                <TableCell sx={{ backgroundColor: "#e8eaf6", fontWeight: "bold", textAlign: "left" }}>
                  Source Document
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Second Table: Journal Entries */}
      <Paper sx={{ p: 2 }}>
        <TableContainer component={Paper} sx={{ p: 1 }}>
          <Table>
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Journal Date</TableCell>
                <TableCell>Account Code</TableCell>
                <TableCell>Account Name</TableCell>
                <TableCell>Dimension</TableCell>
                <TableCell align="right">Debit</TableCell>
                <TableCell align="right">Credit</TableCell>
                <TableCell>Memo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {journalEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.journalDate}</TableCell>
                  <TableCell>{entry.accountCode}</TableCell>
                  <TableCell>{entry.accountName}</TableCell>
                  <TableCell>{entry.dimension || "-"}</TableCell>
                  <TableCell align="right">{entry.debit || "-"}</TableCell>
                  <TableCell align="right">{entry.credit || "-"}</TableCell>
                  <TableCell>{entry.memo}</TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ backgroundColor: "#e8eaf6", borderTop: "2px solid #3f51b5" }}>
                <TableCell colSpan={4} sx={{ fontWeight: "bold" }}>
                  Total
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {totalDebit.toFixed(2)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {totalCredit.toFixed(2)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Print Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, p: 2 }}>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          Print
        </Button>
      </Box>
    </Stack>
  );
}
