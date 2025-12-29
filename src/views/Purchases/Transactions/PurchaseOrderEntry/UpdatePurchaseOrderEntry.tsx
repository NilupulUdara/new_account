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
  ListSubheader,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";
import { getSuppliers } from "../../../../api/Supplier/SupplierApi";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getTags } from "../../../../api/DimensionTag/DimensionTagApi";
import { getItems } from "../../../../api/Item/ItemApi";
import { getItemUnits } from "../../../../api/ItemUnit/ItemUnitApi";
import { getItemCategories } from "../../../../api/ItemCategories/ItemCategoriesApi";
import { getPurchDataById } from "../../../../api/PurchasingPricing/PurchasingPricingApi";
import { getFiscalYears } from "../../../../api/FiscalYear/FiscalYearApi";
import { getCompanies } from "../../../../api/CompanySetup/CompanySetupApi";
import {
  getPurchOrderByOrderNo,
  updatePurchOrder,
} from "../../../../api/PurchOrders/PurchOrderApi";
import {
  getPurchOrderDetailsByOrderNo,
  createPurchOrderDetail,
  updatePurchOrderDetail,
  deletePurchOrderDetail,
} from "../../../../api/PurchOrders/PurchOrderDetailsApi";
import { useQueryClient } from "@tanstack/react-query";

export default function UpdatePurchaseOrderEntry() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const locationRouter = useLocation();
  const orderNoFromState = locationRouter.state?.id ?? null;

  // ========= Form Fields =========
  const [supplier, setSupplier] = useState("");
  const [supplierRef, setSupplierRef] = useState("");
  const [deliverTo, setDeliverTo] = useState("");
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dimension, setDimension] = useState(0);
  const [credit, setCredit] = useState(0);
  const [receiveInto, setReceiveInto] = useState(0);
  const [reference, setReference] = useState("");

  const [memo, setMemo] = useState("");

  const [dateError, setDateError] = useState("");

  // API data states
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [items, setItems] = useState([]);
  const [itemUnits, setItemUnits] = useState([]);
  const [categories, setCategories] = useState<{ category_id: number; description: string }[]>([]);
  const [deletedDetailIds, setDeletedDetailIds] = useState<any[]>([]);

  // ========= Generate Reference =========
  // Fetch fiscal years to build fiscal-year-aware reference
  const { data: fiscalYears = [] } = useQuery({ queryKey: ["fiscalYears"], queryFn: getFiscalYears });

  const { data: companyData } = useQuery({
    queryKey: ["company"],
    queryFn: getCompanies,
  });

  // Find selected fiscal year from company setup
  const selectedFiscalYear = useMemo(() => {
    if (!companyData || companyData.length === 0) return null;
    const company = companyData[0];
    return fiscalYears.find((fy: any) => fy.id === company.fiscal_year_id);
  }, [companyData, fiscalYears]);

  // Validate date is within fiscal year
  const validateDate = (selectedDate: string) => {
    if (!selectedFiscalYear) {
      setDateError("No fiscal year selected from company setup");
      return false;
    }

    setDateError("");
    return true;
  };

  // Handle date change with validation
  const handleDateChange = (value: string) => {
    setOrderDate(value);
    validateDate(value);
  };

  // Validate date when fiscal year is loaded
  useEffect(() => {
    if (selectedFiscalYear && orderDate) {
      validateDate(orderDate);
    }
  }, [selectedFiscalYear]);

  // ========= Update Credit When Supplier Changes =========
  useEffect(() => {
    const selected = (suppliers || []).find((s: any) => String(s.supplier_id ?? s.id ?? s.debtor_no) === String(supplier));
    setCredit(selected ? Number(selected.credit_limit ?? selected.credit ?? 0) : 0);
  }, [supplier, suppliers]);

  // ========= Fetch API Data =========
  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch lookups first
        const [suppliersData, locationsData, dimensionsData, itemsData, itemUnitsData, categoriesData] = await Promise.all([
          getSuppliers(),
          getInventoryLocations(),
          getTags(),
          getItems(),
          getItemUnits(),
          getItemCategories(),
        ]);
        setSuppliers(suppliersData);
        setLocations(locationsData);
        setDimensions(dimensionsData);
        setItems(itemsData);
        setItemUnits(itemUnitsData);
        setCategories(categoriesData);

        // if navigated with an order number, fetch that order and its details
        if (orderNoFromState) {
          try {
            const order = await getPurchOrderByOrderNo(orderNoFromState);
              if (order) {
                // Map order fields to form state
                setSupplier(String(order.supplier_id ?? order.supplier ?? order.supp_id ?? ""));
              setSupplierRef(order.requisition_no ?? order.requisitionNo ?? order.supplier_ref ?? "");
              setDeliverTo(order.delivery_address ?? order.deliveryAddress ?? "");
              // normalize order date to YYYY-MM-DD (strip time if present)
              const rawOrd = order.ord_date ?? order.ordDate ?? new Date().toISOString();
              setOrderDate(String(rawOrd).split("T")[0]);
              setReference(order.reference ?? "");
              setMemo(order.comments ?? order.memo ?? "");

              // resolve receiveInto: convert loc_code to id if necessary
              const intoLoc = order.into_stock_location ?? order.intoStockLocation ?? order.into_location;
              const matchedLoc = (locationsData || []).find((l: any) => String(l.loc_code) === String(intoLoc) || String(l.id) === String(intoLoc));
              setReceiveInto(matchedLoc ? matchedLoc.id : 0);
            }

            const details = await getPurchOrderDetailsByOrderNo(orderNoFromState);
            if (Array.isArray(details) && details.length > 0) {
              const mapped = details.map((d: any, idx: number) => ({
                id: idx + 1,
                detailId: d.id ?? d.purch_order_detail_id ?? d.po_detail_id ?? null,
                po_detail_item: Number(d.po_detail_item ?? d.po_detail_id ?? d.po_detail_item ?? d.po_detail_item ?? idx + 1),
                stockId: d.item_code ?? d.stock_id ?? d.item ?? d.item_id ?? "",
                itemCode: d.item_code ?? d.stock_id ?? d.item ?? d.item_id ?? "",
                description: d.description ?? d.desc ?? "",
                quantity: Number(d.quantity_ordered ?? d.quantity ?? d.qty ?? 0),
                unit: ((): string => {
                  const rawUnit = d.unit ?? d.uom ?? d.unit_code ?? d.unit_id ?? d.uom_code ?? "";
                  // if unit is numeric id, resolve to abbreviation from itemUnitsData
                  if (rawUnit && typeof rawUnit !== "string" && typeof rawUnit !== "number") return String(rawUnit);
                  const rawStr = String(rawUnit ?? "");
                  const found = (itemUnitsData || []).find((u: any) => String(u.id) === rawStr || String(u.unit_code ?? u.code ?? u.abbr) === rawStr || String(u.abbr) === rawStr);
                  return found ? (found.abbr ?? String(found.unit_code ?? found.code ?? rawStr)) : rawStr;
                })(),
                deliveryDate: String((d.delivery_date ?? d.required_date ?? new Date().toISOString())).split("T")[0],
                price: Number(d.unit_price ?? d.unitPrice ?? d.act_price ?? d.price ?? 0),
                total: Number((d.unit_price ?? d.unitPrice ?? d.act_price ?? d.price ?? 0) * (d.quantity_ordered ?? d.quantity ?? d.qty ?? 0)),
                // ensure these fields exist so the rows shape matches the state type
                qty_invoiced: Number(d.qty_invoiced ?? d.qtyInvoiced ?? d.qty ?? 0),
                act_price: Number(d.act_price ?? d.actPrice ?? d.unit_price ?? 0),
                std_cost_unit: Number(d.std_cost_unit ?? d.stdCostUnit ?? 0),
                quantity_received: Number(d.quantity_received ?? d.qty_received ?? 0),
              }));
              setRows(mapped);
            }
          } catch (err) {
            console.error("Error fetching order or details:", err);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const [rows, setRows] = useState([
    {
      id: 1,
      stockId: "",
      itemCode: "",
      description: "",
      quantity: 0,
      unit: "",
      deliveryDate: new Date().toISOString().split("T")[0],
      price: 0,
      total: 0,
      detailId: null,
      po_detail_item: 0,
      qty_invoiced: 0,
      act_price: 0,
      std_cost_unit: 0,
      quantity_received: 0,
    },
  ]);

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        stockId: "",
        itemCode: "",
        description: "",
        quantity: 0,
        unit: "",
        deliveryDate: new Date().toISOString().split("T")[0],
        price: 0,
        total: 0,
        detailId: null,
        po_detail_item: 0,
        qty_invoiced: 0,
        act_price: 0,
        std_cost_unit: 0,
        quantity_received: 0,
      },
    ]);
  };

  const handleRemoveRow = (id) => {
    setRows((prev) => {
      const toRemove = prev.find((r) => r.id === id);
      // If this row corresponds to an existing purch_order_detail, track its po_detail_item
      if (toRemove && (toRemove as any).po_detail_item) {
        const item = Number((toRemove as any).po_detail_item);
        if (!isNaN(item) && item > 0) setDeletedDetailIds((prevDel) => [...prevDel, item]);
      }
      return prev.filter((r) => r.id !== id);
    });
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

  const resolveUnitAbbr = (rawUnit: any) => {
    const raw = rawUnit ?? "";
    const s = String(raw);
    const found = (itemUnits || []).find((u: any) => String(u.id) === s || String(u.abbr) === s || String(u.unit_code ?? u.code ?? "") === s);
    return found ? (found.abbr ?? String(found.unit_code ?? found.code ?? s)) : s;
  };

  // ========= Subtotal =========
  const subTotal = rows.reduce((sum, r) => sum + r.total, 0);

  // ========= Place Order =========
  const handlePlaceOrder = async () => {
    // Update header and details
    try {
      const orderNo = orderNoFromState;
      if (!orderNo) {
        alert("No order selected to update.");
        return;
      }

      const locObj = (locations || []).find((l: any) => Number(l.id) === Number(receiveInto));
      const intoStockLocation = locObj ? locObj.loc_code ?? locObj.id : receiveInto;

      const payload = {
        order_no: Number(orderNo),
        supplier_id: Number(supplier),
        comments: memo ?? null,
        ord_date: orderDate,
        reference: reference ?? "",
        requisition_no: supplierRef ?? null,
        into_stock_location: intoStockLocation,
        delivery_address: deliverTo ?? "",
        total: subTotal,
        prep_amount: 0,
        alloc: 0,
        tax_included: false,
      };

      await updatePurchOrder(Number(orderNo), payload);

      // handle deleted details
      for (const delId of deletedDetailIds) {
        try {
          await deletePurchOrderDetail(delId);
        } catch (err) {
          console.warn(`Failed to delete detail ${delId}:`, err);
        }
      }

      // update or create details — only for rows that have an item and quantity > 0
      const detailsToSave = (rows || []).filter((r: any) => (r.itemCode || r.stockId || r.description) && Number(r.quantity) > 0);

      // fetch existing details to determine used po_detail_item values (avoid duplicates)
      let existingDetails: any[] = [];
      try {
        existingDetails = await getPurchOrderDetailsByOrderNo(orderNo);
      } catch (err) {
        console.warn("Failed to fetch existing details for order", orderNo, err);
      }

      const usedNumbers = new Set<number>();
      (existingDetails || []).forEach((d: any) => {
        const n = Number(d.po_detail_item ?? d.po_detail_id ?? d.po_detailItem ?? d.po_detail_item ?? 0);
        if (!isNaN(n) && n > 0) usedNumbers.add(n);
      });

      const nextAvailable = () => {
        let i = 1;
        while (usedNumbers.has(i)) i += 1;
        usedNumbers.add(i);
        return i;
      };

      for (let idx = 0; idx < detailsToSave.length; idx++) {
        const r = detailsToSave[idx];

        // determine item_code: prefer itemCode, then stockId, then lookup by description
        let itemCodeValue = r.itemCode ?? r.stockId ?? "";
        if (!itemCodeValue && r.description) {
          const foundItem = (items || []).find((it: any) => String(it.description ?? it.item_name ?? it.name) === String(r.description));
          if (foundItem) itemCodeValue = String(foundItem.stock_id ?? foundItem.id ?? "");
        }

        if (!itemCodeValue) {
          console.warn("Skipping detail without item_code:", r);
          continue;
        }

        // decide po_detail_item: preserve existing if available, otherwise pick next available
        // prefer existing po_detail_item if present; otherwise try to resolve from existingDetails or assign next available
        let poDetailItem = Number(r.po_detail_item ?? 0);
        if (!poDetailItem && (r as any).detailId) {
          const found = (existingDetails || []).find((d: any) => String(d.id ?? d.purch_order_detail_id ?? d.po_detail_id ?? d.po_detail_item) === String((r as any).detailId));
          poDetailItem = found ? Number(found.po_detail_item ?? found.po_detail_id ?? 0) : 0;
        }
        if (!poDetailItem) {
          poDetailItem = nextAvailable();
        }

        const detailPayload: any = {
          po_detail_item: poDetailItem,
          order_no: Number(orderNo),
          item_code: itemCodeValue,
          description: r.description ?? null,
          delivery_date: r.deliveryDate,
          qty_invoiced: Number((r as any).qty_invoiced ?? 0),
          unit_price: Number(r.price ?? 0),
          act_price: Number((r as any).act_price ?? r.price ?? 0),
          std_cost_unit: Number((r as any).std_cost_unit ?? 0),
          quantity_ordered: Number(r.quantity ?? 0),
          quantity_received: Number((r as any).quantity_received ?? 0),
        };

        // use po_detail_item as the identifier for update/delete (backend primary key)
        if (poDetailItem && poDetailItem > 0) {
          try {
            await updatePurchOrderDetail(poDetailItem, detailPayload);
          } catch (err) {
            console.warn(`Failed to update detail ${poDetailItem}:`, err);
          }
        } else {
          try {
            await createPurchOrderDetail(detailPayload);
          } catch (err) {
            console.warn("Failed to create detail:", err);
          }
        }
      }

      // invalidate purch order caches so maintenance list refreshes
      try {
        // Invalidate and refetch both active and inactive queries to ensure other pages get fresh data
        await queryClient.invalidateQueries({ queryKey: ["purchOrders"], refetchType: 'all' });
        await queryClient.invalidateQueries({ queryKey: ["purchOrderDetails"], refetchType: 'all' });
        // Additionally request an immediate refetch to be extra sure
        await queryClient.refetchQueries({ queryKey: ["purchOrders"], exact: false });
        await queryClient.refetchQueries({ queryKey: ["purchOrderDetails"], exact: false });
      } catch (e) {
        console.warn("Failed to invalidate/refetch queries:", e);
      }

      alert("Purchase order updated successfully.");
      navigate(-1);
    } catch (error) {
      console.error("Error updating purchase order:", error);
      alert("Failed to update purchase order. See console for details.");
    }
  };

  const breadcrumbItems = [
    { title: "Purchases", href: "/purchases" },
    { title: "Modify Purchase Order" },
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
          <PageTitle title="Modify Purchase Order" />
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
              <TextField
                fullWidth
                label="Supplier"
                size="small"
                value={(() => {
                  const s = (suppliers || []).find((x: any) => String(x.supplier_id ?? x.id ?? x.debtor_no) === String(supplier));
                  return s ? (s.supp_name ?? s.name ?? s.supplier_name ?? "") : "";
                })()}
                InputProps={{ readOnly: true }}
              />

              <TextField
                label="Order Date"
                type="date"
                fullWidth
                size="small"
                value={orderDate}
                onChange={(e) => handleDateChange(e.target.value)}
                InputLabelProps={{ shrink: true }}
                error={!!dateError}
                helperText={dateError}
              />

              <TextField label="Current Credit" fullWidth size="small" value={credit} InputProps={{ readOnly: true }} />

              <TextField label="Reference" fullWidth size="small" value={reference} InputProps={{ readOnly: true }} />
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <TextField label="Supplier's Reference" fullWidth size="small" value={supplierRef} onChange={(e) => setSupplierRef(e.target.value)} />

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
              <TableCell>Required Delivery Date</TableCell>
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
                    value={row.stockId}
                    onChange={(e) => {
                      const selectedStockId = e.target.value;
                      const selected = (items || []).find((it) => String(it.stock_id ?? it.id) === String(selectedStockId));
                      handleChange(row.id, "stockId", String(selectedStockId));
                      if (selected) {
                        const unitObj = (itemUnits || []).find((u) => String(u.id) === String(selected.units) || String(u.abbr) === String(selected.units));
                        handleChange(row.id, "description", selected.description);
                        handleChange(row.id, "itemCode", String(selected.stock_id ?? selected.id));
                        handleChange(row.id, "unit", unitObj ? (unitObj.abbr ?? String(unitObj.unit_code ?? unitObj.code ?? "")) : String(selected.units ?? ""));
                        // fetch supplier-specific purchase price if available, fallback to material_cost
                        (async () => {
                          try {
                            const supplierIdNum = Number(supplier) || null;
                            if (supplierIdNum) {
                              const purch = await getPurchDataById(supplierIdNum, String(selected.stock_id ?? selected.id ?? ""));
                              if (purch && typeof purch.price !== 'undefined' && purch.price !== null) {
                                handleChange(row.id, "price", Number(purch.price));
                                return;
                              }
                            }
                          } catch (err) {
                            // ignore and fallback
                          }
                          handleChange(row.id, "price", selected.material_cost);
                        })();
                      }
                    }}
                  >
                    {(() => {
                      const filteredItems = items;
                      return (Object.entries(
                        filteredItems.reduce((groups: Record<string, any[]>, item) => {
                          const catId = item.category_id || "Uncategorized";
                          if (!groups[catId]) groups[catId] = [];
                          groups[catId].push(item);
                          return groups;
                        }, {})
                      ) as [string, any][]).map(([categoryId, groupedItems]) => {
                        const category = categories.find(cat => cat.category_id === Number(categoryId));
                        const categoryLabel = category ? category.description : `Category ${categoryId}`;
                        return [
                          <ListSubheader key={`cat-${categoryId}`}>
                            {categoryLabel}
                          </ListSubheader>,
                          groupedItems.map((item) => (
                            <MenuItem key={item.stock_id} value={item.stock_id}>
                              {item.description}
                            </MenuItem>
                          ))
                        ];
                      });
                    })()}
                  </TextField>
                </TableCell>

                {/* Quantity */}
                <TableCell>
                  <TextField size="small" type="number" value={row.quantity} onChange={(e) => handleChange(row.id, "quantity", Number(e.target.value))} />
                </TableCell>

                {/* Unit */}
                <TableCell>
                  <TextField size="small" value={row.unit || resolveUnitAbbr(row.unit)} InputProps={{ readOnly: true }} />
                </TableCell>

                {/* Delivery Date */}
                <TableCell>
                  <TextField
                    size="small"
                    type="date"
                    value={row.deliveryDate}
                    onChange={(e) => handleChange(row.id, "deliveryDate", e.target.value)}
                  />
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
              <TableCell colSpan={7} sx={{ fontWeight: 600 }}>
                Sub-total
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{subTotal.toFixed(2)}</TableCell>
              <TableCell></TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={7} sx={{ fontWeight: 600 }}>
                Amount Total
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{subTotal.toFixed(2)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      {/* Memo Section */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Memo
        </Typography>
        <TextField fullWidth multiline rows={3} value={memo} onChange={(e) => setMemo(e.target.value)} />

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Cancel Order
          </Button>
          <Button variant="contained" color="primary" onClick={handlePlaceOrder}>
            Update Order
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
