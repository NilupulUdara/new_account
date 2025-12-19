import React, { useMemo } from "react";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";
import { getSuppliers } from "../../../../api/Supplier/SupplierApi";
import { getSuppTrans } from "../../../../api/SuppTrans/SuppTransApi";
import { getSuppInvoiceItems } from "../../../../api/SuppInvoiceItems/SuppInvoiceItemsApi";
import { getGrnItems } from "../../../../api/GRN/GrnItemsApi";
import { getTransTypes } from "../../../../api/Reflines/TransTypesApi";

export default function ViewSupplierCreditNote() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    transNo,
    transType,
    supplier,
    reference,
    supplierRef,
    date: invoiceDate,
    creditNoteDate,
    dueDate,
    items = [],
    subtotal,
    totalCreditNote,
    fromAllocations = false,
  } = state || {};

  // Fetch suppliers for display
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });

  const { data: suppInvoiceItems = [] } = useQuery({
    queryKey: ["suppInvoiceItems"],
    queryFn: getSuppInvoiceItems,
    enabled: fromAllocations && !!transNo,
  });

  const { data: grnItems = [] } = useQuery({
    queryKey: ["grnItems"],
    queryFn: getGrnItems,
    enabled: fromAllocations && !!transNo,
  });

  const { data: suppTrans = [] } = useQuery({
    queryKey: ["suppTrans"],
    queryFn: getSuppTrans,
    enabled: fromAllocations && !!transNo,
  });

  const { data: transTypes = [] } = useQuery({
    queryKey: ["transTypes"],
    queryFn: getTransTypes,
    enabled: fromAllocations,
  });

  // Supplier name resolve
  const supplierName = useMemo(() => {
    if (!supplier) return "-";
    const found = (suppliers || []).find(
      (s: any) => String(s.supplier_id) === String(supplier)
    );
    return found ? found.supp_name : supplier;
  }, [suppliers, supplier]);

  // Supplier currency resolve
  const supplierCurrency = useMemo(() => {
    if (!supplier) return "-";
    const found = (suppliers || []).find(
      (s: any) => String(s.supplier_id) === String(supplier)
    );
    return found ? (found.curr_code || "-") : "-";
  }, [suppliers, supplier]);

  // Compute items from supp_invoice_items if coming from allocations
  const displayItems = useMemo(() => {
    if (!fromAllocations || !transNo) return items;

    const grnMap = new Map(
      (grnItems || []).map((g: any) => [String(g.id ?? g.grn_item_id), g])
    );

    const creditNoteItems = (suppInvoiceItems || [])
      .filter(
        (item: any) =>
          String(item.supp_trans_no ?? item.trans_no) === String(transNo) &&
          String(item.supp_trans_type ?? item.trans_type) === String(transType)
      )
      .map((item: any) => {
        const grnItemId = String(item.grn_item_id ?? "");
        const grnItem = grnMap.get(grnItemId) as any;
        const quantity = Number(item.quantity ?? 0);
        const price = Number(item.unit_price ?? 0);
        return {
          delivery: grnItem?.grn_batch_id ?? grnItem?.batch_id ?? "-",
          item: item.stock_id ?? "-",
          description: item.description ?? "-",
          quantity: Math.abs(quantity),
          price: price,
          lineValue: Math.abs(quantity * price),
          grn_item_id: item.grn_item_id,
        };
      });

    return creditNoteItems;
  }, [fromAllocations, transNo, transType, items, suppInvoiceItems, grnItems]);

  // Compute allocations from related supp_invoice_items with type 20
  const allocations = useMemo(() => {
    if (!fromAllocations || !transNo || displayItems.length === 0) return [];

    const transTypeMap = new Map(
      (transTypes || []).map((t: any) => [String(t.trans_type), t])
    );

    // Get grn_item_ids from credit note items
    const grnItemIds = displayItems
      .map((item: any) => String(item.grn_item_id ?? ""))
      .filter((id) => id !== "");

    // Find supp_invoice_items with same grn_item_id and type 20
    const relatedInvoiceItems = (suppInvoiceItems || []).filter(
      (item: any) =>
        grnItemIds.includes(String(item.grn_item_id ?? "")) &&
        String(item.supp_trans_type ?? item.trans_type) === "20"
    );

    // Get unique trans_no values
    const transNos = [
      ...new Set(
        relatedInvoiceItems.map((item: any) =>
          String(item.supp_trans_no ?? item.trans_no)
        )
      ),
    ];

    // Get supp_trans for these trans_nos with trans_type = 20
    const allocs = transNos
      .map((tNo) => {
        const trans = (suppTrans || []).find(
          (t: any) =>
            String(t.trans_no ?? t.transno) === tNo &&
            String(t.trans_type ?? t.type ?? 0) === "20"
        );
        if (!trans) return null;

        const transTypeId = String(trans.trans_type ?? trans.type ?? "");
        const transType = transTypeMap.get(transTypeId) as any;
        const ovAmount = Number(trans.ov_amount ?? 0);
        const alloc = Number(trans.alloc ?? 0);

        return {
          type: transType?.description ?? transType?.name ?? transTypeId,
          number: trans.trans_no ?? "-",
          date: trans.trans_date ?? "-",
          totalAmount: ovAmount,
          thisAllocation: alloc,
          leftToAllocate: ovAmount - alloc,
        };
      })
      .filter((a) => a !== null);

    return allocs;
  }, [
    fromAllocations,
    transNo,
    displayItems,
    suppInvoiceItems,
    suppTrans,
    transTypes,
  ]);

  // Compute totals
  const computedSubtotal = useMemo(() => {
    if (!fromAllocations) return subtotal;
    return displayItems.reduce(
      (sum: number, item: any) => sum + Number(item.lineValue ?? 0),
      0
    );
  }, [fromAllocations, displayItems, subtotal]);

  const totalAllocated = useMemo(
    () =>
      allocations.reduce(
        (sum: number, a: any) => sum + Number(a.thisAllocation ?? 0),
        0
      ),
    [allocations]
  );

  const leftToAllocate = useMemo(
    () =>
      allocations.reduce(
        (sum: number, a: any) => sum + Number(a.leftToAllocate ?? 0),
        0
      ),
    [allocations]
  );

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "SUPPLIER CREDIT NOTE" },
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
          flexWrap: "wrap",
        }}
      >
        <Box>
          <PageTitle title={`SUPPLIER CREDIT NOTE - ${reference || "-"}`} />
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

      {/* Invoice Information */}
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: "var(--pallet-dark-blue)" }}
        >
          SUPPLIER CREDIT NOTE {reference || "-"}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Supplier:</b> {supplierName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Reference:</b> {reference || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Supplier's Reference:</b> {supplierRef || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Invoice Date:</b> {invoiceDate || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Due Date:</b> {dueDate || "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Currency:</b> {supplierCurrency}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Items Table */}
      <Paper sx={{ p: 2 }}>
        <Typography sx={{ mb: 1, fontWeight: 600 }}>
          Received Items Credited on this Note
        </Typography>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Delivery</TableCell>
                <TableCell>Item</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Line Value</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {displayItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>No items available</TableCell>
                </TableRow>
              ) : (
                displayItems.map((row: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{row.delivery ?? "-"}</TableCell>
                    <TableCell>{row.item ?? "-"}</TableCell>
                    <TableCell>{row.description ?? "-"}</TableCell>
                    <TableCell>{row.quantity ?? "-"}</TableCell>
                    <TableCell>{row.price ?? "-"}</TableCell>
                    <TableCell>{row.lineValue ?? "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Totals Section for Items */}
        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ width: 260 }}>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography>Subtotal:</Typography>
              <Typography>{computedSubtotal?.toFixed(2) ?? "-"}</Typography>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ fontWeight: 600 }}
            >
              <Typography sx={{ fontWeight: 600 }}>Total Credit Note:</Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {(computedSubtotal ?? 0).toFixed(2)}
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* Allocations Table */}
      <Paper sx={{ p: 2 }}>
        <Typography sx={{ mb: 1, fontWeight: 600 }}>
          Allocations
        </Typography>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Number</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Left to Allocate</TableCell>
                <TableCell>This Allocation</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {allocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>No allocations available</TableCell>
                </TableRow>
              ) : (
                allocations.map((alloc: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{alloc.type}</TableCell>
                    <TableCell>{alloc.number}</TableCell>
                    <TableCell>{alloc.date}</TableCell>
                    <TableCell>{alloc.totalAmount?.toFixed(2)}</TableCell>
                    <TableCell>{alloc.leftToAllocate?.toFixed(2)}</TableCell>
                    <TableCell>{alloc.thisAllocation?.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Allocation Totals */}
        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ width: 260 }}>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography>Total Allocated:</Typography>
              <Typography>{totalAllocated.toFixed(2)}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography>Left to Allocate:</Typography>
              <Typography>{leftToAllocate.toFixed(2)}</Typography>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
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
