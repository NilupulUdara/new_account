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
import { useQuery } from "@tanstack/react-query";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getShippingCompanies } from "../../../../api/ShippingCompany/ShippingCompanyApi";

export default function CustomerDelivery() {
  const navigate = useNavigate();

  // === Fields ===
  const [customer, setCustomer] = useState("John Traders Pvt Ltd");
  const [branch, setBranch] = useState("Main Branch");
  const [currency, setCurrency] = useState("LKR");
  const [currentCredit, setCurrentCredit] = useState(150000);
  const [reference, setReference] = useState("SO/2025/102");
  const [salesOrder, setSalesOrder] = useState("Sales Order #102");
  const [salesType, setSalesType] = useState("Cash");
  const [deliveryFrom, setDeliveryFrom] = useState("");
  const [shippingCompany, setShippingCompany] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [invoiceDeadline, setInvoiceDeadline] = useState("");
  const [memo, setMemo] = useState("");
  const [balanceAction, setBalanceAction] = useState("");

  const [rows, setRows] = useState([
    {
      id: 1,
      itemCode: "ITM-001",
      description: "Cement Bag 50kg",
      ordered: 100,
      units: "Bags",
      deliveryQty: 50,
      price: 1250,
      taxType: "VAT 15%",
      discount: 0,
      total: 62500,
    },
  ]);

  // === API Queries ===
  const { data: locations = [] } = useQuery({
    queryKey: ["inventoryLocations"],
    queryFn: getInventoryLocations,
  });

  const { data: shippingCompanies = [] } = useQuery({
    queryKey: ["shippingCompanies"],
    queryFn: getShippingCompanies,
  });

  // === Table totals ===
  const subTotal = rows.reduce((sum, r) => sum + r.total, 0);
  const includedTax = subTotal * 0.15;
  const [shippingCost, setShippingCost] = useState(0);
  const amountTotal = subTotal + shippingCost;

  const handleUpdate = () => alert("Delivery updated!");
  const handleClear = () => {
    setRows((prev) => prev.map((r) => ({ ...r, deliveryQty: 0 })));
  };
  const handleDispatch = () => alert("Dispatch processed successfully!");

  const breadcrumbItems = [
    { title: "Transactions", href: "/sales/transactions" },
    { title: "Deliver Items for a Sales Order" },
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
          <PageTitle title="Deliver Items for a Sales Order" />
          <Breadcrumb breadcrumbs={breadcrumbItems} />
        </Box>

        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>

      {/* Form */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Customer" value={customer} size="small" InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Branch" value={branch} size="small" InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Currency" value={currency} size="small" InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Current Credit" value={currentCredit} size="small" InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Reference" value={reference} size="small" InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="For Sales Order" value={salesOrder} size="small" InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Sales Type" value={salesType} size="small" InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Delivery From"
              value={deliveryFrom}
              onChange={(e) => setDeliveryFrom(e.target.value)}
              size="small"
            >
              {locations.map((loc: any) => (
                <MenuItem key={loc.loc_code} value={loc.loc_code}>
                  {loc.location_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Shipping Company"
              value={shippingCompany}
              onChange={(e) => setShippingCompany(e.target.value)}
              size="small"
            >
              {shippingCompanies.map((sc: any) => (
                <MenuItem key={sc.id} value={sc.id}>
                  {sc.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              type="date"
              label="Date"
              fullWidth
              size="small"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              type="date"
              label="Invoice Deadline"
              fullWidth
              size="small"
              value={invoiceDeadline}
              onChange={(e) => setInvoiceDeadline(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Items Table */}
      <Typography variant="subtitle1" sx={{ mb: 2, textAlign: "center" }}>
        Delivery Items
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
              <TableCell>This Delivery</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Tax Type</TableCell>
              <TableCell>Discount</TableCell>
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
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={row.deliveryQty}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setRows((prev) =>
                        prev.map((r) =>
                          r.id === row.id ? { ...r, deliveryQty: value, total: value * r.price } : r
                        )
                      );
                    }}
                  />
                </TableCell>
                <TableCell>{row.price}</TableCell>
                <TableCell>{row.taxType}</TableCell>
                <TableCell>{row.discount}%</TableCell>
                <TableCell>{row.total.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell colSpan={9}>Shipping Cost</TableCell>
              <TableCell>
                <TextField
                  size="small"
                  type="number"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(Number(e.target.value))}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={9} sx={{ fontWeight: 600 }}>
                Sub Total
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{subTotal.toFixed(2)}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={9} sx={{ fontWeight: 600 }}>
                Included Tax
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{includedTax.toFixed(2)}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={9} sx={{ fontWeight: 600 }}>
                Amount Total
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{amountTotal.toFixed(2)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      {/* Actions + Memo */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Action for Balance"
              value={balanceAction}
              onChange={(e) => setBalanceAction(e.target.value)}
              size="small"
            >
              <MenuItem value="Back Order">Back Order</MenuItem>
              <MenuItem value="Cancel Balance">Cancel Balance</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Memo"
              multiline
              rows={2}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleUpdate}>
            Update
          </Button>
          <Button variant="outlined" color="warning" onClick={handleClear}>
            Clear Quantity
          </Button>
          <Button variant="contained" color="success" onClick={handleDispatch}>
            Process Dispatch
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
