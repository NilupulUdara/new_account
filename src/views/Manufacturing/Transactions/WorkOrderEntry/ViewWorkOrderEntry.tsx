import React, { useState } from "react";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Stack, Button } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";

export default function ViewWorkOrderEntry() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { reference } = state || {};

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Work Order" },
  ];

  const workOrderData = [
    {
      id: 1,
      reference: "001/2022",
      type: "Assemble",
      manufacturedItem: "item1",
      intoLocation: "Colombo",
      date: "12/12/2022",
      quantity: 10
    }
  ];

  // Dummy work order requirements data
  const workOrderRequirements = [
    {
      id: 1,
      component: "Component A",
      fromLocation: "Warehouse A",
      workCentre: "Assembly Line 1",
      unitQuantity: 2,
      totalQuantity: 20,
      unitsIssued: 15,
      onHand: 5
    },
    {
      id: 2,
      component: "Component B",
      fromLocation: "Warehouse B",
      workCentre: "Assembly Line 2",
      unitQuantity: 1,
      totalQuantity: 10,
      unitsIssued: 8,
      onHand: 2
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
          <PageTitle title={`View Work Order - ${reference || "N/A"}`} />
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
                <TableCell>Type</TableCell>
                <TableCell>Manufactured Item</TableCell>
                <TableCell>Into Location</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Quantity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workOrderData.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.reference}</TableCell>
                  <TableCell>{order.type}</TableCell>
                  <TableCell>{order.manufacturedItem}</TableCell>
                  <TableCell>{order.intoLocation}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Second Table: Work Order Requirements */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Work Order Requirements
        </Typography>
        <TableContainer component={Paper} sx={{ p: 1 }}>
          <Table>
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Component</TableCell>
                <TableCell>From Location</TableCell>
                <TableCell>Work Centre</TableCell>
                <TableCell align="right">Unit Quantity</TableCell>
                <TableCell align="right">Total Quantity</TableCell>
                <TableCell align="right">Units Issued</TableCell>
                <TableCell align="right">On Hand</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workOrderRequirements.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>{req.component}</TableCell>
                  <TableCell>{req.fromLocation}</TableCell>
                  <TableCell>{req.workCentre}</TableCell>
                  <TableCell align="right">{req.unitQuantity}</TableCell>
                  <TableCell align="right">{req.totalQuantity}</TableCell>
                  <TableCell align="right">{req.unitsIssued}</TableCell>
                  <TableCell align="right">{req.onHand}</TableCell>
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
