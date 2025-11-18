import React, { useState } from "react";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Stack, Button } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";

export default function ViewGLJournalEntry() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { reference } = state || {};

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Work Order Entry" },
  ];

  // Dummy work order data
  const workOrderData = [
    {
      id: 2,
      reference: "002/2022",
      manufacturedItem: "item2",
      intoLocation: "colombo",
      date: "11/18/2022",
      requiredBy: "12/31/2022",
      quantityRequired: 5,
      releasedDate: "11/10/2022",
      manufactured: 10
    }
  ];

  // Dummy GL journal entries data
  const glJournalEntries = [
    {
      id: 1,
      date: "12/31/2022",
      transaction: "work order production 1",
      accountCode: "1510",
      accountName: "Inventory",
      debit: "",
      credit: "500.00",
      memo: ""
    },
    {
      id: 2,
      date: "12/31/2022",
      transaction: "work order 6",
      accountCode: "1530",
      accountName: "stock",
      debit: "",
      credit: "600",
      memo: ""
    }
  ];

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
          <PageTitle title={`Production Costs for Work Order # - ${reference || "N/A"}`} />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>

      {/* First Table: Work Order Details */}
      <Paper sx={{ p: 2 }}>
        <TableContainer component={Paper} sx={{ p: 1 }}>
          <Table>
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Manufactured Item</TableCell>
                <TableCell>Into Location</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Required By</TableCell>
                <TableCell>Quantity Required</TableCell>
                <TableCell>Released Date</TableCell>
                <TableCell>Manufactured</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workOrderData.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.reference}</TableCell>
                  <TableCell>{order.manufacturedItem}</TableCell>
                  <TableCell>{order.intoLocation}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.requiredBy}</TableCell>
                  <TableCell>{order.quantityRequired}</TableCell>
                  <TableCell>{order.releasedDate}</TableCell>
                  <TableCell>{order.manufactured}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Second Table: GL Journal Entries */}
      <Paper sx={{ p: 2 }}>
        <TableContainer component={Paper} sx={{ p: 1 }}>
          <Table>
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Transaction</TableCell>
                <TableCell>Account Code</TableCell>
                <TableCell>Account Name</TableCell>
                <TableCell align="right">Debit</TableCell>
                <TableCell align="right">Credit</TableCell>
                <TableCell>Memo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow sx={{ backgroundColor: "#e8eaf6" }}>
                <TableCell colSpan={7} sx={{ fontWeight: "bold", textAlign: "center" }}>
                  Finished Product Requirements
                </TableCell>
              </TableRow>
              {glJournalEntries.slice(0, 1).map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.transaction}</TableCell>
                  <TableCell>{entry.accountCode}</TableCell>
                  <TableCell>{entry.accountName}</TableCell>
                  <TableCell align="right">{entry.debit || "-"}</TableCell>
                  <TableCell align="right">{entry.credit || "-"}</TableCell>
                  <TableCell>{entry.memo || "-"}</TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ backgroundColor: "#e8eaf6" }}>
                <TableCell colSpan={7} sx={{ fontWeight: "bold", textAlign: "center" }}>
                  Finished Product Recieval
                </TableCell>
              </TableRow>
              {glJournalEntries.slice(1, 2).map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.transaction}</TableCell>
                  <TableCell>{entry.accountCode}</TableCell>
                  <TableCell>{entry.accountName}</TableCell>
                  <TableCell align="right">{entry.debit || "-"}</TableCell>
                  <TableCell align="right">{entry.credit || "-"}</TableCell>
                  <TableCell>{entry.memo || "-"}</TableCell>
                </TableRow>
              ))}
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
