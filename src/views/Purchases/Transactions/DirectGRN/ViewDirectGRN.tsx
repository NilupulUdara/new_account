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
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";
import { useNavigate } from "react-router-dom";

import { getSuppliers } from "../../../../api/Supplier/SupplierApi";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getTags } from "../../../../api/DimensionTag/DimensionTagApi";
import { getItems } from "../../../../api/Item/ItemApi";
import { getItemUnits } from "../../../../api/ItemUnit/ItemUnitApi";

export default function ViewDirectGRN() {
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState(0);
  const [supplierRef, setSupplierRef] = useState("");
  const [deliverTo, setDeliverTo] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [dimension, setDimension] = useState(0);
  const [credit, setCredit] = useState(0);
  const [receiveInto, setReceiveInto] = useState(0);
  const [reference, setReference] = useState("");

  const [memo, setMemo] = useState("");

  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [items, setItems] = useState([]);
  const [itemUnits, setItemUnits] = useState([]);

  // ===== Example row data for view mode =====
  const [rows, setRows] = useState([
    {
      id: 1,
      itemId: 1,
      itemCode: "ITM-001",
      description: "Test Item",
      quantity: 10,
      unit: "PCS",
      price: 150,
      requestedBy: "Manager",
      qtyReceived: 0,
      qtyInvoiced: 0,
      total: 1500,
    },
  ]);

  const subTotal = rows.reduce((sum, r) => sum + r.total, 0);

  const breadcrumbItems = [
    { title: "Purchases", href: "/purchases" },
    { title: "Purchase Order Delivery" },
  ];

  // Fetch API Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          suppliersData,
          locationsData,
          dimensionsData,
          itemsData,
          itemUnitsData,
        ] = await Promise.all([
          getSuppliers(),
          getInventoryLocations(),
          getTags(),
          getItems(),
          getItemUnits(),
        ]);

        setSuppliers(suppliersData);
        setLocations(locationsData);
        setDimensions(dimensionsData);
        setItems(itemsData);
        setItemUnits(itemUnitsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

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
        }}
      >
        <Box>
          <PageTitle title="Purchase Order Delivery" />
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

      {/* Form Fields - Now as Table */}
      <TableContainer component={Paper} sx={{ p: 2 }}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: '30%' }}>Reference</TableCell>
              <TableCell>{reference}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Delivery Date</TableCell>
              <TableCell>{orderDate}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Delivery Address</TableCell>
              <TableCell sx={{ whiteSpace: 'pre-wrap' }}>{deliverTo}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Supplier</TableCell>
              <TableCell>{suppliers.find(s => s.id === supplier)?.supp_name || suppliers.find(s => s.id === supplier)?.name || ''}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Deliver Into Location</TableCell>
              <TableCell>{locations.find(l => l.id === receiveInto)?.location_name || ''}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Supplier's Reference</TableCell>
              <TableCell>{supplierRef}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>For Purchase Order</TableCell>
              <TableCell>{reference}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Table Title */}
      <Typography variant="subtitle1" sx={{ mb: 1, textAlign: "center" }}>
        Line Detail
      </Typography>

      {/* Line Detail Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>Item Code</TableCell>
              <TableCell>Item Description</TableCell>
              <TableCell>Required by</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Line Total</TableCell>
              <TableCell>Quantity Invoiced</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={row.id}>
                <TableCell>{row.itemCode}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.requestedBy}</TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>{row.unit}</TableCell>
                <TableCell>{row.price}</TableCell>
                <TableCell>{row.total.toFixed(2)}</TableCell>
                <TableCell>{row.qtyInvoiced}</TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell colSpan={6} sx={{ fontWeight: 600 }}>
                Sub-total
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                {subTotal.toFixed(2)}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={6} sx={{ fontWeight: 600 }}>
                Amount Total
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                {subTotal.toFixed(2)}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      {/* Memo Section */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1">Memo</Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          size="small"
          value={memo}
          InputProps={{ readOnly: true }}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
          <Button variant="outlined" onClick={() => window.print()}>
            Print
          </Button>

          <Button variant="contained" onClick={() => navigate(-1)}>
            Close
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
