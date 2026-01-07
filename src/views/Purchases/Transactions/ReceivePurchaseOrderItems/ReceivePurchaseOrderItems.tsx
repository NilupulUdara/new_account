import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";
import { getFiscalYears } from "../../../../api/FiscalYear/FiscalYearApi";
import { getCompanies } from "../../../../api/CompanySetup/CompanySetupApi";
import { getPurchOrderByOrderNo } from "../../../../api/PurchOrders/PurchOrderApi";
import { getPurchOrderDetailsByOrderNo } from "../../../../api/PurchOrders/PurchOrderDetailsApi";
import { getSuppliers } from "../../../../api/Supplier/SupplierApi";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getGrnBatches, createGrnBatch } from "../../../../api/GRN/GrnBatchApi";
import { getItems } from "../../../../api/Item/ItemApi";
import { getItemUnits } from "../../../../api/ItemUnit/ItemUnitApi";
import { createGrnItem } from "../../../../api/GRN/GrnItemsApi";
import { createStockMove } from "../../../../api/StockMoves/StockMovesApi";
import { updatePurchOrderDetail } from "../../../../api/PurchOrders/PurchOrderDetailsApi";
import auditTrailApi from "../../../../api/AuditTrail/AuditTrailApi";
import useCurrentUser from "../../../../hooks/useCurrentUser";
import { getPurchDataById as getPurchasingPriceById } from "../../../../api/PurchasingPricing/PurchasingPricingApi";
import { createPurchData, getPurchDataBySupplier, updatePurchData } from "../../../../api/PurchOrders/PurchDataApi";

export default function ReceivePurchaseOrderItems() {
  const navigate = useNavigate();

  // === Form Fields ===
  const locationRouter = useLocation();
  const navigatedOrderNo = locationRouter.state?.id ?? null;

  const [supplier, setSupplier] = useState("");
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [purchaseOrder, setPurchaseOrder] = useState("");
  const [orderedOn, setOrderedOn] = useState(new Date().toISOString().split("T")[0]);
  const [reference, setReference] = useState("");
  const [suppliersRef, setSuppliersRef] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderComments, setOrderComments] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [dateReceived, setDateReceived] = useState(new Date().toISOString().split("T")[0]);

  const [dateReceivedError, setDateReceivedError] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);

  // Fiscal year queries
  const { data: fiscalYears = [] } = useQuery({ queryKey: ["fiscalYears"], queryFn: getFiscalYears });
  const { data: companyData } = useQuery({ queryKey: ["company"], queryFn: getCompanies });
  const { data: suppliers = [] } = useQuery({ queryKey: ["suppliers"], queryFn: getSuppliers });
  const { user } = useCurrentUser();

  // Find selected fiscal year from company setup
  const selectedFiscalYear = useMemo(() => {
    if (!companyData || companyData.length === 0) return null;
    const company = companyData[0];
    return fiscalYears.find((fy: any) => fy.id === company.fiscal_year_id);
  }, [companyData, fiscalYears]);

  // Validate date is within fiscal year
  const validateDate = (selectedDate: string, setError: (error: string) => void) => {
    if (!selectedFiscalYear) {
      setError("No fiscal year selected from company setup");
      return false;
    }

    if (selectedFiscalYear.closed) {
      setError("The fiscal year is closed for further data entry.");
      return false;
    }

    const selected = new Date(selectedDate);
    const from = new Date(selectedFiscalYear.fiscal_year_from);
    const to = new Date(selectedFiscalYear.fiscal_year_to);

    if (selected < from || selected > to) {
      setError("The entered date is out of fiscal year.");
      return false;
    }

    setError("");
    return true;
  };

  // Validate dates when fiscal year is selected
  useEffect(() => {
    if (selectedFiscalYear) {
      validateDate(dateReceived, setDateReceivedError);
    }
  }, [selectedFiscalYear]);

  const { data: inventoryLocations = [] } = useQuery({ queryKey: ["inventoryLocations"], queryFn: getInventoryLocations });

  const { data: items = [] } = useQuery({ queryKey: ["items"], queryFn: getItems });
  const { data: itemUnits = [] } = useQuery({ queryKey: ["itemUnits"], queryFn: getItemUnits });

  const deliveryLocations = (inventoryLocations || []).map((l: any) => ({ id: l.id ?? l.location_id ?? l.loc_code ?? l.code ?? l.loc_code ?? l.id, name: l.location_name ?? l.name ?? l.description ?? String(l.id) }));

  useEffect(() => {
    if (!deliveryLocation && deliveryLocations && deliveryLocations.length > 0) {
      setDeliveryLocation(String(deliveryLocations[0].id));
    }
  }, [deliveryLocations]);

  // When navigated from Outstanding Purchase Orders with an order id, load that order and its details
  useEffect(() => {
    if (!navigatedOrderNo) return;

    (async () => {
      try {
        const ord = await getPurchOrderByOrderNo(navigatedOrderNo);
        if (ord) {
          setPurchaseOrder(String(ord.order_no ?? ord.id ?? ""));
          setOrderedOn(String((ord.ord_date ?? ord.ordDate ?? ord.date ?? new Date()).toString()).split("T")[0]);
          // reference for GRN should be generated from GRN batches (NNN/YYYY) and not reused from the purchase order
          setSuppliersRef(ord.requisition_no ?? ord.requisitionNo ?? ord.supplier_ref ?? "");
          setDeliveryAddress(ord.delivery_address ?? ord.deliveryAddress ?? "");
          setOrderComments(ord.comments ?? ord.memo ?? ord.notes ?? "");

          // resolve supplier name
          const supRec = (suppliers || []).find((s: any) => String(s.supplier_id ?? s.id ?? s.debtor_no) === String(ord.supplier_id ?? ord.supplier ?? ord.supp_id ?? ""));
          setSupplier(supRec ? (supRec.supp_name ?? supRec.name ?? supRec.supplier_name) : String(ord.supplier_id ?? ord.supplier ?? ""));
          setSupplierId(Number(ord.supplier_id ?? ord.supplier ?? ord.supp_id ?? supRec?.supplier_id ?? supRec?.id ?? null));

          // resolve delivery location (into_stock_location could be loc_code or id)
          const intoLoc = ord.into_stock_location ?? ord.intoStockLocation ?? ord.into_location ?? null;
          if (intoLoc) {
            const matched = (inventoryLocations || []).find((l: any) => String(l.loc_code ?? l.code ?? l.id) === String(intoLoc) || String(l.id) === String(intoLoc));
            setDeliveryLocation(matched ? String(matched.id) : String(intoLoc));
          }
        }

        // details
        try {
          const details = await getPurchOrderDetailsByOrderNo(navigatedOrderNo);
          if (Array.isArray(details) && details.length > 0) {
            const mapped = details.map((d: any, idx: number) => {
              const stockId = d.item_code ?? d.stock_id ?? d.item ?? d.item_id ?? "";
              const itemRec = (items || []).find((it: any) => String(it.stock_id ?? it.id ?? it.stockId) === String(stockId));
              const unitId = d.unit ?? d.uom ?? itemRec?.units ?? itemRec?.unit ?? "";
              const unitObj = (itemUnits || []).find((u: any) => String(u.id) === String(unitId));
              const unitsDisplay = unitObj ? (unitObj.abbr ?? unitObj.name ?? String(unitId)) : String(unitId ?? "");

              const orderedVal = Number(d.quantity_ordered ?? d.quantity ?? d.qty ?? 0);
              const receivedVal = Number(d.quantity_received ?? d.qty_received ?? 0);
              const outstandingVal = Math.max(0, orderedVal - receivedVal);
              const priceVal = Number(d.unit_price ?? d.unitPrice ?? d.act_price ?? d.price ?? 0) || 0;

              return {
                id: idx + 1,
                itemCode: stockId,
                description: d.description ?? d.desc ?? itemRec?.description ?? "",
                ordered: orderedVal,
                units: unitsDisplay,
                received: receivedVal,
                outstanding: outstandingVal,
                thisDelivery: outstandingVal,
                price: priceVal,
                total: priceVal * outstandingVal,
              };
            });
            setRows(mapped);
          }
        } catch (dErr) {
          console.warn('Failed to load purch order details for receive page', dErr);
        }
      } catch (err) {
        console.error('Failed to load purchase order for receive page', err);
      }
    })();
  }, [navigatedOrderNo, suppliers, inventoryLocations]);

  // Generate GRN reference (NNN/YYYY) based on `dateReceived` and existing GRN batches
  useEffect(() => {
    (async () => {
      try {
        if (!dateReceived) return;
        const dateObj = new Date(dateReceived);
        if (isNaN(dateObj.getTime())) return;

        // Use current calendar year for GRN reference (e.g., 2026)
        const yearLabel = String(new Date().getFullYear());

        // Query existing GRN batches to determine next sequential reference for this fiscal year
        let nextNum = 1;
        try {
          const allBatches = await getGrnBatches();
          if (Array.isArray(allBatches) && allBatches.length > 0) {
            const yearPattern = `/${yearLabel}`;
            const matchingRefs = allBatches
              .map((b: any) => b.reference ?? '')
              .filter((ref: string) => String(ref).endsWith(yearPattern))
              .map((ref: string) => {
                const parts = String(ref).split('/');
                if (parts.length >= 2) {
                  const numPart = parts[0];
                  const parsed = parseInt(numPart, 10);
                  return isNaN(parsed) ? 0 : parsed;
                }
                return 0;
              })
              .filter((n: number) => n > 0);

            if (matchingRefs.length > 0) {
              const maxRef = Math.max(...matchingRefs);
              nextNum = maxRef + 1;
            }
          }
        } catch (e) {
          console.warn('Failed to fetch GRN batches for reference generation', e);
        }

        setReference(`${nextNum.toString().padStart(3, '0')}/${yearLabel}`);
      } catch (err) {
        console.warn('Failed to generate GRN reference', err);
      }
    })();
  }, [dateReceived, fiscalYears]);

  // === Table Data ===
  // start with empty rows; they'll be populated when a purchase order is loaded
  const [rows, setRows] = useState<any[]>([]);

  const subTotal = rows.reduce((sum, r) => sum + r.total, 0);
  const amountTotal = subTotal;

  const breadcrumbItems = [
    { title: "Purchases", href: "/purchases" },
    { title: "Receive Purchase Order Items" },
  ];

  const handleUpdate = () => alert("Items updated!");
  const handleProcessReceive = async () => {
    setIsProcessing(true);
    try {
      if (!purchaseOrder) { alert('No purchase order loaded'); return; }
      if (!supplierId) { alert('Missing supplier id'); return; }

      // resolve loc_code from deliveryLocation id
      const locRec = (inventoryLocations || []).find((l: any) => String(l.id) === String(deliveryLocation) || String(l.id) === String(deliveryLocation));
      const locCode = locRec?.loc_code ?? String(deliveryLocation);

      // 1) create GRN batch
      const grnBatchPayload: any = {
        supplier_id: Number(supplierId),
        purch_order_no: Number(purchaseOrder),
        reference: reference || "",
        delivery_date: dateReceived,
        loc_code: locCode,
        rate: 1,
      };

      const createdGrn = await createGrnBatch(grnBatchPayload);
      let grnBatchId: any = createdGrn?.id ?? createdGrn?.grn_batch_id ?? createdGrn?.batch_id ?? createdGrn?.grn_id ?? null;
      if (!grnBatchId) {
        const allBatches = await getGrnBatches();
        const candidate = (allBatches || []).filter((b: any) => Number(b.purch_order_no ?? b.purch_order) === Number(purchaseOrder)).sort((a: any, b: any) => Number(b.id ?? b.grn_batch_id ?? 0) - Number(a.id ?? a.grn_batch_id ?? 0));
        if (candidate.length > 0) grnBatchId = candidate[0].id ?? candidate[0].grn_batch_id ?? null;
      }

      if (!grnBatchId) throw new Error('Failed to create GRN batch');

      // load details to find po_detail_item ids
      const details = await getPurchOrderDetailsByOrderNo(purchaseOrder);

      // 2) create GRN items and 3) update purch_order_details
      for (const row of rows) {
        const thisDelivery = Number(row.thisDelivery || 0);
        if (!thisDelivery || thisDelivery <= 0) continue;

        const match = (details || []).find((d: any) => String(d.item_code ?? d.stock_id ?? d.item ?? d.item_id ?? "") === String(row.itemCode));
        const poItem = match?.po_detail_item ?? match?.po_detail_id ?? match?.id ?? null;

        // create grn item
        try {
          await createGrnItem({ grn_batch_id: grnBatchId, po_detail_item: poItem, item_code: row.itemCode, description: row.description, qty_recd: thisDelivery, quantity_inv: 0 });
        } catch (e) {
          console.warn('createGrnItem failed', e);
        }

        // update purch_order_detail
        if (match) {
          const currentReceived = Number(match.quantity_received ?? match.qty_received ?? 0);
          const newReceived = currentReceived + thisDelivery;
          const itemRec = (items || []).find((it: any) => String(it.stock_id ?? it.id) === String(row.itemCode));
          const materialCost = Number(itemRec?.material_cost ?? 0);

          const updatePayload: any = {
            ...match,
            quantity_received: newReceived,
            act_price: Number(row.price) || Number(match.unit_price ?? match.act_price ?? 0),
            std_cost_unit: materialCost,
          };

          try {
            const idToUse = match.id ?? match.po_detail_id ?? match.po_detail_item;
            await updatePurchOrderDetail(idToUse, updatePayload);
          } catch (upErr) {
            console.warn('Failed to update purch_order_detail', upErr);
          }
        }

        // Upsert into `purch_data` so supplier/stock pricing is stored for future orders
        try {
          // try to get purchasing_pricing for this supplier & stock
          let pricing: any = null;
          try {
            pricing = await getPurchasingPriceById(Number(supplierId), String(row.itemCode));
          } catch (ppErr) {
            pricing = null;
          }

          const priceToStore = pricing?.price ?? Number(row.price) ?? 0;
          const suppliersUom = pricing?.suppliers_uom ?? "";

          // check existing purch_data for this supplier
          let existingList: any[] = [];
          try {
            existingList = await getPurchDataBySupplier(Number(supplierId));
          } catch (e) {
            existingList = [];
          }

          const existing = (existingList || []).find((pd: any) => String(pd.stock_id) === String(row.itemCode));

          const purchDataPayload: any = {
            supplier_id: Number(supplierId),
            stock_id: String(row.itemCode),
            price: Number(priceToStore),
            suppliers_uom: suppliersUom,
            conversion_factor: 1,
            supplier_description: "",
          };

          if (existing && (existing.id || existing.purch_data_id)) {
            const idToUse = existing.id ?? existing.purch_data_id;
            try {
              await updatePurchData(idToUse, purchDataPayload);
            } catch (upPdErr) {
              console.warn('Failed to update purch_data', upPdErr);
            }
          } else {
            try {
              await createPurchData(purchDataPayload);
            } catch (createPdErr) {
              console.warn('Failed to create purch_data', createPdErr);
            }
          }
        } catch (pdErr) {
          console.warn('Purch data upsert failed', pdErr);
        }

        // 4) create stock_move
        try {
          const itemRec = (items || []).find((it: any) => String(it.stock_id ?? it.id) === String(row.itemCode));
          const materialCost = Number(itemRec?.material_cost ?? 0);
          await createStockMove({ trans_no: grnBatchId, stock_id: row.itemCode, type: 25, loc_code: locCode, tran_date: dateReceived, price: Number(row.price) || 0, reference: '', qty: thisDelivery, standard_cost: materialCost });
        } catch (smErr) {
          console.warn('Failed to create stock move', smErr);
        }
      }

      // 5) create audit trail
      try {
        const company = Array.isArray(companyData) && companyData.length > 0 ? companyData[0] : null;
        const fiscalYearIdToUse = company ? (company.fiscal_year_id ?? company.fiscal_year ?? null) : null;
        const currentUserId = user?.id ?? (Number(localStorage.getItem("userId")) || null);
        await auditTrailApi.create({ type: 25, trans_no: grnBatchId, user: currentUserId, stamp: new Date().toISOString(), description: '', fiscal_year: fiscalYearIdToUse, gl_date: dateReceived, gl_seq: 0 });
      } catch (atErr) {
        console.warn('Failed to create audit trail for GRN', atErr);
      }

      // build view items for success/view page
      const viewItems = (rows || []).map((r: any) => ({
        itemCode: r.itemCode,
        description: r.description,
        requiredBy: r.deliveryDate ?? orderedOn ?? dateReceived,
        quantity: r.ordered,
        unit: r.units,
        price: r.price,
        lineTotal: r.total,
        quantityInvoiced: Number(r.received || 0) + Number(r.thisDelivery || 0),
      }));

      const successState = {
        reference,
        deliveryDate: dateReceived,
        deliveryAddress,
        supplierId: supplierId ?? null,
        deliverIntoLocation: locCode,
        suppliersReference: suppliersRef,
        purchaseOrderRef: purchaseOrder,
        items: viewItems,
        subtotal: subTotal,
        totalAmount: subTotal,
        orderComments,
      };

      alert('Purchase order items received successfully!');
      navigate("/purchase/transactions/receive-purchase-order-items/success", { state: successState });
    } catch (err) {
      console.error('Process receive failed', err);
      alert('Failed to process receive: ' + String(err));
    } finally {
      setIsProcessing(false);
    }
  };

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
                onChange={(e) => { setDateReceived(e.target.value); validateDate(e.target.value, setDateReceivedError); }}
                size="small"
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: selectedFiscalYear ? new Date(selectedFiscalYear.fiscal_year_from).toISOString().split('T')[0] : undefined, max: selectedFiscalYear ? new Date(selectedFiscalYear.fiscal_year_to).toISOString().split('T')[0] : undefined, }}
                error={!!dateReceivedError}
                helperText={dateReceivedError}
              />
            </Stack>
          </Grid>

          {/* Column 3: Supplier's Reference & Delivery Address */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Supplier's Reference"
                value={suppliersRef}
                size="small"
                InputProps={{ readOnly: true }}
              />

              <TextField
                fullWidth
                label="Delivery Address"
                value={deliveryAddress}
                size="small"
                InputProps={{ readOnly: true }}
              />

              <TextField
                fullWidth
                label="Order Comments"
                value={orderComments}
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Items Table */}
      <Typography variant="subtitle1" sx={{ mb: 2, textAlign: "center" }}>
        Items to Receive
      </Typography>

      <TableContainer component={Paper} sx={{ px: 2 }}>
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
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, pr: 2, mb: 4 }}>
        <Button variant="contained" color="primary" onClick={handleUpdate} disabled={!!dateReceivedError || isProcessing}>
          Update
        </Button>
        <Button variant="contained" color="success" onClick={handleProcessReceive} disabled={!!dateReceivedError || isProcessing}>
          {isProcessing ? (
            <>
              <CircularProgress size={18} sx={{ mr: 1, color: 'white' }} /> Processing...
            </>
          ) : (
            'Process Receive Items'
          )}
        </Button>
      </Box>
    </Stack>
  );
}
