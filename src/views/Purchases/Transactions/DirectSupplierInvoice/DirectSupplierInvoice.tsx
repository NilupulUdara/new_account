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
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";
import { getSuppliers } from "../../../../api/Supplier/SupplierApi";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getTags } from "../../../../api/DimensionTag/DimensionTagApi";
import { getItems } from "../../../../api/Item/ItemApi";
import { getItemUnits } from "../../../../api/ItemUnit/ItemUnitApi";
import { getPaymentTypes } from "../../../../api/PaymentType/PaymentTypeApi";

export default function DirectSupplierInvoice() {
  const navigate = useNavigate();

  // ========= Form Fields =========
  const [supplier, setSupplier] = useState(0);
  const [supplierRef, setSupplierRef] = useState("");
  const [deliverTo, setDeliverTo] = useState("");
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dimension, setDimension] = useState(0);
  const [credit, setCredit] = useState(0);
  const [receiveInto, setReceiveInto] = useState(0);
  const [reference, setReference] = useState("");

  const [memo, setMemo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(0);

  // API data states
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [items, setItems] = useState([]);
  const [itemUnits, setItemUnits] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);

  // ========= Generate Reference =========
  useEffect(() => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    setReference(`PO-${random}/${year}`);
  }, []);

  // ========= Update Credit When Supplier Changes =========
  useEffect(() => {
    const selected = suppliers.find((s) => s.id === supplier);
    setCredit(selected ? selected.credit_limit || selected.credit : 0);
  }, [supplier, suppliers]);

  // ========= Fetch API Data =========
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersData, locationsData, dimensionsData, itemsData, itemUnitsData, paymentTypesData] = await Promise.all([
          getSuppliers(),
          getInventoryLocations(),
          getTags(),
          getItems(),
          getItemUnits(),
          getPaymentTypes(),
        ]);
        setSuppliers(suppliersData);
        setLocations(locationsData);
        setDimensions(dimensionsData);
        setItems(itemsData);
        setItemUnits(itemUnitsData);
        setPaymentTypes(paymentTypesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // ========= Table Rows =========
  const [rows, setRows] = useState([
    {
      id: 1,
      itemId: 0,
      itemCode: "",
      description: "",
      quantity: 0,
      unit: "",
      price: 0,
      total: 0,
    },
  ]);

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        itemId: 0,
        itemCode: "",
        description: "",
        quantity: 0,
        unit: "",
        price: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveRow = (id) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleChange = (id, field, value) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              [field]: value,
              total:
                field === "quantity" || field === "price"
                  ? (field === "quantity" ? value : r.quantity) *
                    (field === "price" ? value : r.price)
                  : r.total,
            }
          : r
      )
    );
  };

  // ========= Subtotal =========
  const subTotal = rows.reduce((sum, r) => sum + r.total, 0);

  // ========= Place Order =========
  const handlePlaceOrder = () => {
    alert("Purchase Order Placed!");
    navigate(-1);
  };

  const breadcrumbItems = [
    { title: "Purchases", href: "/purchases" },
    { title: "Direct Purchase Invoice Entry" },
  ];

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
          <PageTitle title="Direct Purchase Invoice Entry" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>

      {/* Form Fields */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <TextField select fullWidth label="Supplier" size="small" value={supplier} onChange={(e) => setSupplier(Number(e.target.value))}>
                {suppliers.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.supp_name || s.name}</MenuItem>
                ))}
              </TextField>

              <TextField label="Order Date" type="date" fullWidth size="small" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} InputLabelProps={{ shrink: true }} />

              <TextField label="Current Credit" fullWidth size="small" value={credit} InputProps={{ readOnly: true }} />

              <TextField label="Reference" fullWidth size="small" value={reference} InputProps={{ readOnly: true }} />
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <TextField label="Supplier's Reference" fullWidth size="small" value={supplierRef} onChange={(e) => setSupplierRef(e.target.value)} />

              <TextField label="Due Date" type="date" fullWidth size="small" value={dueDate} onChange={(e) => setDueDate(e.target.value)} InputLabelProps={{ shrink: true }} />

              <TextField select fullWidth label="Dimension" size="small" value={dimension} onChange={(e) => setDimension(Number(e.target.value))}>
                {dimensions.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                ))}
              </TextField>

              <TextField select fullWidth label="Receive Into" size="small" value={receiveInto} onChange={(e) => setReceiveInto(Number(e.target.value))}>
                {locations.map((l) => (
                  <MenuItem key={l.id} value={l.id}>{l.location_name}</MenuItem>
                ))}
              </TextField>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField label="Deliver To" fullWidth size="small" multiline rows={3} value={deliverTo} onChange={(e) => setDeliverTo(e.target.value)} />
          </Grid>
        </Grid>
      </Paper>

      {/* Order Items Table */}
      <Typography variant="subtitle1" sx={{ mb: 1, textAlign: "center" }}>
        Order Items
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Item Code</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Price Before Tax</TableCell>
              <TableCell>Line Total</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={row.id}>
                <TableCell>{i + 1}</TableCell>

                {/* Item Code */}
                <TableCell>
                  <TextField size="small" value={row.itemCode} InputProps={{ readOnly: true }} />
                </TableCell>

                {/* Description */}
                <TableCell>
                  <TextField
                    select
                    size="small"
                    value={row.description}
                    onChange={(e) => {
                      const selected = items.find((it) => it.description === e.target.value);
                      handleChange(row.id, "description", e.target.value);
                      if (selected) {
                        const unitObj = itemUnits.find((u) => u.id === selected.units);
                        handleChange(row.id, "itemId", selected.id);
                        handleChange(row.id, "itemCode", selected.stock_id);
                        handleChange(row.id, "unit", unitObj ? unitObj.abbr : selected.units);
                        handleChange(row.id, "price", selected.material_cost);
                      }
                    }}
                  >
                    {items.map((it) => (
                      <MenuItem key={it.id} value={it.description}>{it.description}</MenuItem>
                    ))}
                  </TextField>
                </TableCell>

                {/* Quantity */}
                <TableCell>
                  <TextField size="small" type="number" value={row.quantity} onChange={(e) => handleChange(row.id, "quantity", Number(e.target.value))} />
                </TableCell>

                {/* Unit */}
                <TableCell>
                  <TextField size="small" value={row.unit} InputProps={{ readOnly: true }} />
                </TableCell>

                {/* Price Before Tax */}
                <TableCell>
                  <TextField size="small" type="number" value={row.price} onChange={(e) => handleChange(row.id, "price", Number(e.target.value))} />
                </TableCell>

                {/* Line Total */}
                <TableCell>{row.total.toFixed(2)}</TableCell>

                {/* Actions */}
                <TableCell align="center">
                  {i === rows.length - 1 ? (
                    <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleAddRow}>
                      Add
                    </Button>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => alert(`Edit row ${row.id}`)}>
                        Edit
                      </Button>
                      <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => handleRemoveRow(row.id)}>
                        Delete
                      </Button>
                    </Stack>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell colSpan={6} sx={{ fontWeight: 600 }}>
                Sub-total
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{subTotal.toFixed(2)}</TableCell>
              <TableCell></TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={6} sx={{ fontWeight: 600 }}>
                Amount Total
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{subTotal.toFixed(2)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      {/* Payment Section */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Payment
        </Typography>
        <TextField
          select
          fullWidth
          label="Payment Method"
          size="small"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(Number(e.target.value))}
        >
          {paymentTypes.map((pt) => (
            <MenuItem key={pt.id} value={pt.id}>
              {pt.name}
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      {/* Memo Section */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Memo
        </Typography>
        <TextField fullWidth multiline rows={3} value={memo} onChange={(e) => setMemo(e.target.value)} />

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Cancel Invoice
          </Button>
          <Button variant="contained" color="primary" onClick={handlePlaceOrder}>
            Process Invoice
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
