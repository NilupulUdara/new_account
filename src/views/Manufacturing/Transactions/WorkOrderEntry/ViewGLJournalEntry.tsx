import React from "react";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Stack, Button } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";
import { useQuery } from "@tanstack/react-query";
import { getWorkOrders } from "../../../../api/WorkOrders/WorkOrderApi";
import { getItems } from "../../../../api/Item/ItemApi";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";

export default function ViewGLJournalEntry() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { reference } = state || {};

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Work Order Entry" },
  ];

  // Load work orders and find the matching record by reference
  const { data: workOrders = [] } = useQuery({ queryKey: ["workOrders"], queryFn: getWorkOrders });

  // Also load items and locations so we can show friendly names instead of codes
  const { data: items = [] } = useQuery({ queryKey: ["items"], queryFn: getItems });
  const { data: locations = [] } = useQuery({ queryKey: ["inventoryLocations"], queryFn: getInventoryLocations });

  const matched = (workOrders || []).find((w: any) => {
    const ref = String(w.wo_ref ?? w.reference ?? "");
    return reference ? ref === String(reference) : false;
  });

  const workOrderData = matched
    ? [
        (() => {
          // resolve item description
          const stockKey = String(matched.stock_id ?? matched.stock ?? matched.item_id ?? "");
          const itemRec = (items || []).find((it: any) => String(it.stock_id ?? it.id ?? it.stock_master_id ?? it.item_id ?? "") === stockKey);

          // resolve location name
          const locKey = String(matched.loc_code ?? matched.location ?? matched.loc ?? "");
          const locRec = (locations || []).find((l: any) => String(l.loc_code ?? l.loccode ?? l.code ?? "") === locKey);

          return {
            id: matched.id ?? matched.wo_id ?? "-",
            reference: matched.wo_ref ?? matched.reference ?? reference ?? "-",
            manufacturedItem: itemRec ? (itemRec.description ?? itemRec.item_name ?? itemRec.name ?? String(stockKey)) : (matched.stock_description ?? matched.item_description ?? String(stockKey)),
            intoLocation: locRec ? (locRec.location_name ?? String(locKey)) : (matched.loc_name ?? matched.location_name ?? String(locKey)),
            date: matched.date ? String(matched.date).split("T")[0] : matched.tran_date ?? "-",
            requiredBy: matched.required_by ?? matched.date_required_by ?? "-",
            quantityRequired: matched.units_reqd ?? matched.quantity ?? matched.units_required ?? 0,
            releasedDate: matched.released_date ?? matched.releasedDate ?? "-",
            manufactured: matched.units_issued ?? matched.unitsIssued ?? 0,
          };
        })(),
      ]
    : [];

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
