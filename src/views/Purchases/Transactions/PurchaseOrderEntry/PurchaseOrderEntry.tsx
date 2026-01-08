import React, { useState, useEffect } from "react";
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
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";
import { getSuppliers } from "../../../../api/Supplier/SupplierApi";
import { getFiscalYears } from "../../../../api/FiscalYear/FiscalYearApi";
import { getCompanies } from "../../../../api/CompanySetup/CompanySetupApi";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getTags } from "../../../../api/DimensionTag/DimensionTagApi";
import { getItems } from "../../../../api/Item/ItemApi";
import { getItemUnits } from "../../../../api/ItemUnit/ItemUnitApi";
import { getItemCategories } from "../../../../api/ItemCategories/ItemCategoriesApi";
import { createPurchOrder, getPurchOrders } from '../../../../api/PurchOrders/PurchOrderApi';
import { createPurchOrderDetail } from '../../../../api/PurchOrders/PurchOrderDetailsApi';
import { getPurchDataById } from '../../../../api/PurchasingPricing/PurchasingPricingApi';
import auditTrailApi from '../../../../api/AuditTrail/AuditTrailApi';
import useCurrentUser from "../../../../hooks/useCurrentUser";

export default function PurchaseOrderEntry() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  // ========= Form Fields =========
  const [supplier, setSupplier] = useState("");
  const [supplierRef, setSupplierRef] = useState("");
  const [deliverTo, setDeliverTo] = useState("");
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dimension, setDimension] = useState("");
  const [credit, setCredit] = useState(0);
  const [receiveInto, setReceiveInto] = useState("");
  const [reference, setReference] = useState("");

  const [memo, setMemo] = useState("");
  const [dateError, setDateError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // order number will be generated from server-side sequence (client will request max+1)

  // API data states
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [items, setItems] = useState([]);
  const [itemUnits, setItemUnits] = useState([]);
  const [categories, setCategories] = useState<{ category_id: number; description: string }[]>([]);

  // Group items by category for rendering selects; typed as Record<string, any[]>
  const groupedItemsByCategory: Record<string, any[]> = (items || []).reduce((groups: Record<string, any[]>, item: any) => {
    const catId = item.category_id || "Uncategorized";
    if (!groups[catId]) groups[catId] = [];
    groups[catId].push(item);
    return groups;
  }, {} as Record<string, any[]>);

  // Helper to resolve supplier identifier (handles different backend shapes)
  const resolveSupplierId = (s: any) => s?.id ?? s?.supplier_id ?? s?.supp_id ?? s?.supplierId ?? s?.debtor_no ?? s?.code ?? s?.supp_code ?? null;

  // ========= Generate Reference =========
  // Fetch fiscal years to build fiscal-year-aware reference
  const { data: fiscalYears = [] } = useQuery({ queryKey: ["fiscalYears"], queryFn: getFiscalYears });

  const { data: companyData } = useQuery({
    queryKey: ["company"],
    queryFn: getCompanies,
  });

  // Find selected fiscal year from company setup
  const selectedFiscalYear = React.useMemo(() => {
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

  // Set initial date based on selected fiscal year
  useEffect(() => {
    if (selectedFiscalYear) {
      const currentYear = new Date().getFullYear();
      const fiscalYear = new Date(selectedFiscalYear.fiscal_year_from).getFullYear();
      let initialDate = "";
      if (fiscalYear === currentYear) {
        initialDate = new Date().toISOString().split("T")[0];
      } else {
        initialDate = new Date(selectedFiscalYear.fiscal_year_from).toISOString().split("T")[0];
      }
      setOrderDate(initialDate);
      validateDate(initialDate); // Validate immediately to show error if invalid
    }
  }, [selectedFiscalYear]);

  useEffect(() => {
    (async () => {
      if (!orderDate) return;

      const dateObj = new Date(orderDate);
      if (isNaN(dateObj.getTime())) return;

      // Determine fiscal year label
      let yearLabel = String(dateObj.getFullYear());
      
      if (fiscalYears.length > 0) {
        const matching = fiscalYears.find((fy: any) => {
          if (!fy.fiscal_year_from || !fy.fiscal_year_to) return false;
          const from = new Date(fy.fiscal_year_from);
          const to = new Date(fy.fiscal_year_to);
          if (isNaN(from.getTime()) || isNaN(to.getTime())) return false;
          return dateObj >= from && dateObj <= to;
        });

        const chosen = matching || [...fiscalYears]
          .filter((fy: any) => fy.fiscal_year_from && !isNaN(new Date(fy.fiscal_year_from).getTime()))
          .sort((a: any, b: any) => new Date(b.fiscal_year_from).getTime() - new Date(a.fiscal_year_from).getTime())
          .find((fy: any) => new Date(fy.fiscal_year_from) <= dateObj) || fiscalYears[0];

        if (chosen) {
          const fromYear = chosen.fiscal_year_from ? new Date(chosen.fiscal_year_from).getFullYear() : dateObj.getFullYear();
          const toYear = chosen.fiscal_year_to ? new Date(chosen.fiscal_year_to).getFullYear() : fromYear;
          yearLabel = chosen.fiscal_year || (fromYear === toYear ? String(fromYear) : `${fromYear}-${toYear}`);
        }
      }

      // Query existing purchase orders to find the highest sequential number for this fiscal year
      let nextNum = 1;
      try {
        const allOrders = await getPurchOrders();
        if (Array.isArray(allOrders) && allOrders.length > 0) {
          // Filter orders matching the current fiscal year pattern (e.g., "001/2025", "002/2025")
          const yearPattern = `/${yearLabel}`;
          const matchingRefs = allOrders
            .map((o: any) => o.reference ?? '')
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
        console.warn('Failed to fetch existing purchase orders for reference generation', e);
      }

      setReference(`${nextNum.toString().padStart(3, '0')}/${yearLabel}`);
    })();
  }, [orderDate, fiscalYears]);

  // ========= Update Credit When Supplier Changes =========
  useEffect(() => {
    const selected = suppliers.find((s) => String(resolveSupplierId(s)) === String(supplier));
    const creditLimit = selected ? Number(selected.credit_limit ?? selected.credit ?? selected.creditLimit ?? 0) : 0;
    setCredit(creditLimit);
  }, [supplier, suppliers]);

  // Auto-fill Deliver To with selected Receive Into location name (but keep editable).
  // If deliverTo was previously auto-filled from a location, changing the receiveInto
  // will update deliverTo to the new location name. If the user edited deliverTo
  // to a custom value, we won't overwrite it.
  const prevAutoDeliverRef = React.useRef<string>("");
  useEffect(() => {
    try {
      const selectedLoc = locations.find((l) => String(l.id) === String(receiveInto));
      const locName = selectedLoc ? (selectedLoc.location_name ?? selectedLoc.name ?? "") : "";
      if (!locName) return;

      const current = deliverTo ?? "";
      const isEmpty = current.toString().trim() === "";
      const wasAuto = current === prevAutoDeliverRef.current;

      if (isEmpty || wasAuto) {
        setDeliverTo(locName);
        prevAutoDeliverRef.current = locName;
      }
    } catch (e) {
      // ignore
    }
  }, [receiveInto, locations]);

  // ========= Fetch API Data =========
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersData, locationsData, dimensionsData, itemsData, itemUnitsData, categoriesData] = await Promise.all([
          getSuppliers(),
          getInventoryLocations(),
          getTags(),
          getItems(),
          getItemUnits(),
          getItemCategories(),
        ]);
        setSuppliers(suppliersData);
        // if supplier not selected yet, default to first supplier (resolve id field)
        if ((!supplier || supplier === "") && Array.isArray(suppliersData) && suppliersData.length > 0) {
          const first = suppliersData[0];
          const firstId = resolveSupplierId(first);
          if (firstId != null) setSupplier(String(firstId));
        }

        setLocations(locationsData);
        // if receiveInto not selected yet, default to first location
        if ((!receiveInto || receiveInto === "") && Array.isArray(locationsData) && locationsData.length > 0) {
          setReceiveInto(String(locationsData[0].id));
        }
        setDimensions(dimensionsData);
        setItems(itemsData);
        setItemUnits(itemUnitsData);
        setCategories(categoriesData);
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
      stockId: "",
      itemCode: "",
      description: "",
      quantity: 0,
      unit: "",
      deliveryDate: new Date().toISOString().split("T")[0],
      price: 0,
      total: 0,
      isEditing: true,
    },
  ]);

  const handleAddRow = () => {
    setRows((prev) => {
      if (prev.length === 0) {
        return [
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
            isEditing: true,
          },
        ];
      }

      const last = prev[prev.length - 1];
      // If last row is being edited, validate and commit it (set isEditing=false) and append a new editable row
      if (last && last.isEditing) {
        if (!validateRow(last)) return prev;
        const committed = { ...last, isEditing: false };
        return [
          ...prev.slice(0, -1),
          committed,
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
            isEditing: true,
          },
        ];
      }

      // otherwise just add a new editable row
      return [
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
          isEditing: true,
        },
      ];
    });
  };

  const handleRemoveRow = (id) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleChange = (id, field, value) => {
    setValidationMsg("");
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

  const setRowEditing = (id, editing) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, isEditing: editing } : r)));
    if (editing) setValidationMsg("");
  };

  const [validationMsg, setValidationMsg] = useState("");

  const validateRow = (r: any) => {
    const qty = Number(r.quantity ?? 0);
    const hasItem = !!(r.itemCode || r.stockId || r.description);
    if (!hasItem) {
      setValidationMsg('Please select an item before confirming.');
      return false;
    }
    if (isNaN(qty) || qty <= 0) {
      setValidationMsg('Quantity must be greater than zero.');
      return false;
    }
    setValidationMsg("");
    return true;
  };

  const validateAndConfirm = (id: number) => {
    const row = rows.find((x) => x.id === id);
    if (!row) return;
    if (!validateRow(row)) return;
    setRowEditing(id, false);
  };

  // ========= Subtotal =========
  const subTotal = rows.reduce((sum, r) => sum + r.total, 0);

  // ========= Place Order =========
  const handlePlaceOrder = () => {
    (async () => {
      try {
        // basic validations
        if (!supplier) { setSaveError('Select supplier first'); return; }
        const detailsToPost = rows.filter(r => r.itemCode && r.quantity > 0);
        if (detailsToPost.length === 0) { setSaveError('Add at least one item with quantity > 0'); return; }

        // resolve supplier id and location code
        const selectedSupplierObj = suppliers.find((s: any) => String(resolveSupplierId(s)) === String(supplier));
        const supplierIdToSend = selectedSupplierObj ? Number(resolveSupplierId(selectedSupplierObj)) : null;
        if (!supplierIdToSend) { throw new Error('Missing supplier id'); }
        const taxIncludedForSupplier = Boolean(selectedSupplierObj?.tax_included ?? selectedSupplierObj?.taxIncluded ?? false);

        const selectedLocationObj = locations.find((l: any) => String(l.id) === String(receiveInto));
        const intoLocationCode = selectedLocationObj ? (selectedLocationObj.loc_code || selectedLocationObj.location_name || String(receiveInto)) : String(receiveInto || "");

        setIsSaving(true);
        setSaveError("");

        // determine next order_no by querying existing purchase orders (safe small int)
        let nextOrderNo: number | null = null;
        try {
          const allOrders = await getPurchOrders();
          if (Array.isArray(allOrders) && allOrders.length > 0) {
            const nums = allOrders.map((o: any) => Number(o.order_no ?? o.id ?? 0)).filter((n: number) => !isNaN(n) && n > 0);
            const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
            nextOrderNo = maxNum + 1;
          } else {
            nextOrderNo = 1;
          }
        } catch (e) {
          console.warn('Failed to fetch existing purchase orders, falling back to 1', e);
          nextOrderNo = 1;
        }

        const payload: any = {
          order_no: nextOrderNo,
          supplier_id: supplierIdToSend,
          comments: memo || null,
          ord_date: orderDate,
          reference: reference,
          requisition_no: supplierRef || null,
          into_stock_location: intoLocationCode,
          delivery_address: deliverTo || "",
          total: Number(subTotal) || 0,
          prep_amount: 0,
          alloc: 0,
          tax_included: taxIncludedForSupplier,
        };

        const created = await createPurchOrder(payload);
        const usedOrderNo = (created && (created.order_no ?? created.id)) || nextOrderNo;

        // create each purchase order detail
        for (let idx = 0; idx < detailsToPost.length; idx++) {
          const r = detailsToPost[idx];
          // use incremental positive placeholders for po_detail_item: 1,2,3...
          const detail: any = {
            po_detail_item: idx + 1,
            order_no: usedOrderNo,
            item_code: r.itemCode,
            description: r.description || null,
            delivery_date: r.deliveryDate || orderDate,
            qty_invoiced: 0,
            unit_price: Number(r.price) || 0,
            act_price: 0,
            std_cost_unit: 0,
            quantity_ordered: Number(r.quantity) || 0,
            quantity_received: 0,
          };
          await createPurchOrderDetail(detail);
        }

        // Create audit trail entry for the purchase order
        try {
          const company = Array.isArray(companyData) && companyData.length > 0 ? companyData[0] : null;
          const fiscalYearIdToUse = company ? (company.fiscal_year_id ?? company.fiscal_year ?? null) : null;
          const currentUserId = user?.id ?? (Number(localStorage.getItem("userId")) || null);
          await auditTrailApi.create({
            type: 18,
            trans_no: usedOrderNo,
            user: currentUserId,
            stamp: new Date().toISOString(),
            description: "",
            fiscal_year: fiscalYearIdToUse,
            gl_date: orderDate,
            gl_seq: 0,
          });
        } catch (atErr) {
          console.warn('Failed to create audit trail for purchase order', atErr);
        }

        // Redirect to success page with relevant state
        navigate("/purchase/transactions/purchase-order-entry/success", {
          state: {
            location: intoLocationCode,
            reference: reference,
            date: orderDate,
            orderNo: usedOrderNo,
          },
        });
      } catch (err: any) {
        console.error('Failed to create purchase order', err);
        const detail = err?.response?.data ? JSON.stringify(err.response.data) : err?.message || String(err);
        setSaveError('Failed to save purchase order: ' + detail);
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const breadcrumbItems = [
    { title: "Purchases", href: "/purchases" },
    { title: "Purchase Order Entry" },
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
          <PageTitle title=" Purchase Order Entry" />
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
              <TextField select fullWidth label="Supplier" size="small" value={supplier} onChange={(e) => setSupplier(String(e.target.value))}>
                <MenuItem key="select-supplier" value="">Select supplier</MenuItem>
                {suppliers.map((s) => {
                  const sid = resolveSupplierId(s);
                  return (
                    <MenuItem key={String(sid ?? Math.random())} value={String(sid ?? "")}>
                      {s.supp_name ?? s.name ?? s.supplier_name}
                    </MenuItem>
                  );
                })}
              </TextField>

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

              <TextField select fullWidth label="Dimension" size="small" value={dimension} onChange={(e) => setDimension(String(e.target.value))}>
                {dimensions.map((d) => (
                  <MenuItem key={d.id} value={String(d.id)}>{d.name}</MenuItem>
                ))}
              </TextField>

              <TextField select fullWidth label="Receive Into" size="small" value={receiveInto} onChange={(e) => setReceiveInto(String(e.target.value))}>
                {locations.map((l) => (
                  <MenuItem key={l.id} value={String(l.id)}>{l.location_name}</MenuItem>
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
                  <TextField size="small" value={row.itemCode} InputProps={{ readOnly: true }} disabled={!row.isEditing} />
                </TableCell>

                {/* Description */}
                <TableCell>
                  <TextField
                    select
                    size="small"
                    value={row.description}
                    disabled={!row.isEditing}
                    onChange={(e) => {
                      const selected = items.find((item) => item.description === e.target.value);
                      if (selected) {
                        const unitObj = itemUnits.find((u) => String(u.id) === String(selected.units));
                        handleChange(row.id, "description", selected.description);
                        handleChange(row.id, "itemCode", String(selected.stock_id));
                        handleChange(row.id, "stockId", String(selected.stock_id));
                        handleChange(row.id, "unit", unitObj ? unitObj.abbr : String(selected.units));
                        // Fetch supplier-specific purchase price if available
                        (async () => {
                          try {
                            const supplierIdNum = Number(supplier) || null;
                            if (supplierIdNum) {
                              const purch = await getPurchDataById(supplierIdNum, String(selected.stock_id));
                              if (purch && typeof purch.price !== 'undefined' && purch.price !== null) {
                                handleChange(row.id, "price", Number(purch.price));
                                return;
                              }
                            }
                          } catch (err) {
                            // ignore and fallback
                          }
                          // fallback to material_cost
                          handleChange(row.id, "price", selected.material_cost);
                        })();
                      }
                    }}
                  >
                    {(Object.entries(groupedItemsByCategory) as [string, any[]][]).map(([categoryId, groupedItems]) => (
                      [
                        <ListSubheader key={`cat-${categoryId}`}>{categories.find(cat => cat.category_id === Number(categoryId))?.description ?? `Category ${categoryId}`}</ListSubheader>,
                        ...groupedItems.map((item: any) => (
                          <MenuItem key={item.stock_id} value={item.description}>
                            {item.description}
                          </MenuItem>
                        )),
                      ]
                    ))}
                  </TextField>
                </TableCell>

                {/* Quantity */}
                <TableCell>
                  <TextField size="small" type="number" value={row.quantity} disabled={!row.isEditing} onChange={(e) => handleChange(row.id, "quantity", Number(e.target.value))} />
                </TableCell>

                {/* Unit */}
                <TableCell>
                  <TextField size="small" value={row.unit} InputProps={{ readOnly: true }} disabled={!row.isEditing} />
                </TableCell>

                {/* Delivery Date */}
                <TableCell>
                  <TextField
                    size="small"
                    type="date"
                    value={row.deliveryDate}
                    disabled={!row.isEditing}
                    onChange={(e) => handleChange(row.id, "deliveryDate", e.target.value)}
                  />
                </TableCell>

                {/* Price Before Tax */}
                <TableCell>
                  <TextField size="small" type="number" value={row.price} disabled={!row.isEditing} onChange={(e) => handleChange(row.id, "price", Number(e.target.value))} />
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
                      {row.isEditing ? (
                        <Button variant="contained" size="small" onClick={() => setRowEditing(row.id, false)}>
                          Confirm
                        </Button>
                      ) : (
                        <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => setRowEditing(row.id, true)}>
                          Edit
                        </Button>
                      )}
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

      {validationMsg ? (
        <Box sx={{ mt: 1 }}>
          <Alert
            severity="error"
            icon={<ErrorOutlineIcon />}
            sx={{
              backgroundColor: (theme) => theme.palette.error.light + '22',
              borderRadius: 1,
            }}
          >
            {validationMsg}
          </Alert>
        </Box>
      ) : null}

      {saveError ? (
        <Box sx={{ mt: 2 }}>
          <Alert severity="error">{saveError}</Alert>
        </Box>
      ) : null}

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
          <Button variant="contained" color="primary" disabled={isSaving} onClick={handlePlaceOrder}>
            {isSaving ? "Placing..." : "Place Order"}
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
