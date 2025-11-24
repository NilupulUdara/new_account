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
import { getSalesOrderByOrderNo } from "../../../../api/SalesOrders/SalesOrdersApi";
import { getSalesOrderDetailsByOrderNo } from "../../../../api/SalesOrders/SalesOrderDetailsApi";
import { getPaymentTerms } from "../../../../api/PaymentTerm/PaymentTermApi";

export default function ViewSalesQuotationEntry() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { orderNo } = state || {};

  const [salesOrder, setSalesOrder] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch customers for display
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
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

  // Calculate totals from order details
  const { subtotal, includedTax, totalAmount } = useMemo(() => {
    const subtotal = orderDetails.reduce((sum, item) => sum + (parseFloat(item.unit_price || 0) * parseFloat(item.quantity || 0) * (1 - parseFloat(item.discount_percent || 0) / 100)), 0);
    const includedTax = orderDetails.reduce((sum, item) => sum + (parseFloat(item.unit_tax || 0) * parseFloat(item.quantity || 0)), 0);
    const totalAmount = subtotal + includedTax;
    return { subtotal: subtotal.toFixed(2), includedTax: includedTax.toFixed(2), totalAmount: totalAmount.toFixed(2) };
  }, [orderDetails]);

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Sales Quotations" },
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
          <Typography>Sales quotation not found</Typography>
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
          <PageTitle title={"Sales Quotation"} />
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

      {/* Quotation Details */}
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: "var(--pallet-dark-blue)" }}
        >
          Quotation Details
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography><b>Customer Name:</b> {customerName}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Customer Order Ref:</b> {salesOrder?.customer_ref || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Deliver To Branch:</b> {salesOrder?.deliver_to || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Ordered On:</b> {salesOrder?.ord_date || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Valid Until:</b> {salesOrder?.delivery_date || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Order Currency:</b> {salesOrder?.order_type || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Deliver From Location:</b> {deliverFromName}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography><b>Payment Terms:</b> {paymentTermName}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography><b>Telephone:</b> {salesOrder?.contact_phone || "-"}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><b>Email:</b> {salesOrder?.contact_email || "-"}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography><b>Delivery Address:</b> {salesOrder?.delivery_address || "-"}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography><b>Reference:</b> {salesOrder?.reference || "-"}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography><b>Comments:</b> {salesOrder?.comments || "-"}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Items Table */}
      <Paper sx={{ p: 2 }}>
        <Typography sx={{ mb: 1, fontWeight: 600 }}>Items</Typography>
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
                  return (
                    <TableRow key={idx}>
                      <TableCell>{item.stk_code || "-"}</TableCell>
                      <TableCell>{item.description || "-"}</TableCell>
                      <TableCell>{item.quantity || "-"}</TableCell>
                      <TableCell>{item.units || "-"}</TableCell>
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
              <TableRow>
                <TableCell colSpan={5}></TableCell>
                <TableCell>Included Tax</TableCell>
                <TableCell>{includedTax}</TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5}></TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{totalAmount ?? "-"}</TableCell>
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
