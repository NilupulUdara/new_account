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
  TableFooter,
  Paper,
  TextField,
  Typography,
  MenuItem,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";

export default function ReceivePurchaseOrderItems() {
  const navigate = useNavigate();

  // === Form Fields ===
  const [supplier] = useState("Tokyo Cement Suppliers");
  const [purchaseOrder] = useState("PO/2025/009");
  const [orderedOn] = useState("2025-01-20");
  const [reference] = useState("REF-PO-009");
  const [suppliersRef] = useState("SUP-9981");
  const [deliveryAddress] = useState("Warehouse No. 5, Colombo Port");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [dateReceived, setDateReceived] = useState(
    new Date().toISOString().split("T")[0]
  );

  const deliveryLocations = [
    { id: 1, name: "Colombo Main Store" },
    { id: 2, name: "Galle Sub Store" },
    { id: 3, name: "Kandy Warehouse" },
  ];

  // === Table Data ===
  const [rows, setRows] = useState([
    {
      id: 1,
      itemCode: "ITM-001",
      description: "Cement Bag 50kg",
      ordered: 100,
      units: "Bags",
      received: 40,
      outstanding: 60,
      thisDelivery: 0,
      price: 1250,
      total: 0,
    },
  ]);

  const subTotal = rows.reduce((sum, r) => sum + r.total, 0);
  const amountTotal = subTotal;

  const breadcrumbItems = [
    { title: "Purchases", href: "/purchases" },
    { title: "Receive Purchase Order Items" },
  ];

  const handleUpdate = () => alert("Items updated!");
  const handleProcessReceive = () =>
    alert("Purchase order items received successfully!");

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
          <PageTitle title="Receive Purchase Order Items" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>

      {/* Form Section */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          {/* Column 1: Supplier, For Purchase Order, Ordered On */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Supplier"
                value={supplier}
                size="small"
                InputProps={{ readOnly: true }}
              />
              <TextField
                fullWidth
                label="For Purchase Order"
                value={purchaseOrder}
                size="small"
                InputProps={{ readOnly: true }}
              />
              <TextField
                fullWidth
                label="Ordered On"
                value={orderedOn}
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Stack>
          </Grid>

          {/* Column 2: Reference, Deliver Into Location, Date Items Received */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Reference"
                value={reference}
                size="small"
                InputProps={{ readOnly: true }}
              />
              <TextField
                select
                fullWidth
                label="Deliver Into Location"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                size="small"
              >
                {deliveryLocations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                type="date"
                fullWidth
                label="Date Items Received"
                value={dateReceived}
                onChange={(e) => setDateReceived(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Grid>

          {/* Column 3: Supplier's Reference & Delivery Address */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Supplier's Reference & Delivery Address"
              value={`${suppliersRef} - ${deliveryAddress}`}
              size="small"
              InputProps={{ readOnly: true }}
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Items Table */}
      <Typography variant="subtitle1" sx={{ mb: 2, textAlign: "center" }}>
        Items to Receive
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Item Code</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Ordered</TableCell>
              <TableCell>Units</TableCell>
              <TableCell>Received</TableCell>
              <TableCell>Outstanding</TableCell>
              <TableCell>This Delivery</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.itemCode}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.ordered}</TableCell>
                <TableCell>{row.units}</TableCell>
                <TableCell>{row.received}</TableCell>
                <TableCell>{row.outstanding}</TableCell>

                {/* Editable Quantity */}
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={row.thisDelivery}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setRows((prev) =>
                        prev.map((r) =>
                          r.id === row.id
                            ? { ...r, thisDelivery: value, total: value * r.price }
                            : r
                        )
                      );
                    }}
                  />
                </TableCell>

                <TableCell>{row.price}</TableCell>
                <TableCell>{row.total.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell colSpan={9} sx={{ fontWeight: 600 }}>
                Sub Total
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                {subTotal.toFixed(2)}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={9} sx={{ fontWeight: 600 }}>
                Amount Total
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                {amountTotal.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      {/* Buttons */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button variant="contained" color="primary" onClick={handleUpdate}>
          Update
        </Button>
        <Button variant="contained" color="success" onClick={handleProcessReceive}>
          Process Receive Items
        </Button>
      </Box>
    </Stack>
  );
}
