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
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getShippingCompanies } from "../../../../api/ShippingCompany/ShippingCompanyApi";
import { getSalesOrderByOrderNo } from "../../../../api/SalesOrders/SalesOrdersApi";
import { getSalesOrderDetailsByOrderNo } from "../../../../api/SalesOrders/SalesOrderDetailsApi";
import { getCustomers } from "../../../../api/Customer/AddCustomerApi";
import { getBranches } from "../../../../api/CustomerBranch/CustomerBranchApi";
import { getSalesTypes } from "../../../../api/SalesMaintenance/salesService";
import { getItems } from "../../../../api/Item/ItemApi";
import { getItemUnits } from "../../../../api/ItemUnit/ItemUnitApi";
import { getItemTaxTypes } from "../../../../api/ItemTaxType/ItemTaxTypeApi";

export default function CustomerDelivery() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { orderNo } = state || {};

  // === State ===
  const [salesOrder, setSalesOrder] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // === Fields ===
  const [customer, setCustomer] = useState("");
  const [branch, setBranch] = useState("");
  const [currency, setCurrency] = useState("");
  const [currentCredit, setCurrentCredit] = useState(0);
  const [reference, setReference] = useState("");
  const [salesOrderValue, setSalesOrderValue] = useState("");
  const [salesType, setSalesType] = useState("");
  const [deliveryFrom, setDeliveryFrom] = useState("");
  const [shippingCompany, setShippingCompany] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [invoiceDeadline, setInvoiceDeadline] = useState("");
  const [memo, setMemo] = useState("");
  const [balanceAction, setBalanceAction] = useState("");

  const [rows, setRows] = useState<any[]>([]);

  // === API Queries ===
  const { data: locations = [] } = useQuery({
    queryKey: ["inventoryLocations"],
    queryFn: getInventoryLocations,
  });

  const { data: shippingCompanies = [] } = useQuery({
    queryKey: ["shippingCompanies"],
    queryFn: getShippingCompanies,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranches(),
  });

  const { data: salesTypes = [] } = useQuery({
    queryKey: ["salesTypes"],
    queryFn: getSalesTypes,
  });

  const { data: items = [] } = useQuery({
    queryKey: ["items"],
    queryFn: getItems,
  });

  const { data: itemUnits = [] } = useQuery({
    queryKey: ["itemUnits"],
    queryFn: getItemUnits,
  });

  const { data: itemTaxTypes = [] } = useQuery({
    queryKey: ["itemTaxTypes"],
    queryFn: getItemTaxTypes,
  });

  // Fetch sales order and details
  useEffect(() => {
    const fetchData = async () => {
      if (!orderNo) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [orderData, detailsData] = await Promise.all([
          getSalesOrderByOrderNo(orderNo),
          getSalesOrderDetailsByOrderNo(orderNo),
        ]);
        setSalesOrder(orderData);
        setOrderDetails(detailsData || []);
      } catch (error) {
        console.error("Error fetching sales order data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderNo]);

  // Set fields based on salesOrder
  useEffect(() => {
    if (salesOrder) {
      const customerData = customers.find((c: any) => String(c.debtor_no) === String(salesOrder.debtor_no));
      const branchData = branches.find((b: any) => String(b.branch_code) === String(salesOrder.deliver_to));
      const salesTypeData = salesTypes.find((st: any) => String(st.id) === String(salesOrder.order_type));

      setCustomer(customerData?.name || "");
      setBranch(branchData?.br_name || "");
      setCurrency(customerData?.curr_code || "");
      setCurrentCredit(customerData?.credit_limit || 0);
      setReference(salesOrder.reference || "");
      setSalesOrderValue(`${orderNo}`);
      setSalesType(salesTypeData?.typeName || "");
      setDeliveryFrom(salesOrder.from_stk_loc || "");
      // shippingCompany remains empty or set if available
      // invoiceDeadline remains empty or set from payment terms if needed
    }
  }, [salesOrder, customers, branches, salesTypes, orderNo]);

  // Set rows from orderDetails
  useEffect(() => {
    if (orderDetails.length > 0) {
      const newRows = orderDetails.map((detail: any, index: number) => {
        const itemData = items.find((i: any) => i.stock_id === detail.stk_code);
        const unitData = itemUnits.find((u: any) => u.id === itemData?.units);
        const unitName = unitData?.abbr || detail.units || "";
        const price = parseFloat(detail.unit_price || 0);
        const qty = parseFloat(detail.quantity || 0);
        const discountPercent = parseFloat(detail.discount_percent || 0);
        const discountedPrice = price * (1 - discountPercent / 100);
        const total = discountedPrice * qty;
        const taxTypeData = itemTaxTypes.find((t: any) => String(t.id) === String(itemData?.tax_type_id));

        return {
          id: index + 1,
          itemCode: detail.stk_code || "",
          description: detail.description || "",
          ordered: qty,
          units: unitName,
          deliveryQty: 0, // start with 0
          price: price,
          taxType: taxTypeData?.name || "VAT 15%",
          discount: discountPercent,
          total: total,
        };
      });
      setRows(newRows);
    }
  }, [orderDetails, items, itemUnits, itemTaxTypes]);

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
    { title: `Deliver Items for Sales Order #${orderNo || ""}` },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

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
          {/* Column 1 */}
          <Grid item xs={3}>
            <TextField fullWidth label="Customer" value={customer} size="small" InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={3}>
            <TextField fullWidth label="Reference" value={reference} size="small" InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={3}>
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

          {/* Column 2 */}
          <Grid item xs={3}>
            <TextField fullWidth label="Branch" value={branch} size="small" InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={3}>
            <TextField fullWidth label="For Sales Order" value={salesOrderValue} size="small" InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={3}>
            <TextField
              select
              fullWidth
              label="Shipping Company"
              value={shippingCompany}
              onChange={(e) => setShippingCompany(e.target.value)}
              size="small"
            >
              {shippingCompanies.map((sc: any) => (
                <MenuItem key={sc.shipper_id} value={sc.shipper_id}>
                  {sc.shipper_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Column 3 */}
          <Grid item xs={3}>
            <TextField fullWidth label="Currency" value={currency} size="small" InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={3}>
            <TextField fullWidth label="Sales Type" value={salesType} size="small" InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={3}>
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

          {/* Column 4 */}
          <Grid item xs={3}>
            <TextField fullWidth label="Current Credit" value={currentCredit} size="small" InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={3}>
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
              <MenuItem value="Back Order">Automatically put balance on back order</MenuItem>
              <MenuItem value="Cancel Balance">Cancel any quantities not delivered</MenuItem>
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
