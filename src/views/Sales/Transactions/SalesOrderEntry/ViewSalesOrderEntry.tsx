import React, { useMemo, useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Button,
  Grid,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";
import { getCustomers } from "../../../../api/Customer/AddCustomerApi";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getSalesOrderByOrderNo, getSalesOrders } from "../../../../api/SalesOrders/SalesOrdersApi";
import { getSalesOrderDetailsByOrderNo } from "../../../../api/SalesOrders/SalesOrderDetailsApi";
import { getTaxGroupItemsByGroupId } from "../../../../api/Tax/TaxGroupItemApi";
import { getTaxTypes } from "../../../../api/Tax/taxServices";
import { getPaymentTerms } from "../../../../api/PaymentTerm/PaymentTermApi";
import { getBranches } from "../../../../api/CustomerBranch/CustomerBranchApi";
import { getSalesTypes } from "../../../../api/SalesMaintenance/salesService";
import { getItems } from "../../../../api/Item/ItemApi";
import { getItemUnits } from "../../../../api/ItemUnit/ItemUnitApi";
import { getDebtorTrans } from "../../../../api/DebtorTrans/DebtorTransApi";

export default function ViewSalesOrderEntry() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { orderNo } = state || {};

  const [salesOrder, setSalesOrder] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [taxGroupItems, setTaxGroupItems] = useState<any[]>([]);

  // Fetch customers for display
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  // Fetch branches for tax group
  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranches(),
  });

  // Fetch inventory locations for display
  const { data: locations = [] } = useQuery({
    queryKey: ["inventoryLocations"],
    queryFn: getInventoryLocations,
  });

  // Fetch payment terms for display
  const { data: paymentTerms = [] } = useQuery({
    queryKey: ["paymentTerms"],
    queryFn: getPaymentTerms,
  });

  // Fetch price lists for tax inclusion check
  const { data: priceLists = [] } = useQuery({
    queryKey: ["priceLists"],
    queryFn: getSalesTypes,
  });

  // Fetch tax types for tax calculations
  const { data: taxTypes = [] } = useQuery({
    queryKey: ["taxTypes"],
    queryFn: getTaxTypes,
  });

  // Fetch items for unit lookup
  const { data: items = [] } = useQuery({
    queryKey: ["items"],
    queryFn: getItems,
  });

  // Fetch item units for unit name lookup
  const { data: itemUnits = [] } = useQuery({
    queryKey: ["itemUnits"],
    queryFn: getItemUnits,
  });

  // Fetch all sales orders for deliveries
  const { data: allSalesOrders = [] } = useQuery({
    queryKey: ["allSalesOrders"],
    queryFn: getSalesOrders,
  });

  // Fetch debtor transactions for invoices
  const { data: debtorTrans = [] } = useQuery({
    queryKey: ["debtorTrans"],
    queryFn: getDebtorTrans,
  });

  // Fetch sales order and details from backend
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

  // Fetch tax group items when sales order is loaded
  useEffect(() => {
    if (salesOrder?.branch_code) {
      const selectedBranch = branches.find((b: any) => b.branch_code === salesOrder.branch_code);
      if (selectedBranch?.tax_group) {
        getTaxGroupItemsByGroupId(selectedBranch.tax_group)
          .then((items) => setTaxGroupItems(items))
          .catch((err) => {
            console.error("Failed to fetch tax group items:", err);
            setTaxGroupItems([]);
          });
      } else {
        setTaxGroupItems([]);
      }
    } else {
      setTaxGroupItems([]);
    }
  }, [salesOrder, branches]);

  // Resolve customer and location names
  const customerName = useMemo(() => {
    const customerId = salesOrder?.debtor_no;
    if (!customerId) return "-";
    const found = (customers || []).find(
      (c: any) => String(c.debtor_no) === String(customerId)
    );
    return found ? found.name : "-";
  }, [customers, salesOrder]);

  const deliverFromName = useMemo(() => {
    const deliverFromLocation = salesOrder?.from_stk_loc;
    if (!deliverFromLocation) return "-";
    const found = (locations || []).find(
      (l: any) => String(l.loc_code) === String(deliverFromLocation)
    );
    return found ? found.location_name : deliverFromLocation;
  }, [locations, salesOrder]);

  const paymentTermName = useMemo(() => {
    const paymentTermId = salesOrder?.payment_terms;
    if (!paymentTermId) return "-";
    const found = (paymentTerms || []).find(
      (pt: any) => String(pt.terms_indicator) === String(paymentTermId)
    );
    return found ? found.description : "-";
  }, [paymentTerms, salesOrder]);

  // Resolve customer currency
  const customerCurrency = useMemo(() => {
    const customerId = salesOrder?.debtor_no;
    if (!customerId) return "-";
    const found = (customers || []).find(
      (c: any) => String(c.debtor_no) === String(customerId)
    );
    return found ? found.curr_code || "-" : "-";
  }, [customers, salesOrder]);

  // Get totals from sales order
  const totalAmount = useMemo(() => {
    return salesOrder?.total ? parseFloat(salesOrder.total).toFixed(2) : "0.00";
  }, [salesOrder]);

  // Calculate subtotal from order details for display
  const subtotal = useMemo(() => {
    return orderDetails.reduce((sum, item) => sum + (parseFloat(item.unit_price || 0) * parseFloat(item.quantity || 0) * (1 - parseFloat(item.discount_percent || 0) / 100)), 0).toFixed(2);
  }, [orderDetails]);

  // Determine if prices include tax
  const selectedPriceList = useMemo(() => {
    return priceLists.find((pl: any) => String(pl.id) === String(salesOrder?.order_type));
  }, [priceLists, salesOrder]);

  // Calculate taxes
  const taxCalculations = useMemo(() => {
    if (taxGroupItems.length === 0) {
      return [];
    }

    // Calculate tax amounts for each tax type
    return taxGroupItems.map((item: any) => {
      const taxTypeData = taxTypes.find((t: any) => t.id === item.tax_type_id);
      const taxRate = taxTypeData?.default_rate || 0;
      const taxName = taxTypeData?.description || "Tax";

      let taxAmount = 0;
      if (selectedPriceList?.taxIncl) {
        // For prices that include tax, we need to extract the tax amount
        // Tax amount = subtotal - (subtotal / (1 + rate/100))
        taxAmount = parseFloat(subtotal) - (parseFloat(subtotal) / (1 + taxRate / 100));
      } else {
        // For prices that don't include tax, calculate tax on subtotal
        // Tax amount = subtotal * (rate/100)
        taxAmount = parseFloat(subtotal) * (taxRate / 100);
      }

      return {
        name: taxName,
        rate: taxRate,
        amount: taxAmount,
      };
    });
  }, [selectedPriceList, taxGroupItems, taxTypes, subtotal]);

  const totalTaxAmount = taxCalculations.reduce((sum, tax) => sum + tax.amount, 0);

  // Filter deliveries and invoices related to this order
  const deliveries = useMemo(() => {
    return allSalesOrders.filter((so: any) => so.trans_type == 13 && so.order_ == orderNo);
  }, [allSalesOrders, orderNo]);

  const invoices = useMemo(() => {
    return debtorTrans.filter((dt: any) => dt.type == 10 && dt.order_ == orderNo);
  }, [debtorTrans, orderNo]);

  const creditNotes = useMemo(() => {
    return debtorTrans.filter((dt: any) => dt.type == 11 && dt.order_ == orderNo);
  }, [debtorTrans, orderNo]);

  // Order information variables
  const customerRef = salesOrder?.customer_ref;
  const deliverToBranch = salesOrder?.deliver_to;
  const orderedOn = salesOrder?.ord_date;
  const deliverFrom = deliverFromName;
  const paymentTerm = paymentTermName;
  const deliveryAddress = salesOrder?.delivery_address;
  const reference = salesOrder?.reference;
  const telephone = salesOrder?.contact_phone;
  const email = salesOrder?.contact_email;
  const comments = salesOrder?.comments;

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Sales Orders" },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!salesOrder) {
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
          }}
        >
          <Typography>Sales order not found</Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </Box>
      </Stack>
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
          flexWrap: "wrap",
        }}
      >
        <Box>
          <PageTitle title={`Sales Order #${orderNo}`} />
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

      {/* Order Info, Deliveries, Invoices */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {/* Order Information */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: "var(--pallet-dark-blue)" }}
            >
              Order Information
            </Typography>
            <Typography><b>Customer Name:</b> {customerName}</Typography>
            <Typography>
              <b>Customer Ref:</b> {customerRef || "-"}
              &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
              <b>Deliver To Branch:</b> {deliverToBranch || "-"}
            </Typography>
            <Typography>
              <b>Ordered On:</b> {orderedOn || "-"}
              &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
              <b>Deliver From:</b> {deliverFrom || "-"}
            </Typography>
            <Typography><b>Payment Terms:</b> {paymentTerm || "-"}</Typography>
            <Typography><b>Delivery Address:</b> {deliveryAddress || "-"}</Typography>
            <Typography><b>Reference:</b> {reference || "-"}</Typography>
            <Typography><b>Telephone:</b> {telephone || "-"}</Typography>
            <Typography><b>Email:</b> {email || "-"}</Typography>
            <Typography><b>Comments:</b> {comments || "-"}</Typography>
          </Grid>

          {/* Deliveries */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: "var(--pallet-dark-blue)" }}
            >
              Deliveries
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Ref</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deliveries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>No deliveries</TableCell>
                    </TableRow>
                  ) : (
                    deliveries.map((d: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{d.ref ?? d.reference ?? "-"}</TableCell>
                        <TableCell>{d.date ?? d.ord_date ?? "-"}</TableCell>
                        <TableCell>{d.total ?? "0.00"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Invoices / Credits */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{ mb: 1, fontWeight: 600, color: "var(--pallet-dark-blue)" }}
            >
              Invoices / Credits
            </Typography>

            {/* Sales Table */}
            <Typography sx={{ fontWeight: 600, mb: 1 }}>Sales</Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Ref</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>No invoices</TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((inv: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{inv.ref ?? inv.reference ?? "-"}</TableCell>
                        <TableCell>{inv.date ?? inv.tran_date ?? "-"}</TableCell>
                        <TableCell>{inv.total ?? inv.ov_amount ?? "0.00"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Credit Notes Table */}
            <Typography sx={{ fontWeight: 600, mb: 1 }}>Credit Notes</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Ref</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {creditNotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>No credit notes</TableCell>
                    </TableRow>
                  ) : (
                    creditNotes.map((cr: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{cr.ref ?? cr.reference ?? "-"}</TableCell>
                        <TableCell>{cr.date ?? cr.tran_date ?? "-"}</TableCell>
                        <TableCell>{cr.total ?? cr.ov_amount ?? "0.00"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Paper>

      {/* Items Table */}
      <Paper sx={{ p: 2 }}>
        <Typography sx={{ mb: 1, fontWeight: 600 }}>Line Details</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Item Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Quantity Delivered</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderDetails.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>No items available</TableCell>
                </TableRow>
              ) : (
                orderDetails.map((item: any, idx: number) => {
                  const itemTotal = (parseFloat(item.unit_price || 0) * parseFloat(item.quantity || 0) * (1 - parseFloat(item.discount_percent || 0) / 100)).toFixed(2);
                  const itemData = items.find((i: any) => i.stock_id === item.stk_code);
                  const unitData = itemUnits.find((u: any) => u.id === itemData?.units);
                  const unitName = unitData?.abbr || item.units || "-";
                  return (
                    <TableRow key={idx}>
                      <TableCell>{item.stk_code || "-"}</TableCell>
                      <TableCell>{item.description || "-"}</TableCell>
                      <TableCell>{item.quantity || "-"}</TableCell>
                      <TableCell>{unitName}</TableCell>
                      <TableCell>{item.unit_price || "-"}</TableCell>
                      <TableCell>{item.discount_percent ? `${item.discount_percent}%` : "-"}</TableCell>
                      <TableCell>{itemTotal}</TableCell>
                      <TableCell>{item.qty_sent || "0"}</TableCell>
                    </TableRow>
                  );
                })
              )}
              <TableRow>
                <TableCell colSpan={5}></TableCell>
                <TableCell>Subtotal</TableCell>
                <TableCell>{subtotal}</TableCell>
                <TableCell></TableCell>
              </TableRow>

              {/* Show tax breakdown */}
              {taxCalculations.length > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={8} sx={{ fontWeight: 600, fontStyle: 'italic', color: 'text.secondary' }}>
                      {selectedPriceList?.taxIncl ? "Taxes Included:" : "Taxes:"}
                    </TableCell>
                  </TableRow>
                  {taxCalculations.map((tax, idx) => (
                    <TableRow key={idx}>
                      <TableCell colSpan={5}></TableCell>
                      <TableCell sx={{ pl: 4 }}>
                        {tax.name} ({tax.rate}%)
                      </TableCell>
                      <TableCell>{tax.amount.toFixed(2)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))}
                </>
              )}

              <TableRow>
                <TableCell colSpan={5}></TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{totalAmount}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
          <Button variant="contained" color="primary">
            Print
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Close
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
