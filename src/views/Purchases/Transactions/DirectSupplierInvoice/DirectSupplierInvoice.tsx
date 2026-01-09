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
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getTags } from "../../../../api/DimensionTag/DimensionTagApi";
import { getItems } from "../../../../api/Item/ItemApi";
import { getItemUnits } from "../../../../api/ItemUnit/ItemUnitApi";
import { getPaymentTypes } from "../../../../api/PaymentType/PaymentTypeApi";
import { getBankAccounts } from "../../../../api/BankAccount/BankAccountApi";
import { getItemCategories } from "../../../../api/ItemCategories/ItemCategoriesApi";
import { getPurchDataById } from "../../../../api/PurchasingPricing/PurchasingPricingApi";
import { getFiscalYears } from "../../../../api/FiscalYear/FiscalYearApi";
import { createPurchOrder, getPurchOrders } from "../../../../api/PurchOrders/PurchOrderApi";
import { createPurchOrderDetail } from "../../../../api/PurchOrders/PurchOrderDetailsApi";
import { createGrnBatch, getGrnBatches } from "../../../../api/GRN/GrnBatchApi";
import { createGrnItem, getGrnItems } from "../../../../api/GRN/GrnItemsApi";
import { createSuppTrans, getSuppTrans } from "../../../../api/SuppTrans/SuppTransApi";
import { createSuppInvoiceItem } from "../../../../api/SuppInvoiceItems/SuppInvoiceItemsApi";
import { getCompanies } from "../../../../api/CompanySetup/CompanySetupApi";
import auditTrailApi from "../../../../api/AuditTrail/AuditTrailApi";
import useCurrentUser from "../../../../hooks/useCurrentUser";

export default function DirectSupplierInvoice() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();

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
  const [bankAccounts, setBankAccounts] = useState([]);

  // API data states
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [items, setItems] = useState([]);
  const [itemUnits, setItemUnits] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [categories, setCategories] = useState<{ category_id: number; description: string }[]>([]);

  const [orderDateError, setOrderDateError] = useState("");

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

  // ========= Generate Reference =========
  const { data: fiscalYears = [] } = useQuery({ queryKey: ["fiscalYears"], queryFn: getFiscalYears });
  const { data: companyData } = useQuery({ queryKey: ["company"], queryFn: getCompanies });

  // Find selected fiscal year from company setup
  const selectedFiscalYear = useMemo(() => {
    if (!companyData || companyData.length === 0) return null;
    const company = companyData[0];
    return fiscalYears.find((fy: any) => fy.id === company.fiscal_year_id);
  }, [companyData, fiscalYears]);

  // Validate dates when fiscal year is selected
  useEffect(() => {
    if (selectedFiscalYear) {
      validateDate(orderDate, setOrderDateError);
    }
  }, [selectedFiscalYear]);

  useEffect(() => {
    (async () => {
      try {
        // Determine year: prefer fiscal year start if available, otherwise use current calendar year
        const year = selectedFiscalYear
          ? new Date(selectedFiscalYear.fiscal_year_from).getFullYear()
          : new Date().getFullYear();

        // Determine fiscal year label
        let yearLabel = String(year);
        if (selectedFiscalYear) {
          const fromYear = new Date(selectedFiscalYear.fiscal_year_from).getFullYear();
          const toYear = new Date(selectedFiscalYear.fiscal_year_to).getFullYear();
          yearLabel = selectedFiscalYear.fiscal_year || (fromYear === toYear ? String(fromYear) : `${fromYear}-${toYear}`);
        }

        // Query existing supplier transactions to determine next sequential reference for this fiscal year
        let nextNum = 1;
        try {
          const allSupp = await getSuppTrans();
          if (Array.isArray(allSupp) && allSupp.length > 0) {
            const yearPattern = `/${yearLabel}`;
            const matchingRefs = allSupp
              .map((s: any) => s.reference ?? s.supp_reference ?? '')
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
          console.warn('Failed to fetch supplier transactions for reference generation', e);
        }

        setReference(`${nextNum.toString().padStart(3, '0')}/${yearLabel}`);
      } catch (err) {
        console.warn('Failed to generate supplier invoice reference', err);
      }
    })();
  }, [selectedFiscalYear]);

  // ========= Update Credit When Supplier Changes =========
  // Helper to resolve supplier identifier (handles different backend shapes)
  const resolveSupplierId = (s: any) => s?.id ?? s?.supplier_id ?? null;

  useEffect(() => {
    const selected = (suppliers || []).find((s: any) => String(resolveSupplierId(s)) === String(supplier));
    setCredit(selected ? Number(selected.credit_limit ?? selected.credit ?? 0) : 0);
  }, [supplier, suppliers]);

  // ========= Fetch API Data =========
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersData, locationsData, dimensionsData, itemsData, itemUnitsData, paymentTypesData, bankAccountsData, categoriesData] = await Promise.all([
          getSuppliers(),
          getInventoryLocations(),
          getTags(),
          getItems(),
          getItemUnits(),
          getPaymentTypes(),
          getBankAccounts(),
          getItemCategories(),
        ]);
        setSuppliers(suppliersData);
        // default-select first supplier if none selected
        if ((!supplier || supplier === 0) && Array.isArray(suppliersData) && suppliersData.length > 0) {
          const first = suppliersData[0];
          const firstId = resolveSupplierId(first);
          if (firstId != null) setSupplier(Number(firstId));
        }
        setLocations(locationsData);
        setDimensions(dimensionsData);
        setItems(itemsData);
        setItemUnits(itemUnitsData);
        setPaymentTypes(paymentTypesData);
        const normalizedBankAccounts = bankAccountsData?.data ?? bankAccountsData ?? [];
        setBankAccounts(Array.isArray(normalizedBankAccounts) ? normalizedBankAccounts : []);
        setCategories(categoriesData);
        // default select first location if none selected
        if ((!receiveInto || receiveInto === 0) && Array.isArray(locationsData) && locationsData.length > 0) {
          setReceiveInto(Number(locationsData[0].id));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // auto-fill Deliver To from Receive Into but allow edits
  const prevAutoDeliverRef = React.useRef<string>("");
  useEffect(() => {
    try {
      const selectedLoc = (locations || []).find((l: any) => String(l.id) === String(receiveInto) || String(l.loc_code) === String(receiveInto));
      const locName = selectedLoc ? (selectedLoc.location_name ?? selectedLoc.name ?? selectedLoc.loc_code ?? "") : "";
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

  // ========= Table Rows =========
  const [rows, setRows] = useState([
    {
      id: 1,
      stockId: "",
      itemCode: "",
      description: "",
      quantity: 0,
      unit: "",
      price: 0,
      total: 0,
      isEditing: true,
    },
  ]);

  const [validationMsg, setValidationMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

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
            price: 0,
            total: 0,
            isEditing: true,
          },
        ];
      }

      const last = prev[prev.length - 1];
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
            price: 0,
            total: 0,
            isEditing: true,
          },
        ];
      }

      return [
        ...prev,
        {
          id: prev.length + 1,
          stockId: "",
          itemCode: "",
          description: "",
          quantity: 0,
          unit: "",
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
    setValidationMsg("");
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, isEditing: editing } : r)));
  };

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
        // require supplier's reference
        if (!supplierRef || String(supplierRef).trim() === "") {
          setSaveError("Supplier's Reference is required to process the invoice.");
          return;
        }

        if (!supplier) { setSaveError('Select supplier first'); return; }
        const detailsToPost = rows.filter(r => (r.itemCode || r.stockId) && r.quantity > 0);
        if (detailsToPost.length === 0) { setValidationMsg('Add at least one item with quantity > 0'); return; }

        const supplierIdToSend = Number(supplier) || null;
        if (!supplierIdToSend) { throw new Error('Missing supplier id'); }
        const selectedSupplierObj = (suppliers || []).find((s: any) => String(resolveSupplierId(s)) === String(supplier));
        const taxIncludedForSupplier = Boolean(selectedSupplierObj?.tax_included ?? selectedSupplierObj?.taxIncluded ?? false);

        const selectedLocationObj = (locations || []).find((l: any) => Number(l.id) === Number(receiveInto));
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

        // create purchase order header (ord_date = invoice date)
        const poPayload: any = {
          order_no: nextOrderNo,
          supplier_id: supplierIdToSend,
          comments: memo || null,
          ord_date: orderDate,
          reference: 'auto',
          requisition_no: supplierRef || null,
          into_stock_location: intoLocationCode,
          delivery_address: deliverTo || "",
          total: Number(subTotal) || 0,
          prep_amount: 0,
          alloc: 0,
          tax_included: taxIncludedForSupplier,
        };

        const createdPo = await createPurchOrder(poPayload);
        const usedOrderNo = (createdPo && (createdPo.order_no ?? createdPo.id)) || nextOrderNo;

        // audit trail: Purchase Order (type 18)
        try {
          const company = Array.isArray(companyData) && companyData.length > 0 ? companyData[0] : null;
          const fiscalYearIdToUse = company ? (company.fiscal_year_id ?? company.fiscal_year ?? null) : (selectedFiscalYear?.id ?? null);
          const currentUserId = user?.id ?? Number(localStorage.getItem("userId")) ?? 0;
          const auditPo: any = {
            type: 18,
            trans_no: usedOrderNo,
            user: currentUserId,
            stamp: new Date().toISOString(),
            description: '',
            fiscal_year: fiscalYearIdToUse,
            gl_date: orderDate,
            gl_seq: 0,
          };
          try { const resp = await auditTrailApi.create(auditPo); console.log('Audit PO created', resp); } catch (e) { console.warn('Audit PO create failed', e); }
        } catch (e) {
          console.warn('Failed to prepare audit PO payload', e);
        }

        // create purchase order details and collect returned detail objects
        const createdDetails: any[] = [];
        for (let idx = 0; idx < detailsToPost.length; idx++) {
          const r = detailsToPost[idx];
          // derive std_cost_unit from items/material_cost when available
          const matchedItem = (items || []).find((it: any) => String(it.stock_id ?? it.item_code ?? it.item) === String(r.itemCode ?? r.stockId ?? ""));
          const materialCost = matchedItem ? Number(matchedItem.material_cost ?? matchedItem.cost_price ?? 0) : 0;
          const detail: any = {
            po_detail_item: idx + 1,
            order_no: usedOrderNo,
            item_code: r.itemCode ?? r.stockId ?? null,
            description: r.description || null,
            delivery_date: dueDate,
            qty_invoiced: 0,
            unit_price: Number(r.price) || 0,
            act_price: Number(r.price) || 0,
            std_cost_unit: materialCost || 0,
            quantity_ordered: Number(r.quantity) || 0,
            quantity_received: Number(r.quantity) || 0,
          };
          try {
            const createdDetail = await createPurchOrderDetail(detail);
            createdDetails.push(createdDetail ?? detail);
          } catch (err) {
            console.warn('Failed to create purch order detail:', err);
            createdDetails.push(detail);
          }
        }

        // create GRN batch (delivery_date = dueDate)
        const grnBatchPayload: any = {
          supplier_id: supplierIdToSend,
          purch_order_no: usedOrderNo,
          reference: 'auto',
          delivery_date: dueDate,
          loc_code: intoLocationCode,
          rate: 1,
        };

        const createdGrn = await createGrnBatch(grnBatchPayload);
        let grnBatchId: any = null;
        if (createdGrn) {
          grnBatchId = createdGrn.id ?? createdGrn.grn_batch_id ?? createdGrn.batch_id ?? createdGrn.grn_id ?? createdGrn.data?.id ?? createdGrn.data?.grn_batch_id ?? null;
        }
        if (!grnBatchId) {
          try {
            const allBatches = await getGrnBatches();
            if (Array.isArray(allBatches) && allBatches.length > 0) {
              const candidate = allBatches
                .filter((b: any) => (Number(b.purch_order_no ?? b.purch_order) === Number(usedOrderNo)))
                .filter((b: any) => (Number(b.supplier_id ?? b.supp_id ?? b.supplier) === Number(supplierIdToSend)))
                .filter((b: any) => (String(b.delivery_date ?? b.del_date ?? b.date) === String(dueDate)))
                .sort((x: any, y: any) => Number(y.id ?? y.grn_batch_id ?? 0) - Number(x.id ?? x.grn_batch_id ?? 0));
              if (candidate.length > 0) {
                const found = candidate[0];
                grnBatchId = found.id ?? found.grn_batch_id ?? found.batch_id ?? found.grn_id ?? found.data?.id ?? null;
              }
            }
          } catch (e) {
            console.warn('Fallback lookup for GRN batch failed:', e);
          }
        }
        if (!grnBatchId) throw new Error('Failed to obtain grn_batch id');

        // audit trail: GRN batch (type 25)
        try {
          const company = Array.isArray(companyData) && companyData.length > 0 ? companyData[0] : null;
          const fiscalYearIdToUse = company ? (company.fiscal_year_id ?? company.fiscal_year ?? null) : (selectedFiscalYear?.id ?? null);
          const currentUserId = user?.id ?? Number(localStorage.getItem("userId")) ?? 0;
          const auditGrn: any = {
            type: 25,
            trans_no: grnBatchId,
            user: currentUserId,
            stamp: new Date().toISOString(),
            description: '',
            fiscal_year: fiscalYearIdToUse,
            gl_date: orderDate,
            gl_seq: 0,
          };
          try { const resp = await auditTrailApi.create(auditGrn); console.log('Audit GRN created', resp); } catch (e) { console.warn('Audit GRN create failed', e); }
        } catch (e) {
          console.warn('Failed to prepare audit GRN payload', e);
        }

        // create GRN items and collect created items (store extracted id)
        const createdGrnItems: any[] = [];
        for (let idx = 0; idx < detailsToPost.length; idx++) {
          const r = detailsToPost[idx];
          const createdDetail = createdDetails[idx] || null;
          const poItem = createdDetail?.po_detail_item ?? createdDetail?.po_detail_id ?? createdDetail?.id ?? (idx + 1);
          const grnItemPayload: any = {
            grn_batch_id: grnBatchId,
            po_detail_item: poItem,
            item_code: r.itemCode ?? r.stockId ?? null,
            description: r.description || null,
            qty_recd: Number(r.quantity) || 0,
            quantity_inv: Number(r.quantity) || 0,
          };
          try {
            const created = await createGrnItem(grnItemPayload);
            let extractedId = created?.id ?? created?.grn_item_id ?? created?.grn_item?.id ?? created?.data?.id ?? created?.data?.grn_item_id ?? null;

            // fallback: if no id returned, try to find the created GRN item by matching attributes
            if (!extractedId) {
              try {
                const allItems = await getGrnItems();
                if (Array.isArray(allItems) && allItems.length > 0) {
                  const candidates = allItems
                    .filter((it: any) => Number(it.grn_batch_id ?? it.batch_id ?? it.grn_batch ?? 0) === Number(grnBatchId))
                    .filter((it: any) => Number(it.po_detail_item ?? it.po_item ?? 0) === Number(poItem))
                    .filter((it: any) => (String(it.item_code ?? it.stock_id ?? it.item) === String(grnItemPayload.item_code)))
                    .filter((it: any) => Number(it.qty_recd ?? it.quantity ?? it.qty ?? 0) === Number(grnItemPayload.qty_recd));
                  if (candidates.length > 0) {
                    const found = candidates.sort((a: any, b: any) => Number(b.id ?? b.grn_item_id ?? 0) - Number(a.id ?? a.grn_item_id ?? 0))[0];
                    extractedId = found.id ?? found.grn_item_id ?? found.grn_item_id ?? found.data?.id ?? null;
                  }
                }
              } catch (e) {
                console.warn('Fallback lookup for GRN item failed:', e);
              }
            }

            createdGrnItems.push({ raw: created ?? grnItemPayload, id: extractedId });
          } catch (err) {
            console.warn('Failed to create GRN item:', err, 'payload:', grnItemPayload);
            createdGrnItems.push({ raw: grnItemPayload, id: null });
          }
        }

        // create supplier transaction (supp_trans)
        let nextTransNo = 1;
        try {
          const allSupp = await getSuppTrans();
          const relevant = Array.isArray(allSupp)
            ? allSupp.filter((t: any) => Number(t.trans_type ?? t.type ?? 0) === 20)
            : [];
          if (relevant.length > 0) {
            const nums = relevant
              .map((t: any) => Number(t.trans_no ?? t.transno ?? t.id ?? 0))
              .filter((n: number) => !isNaN(n) && n > 0);
            if (nums.length > 0) {
              nextTransNo = Math.max(...nums) + 1;
            }
          }
        } catch (e) {
          console.warn('Failed to compute next supp trans_no, defaulting to 1', e);
          nextTransNo = 1;
        }

        const suppTransPayload: any = {
          trans_no: nextTransNo,
          trans_type: 20,
          supplier_id: supplierIdToSend,
          reference: reference || '',
          supp_reference: supplierRef || '',
          trans_date: orderDate,
          due_date: dueDate,
          ov_amount: Number(subTotal) || 0,
          ov_discount: 0,
          ov_gst: 0,
          rate: 1,
          alloc: 0,
          tax_included: taxIncludedForSupplier ? 1 : 0,
        };
        const createdSuppTrans = await createSuppTrans(suppTransPayload);
        const suppTransNo = createdSuppTrans?.trans_no ?? createdSuppTrans?.id ?? createdSuppTrans?.supp_trans_no ?? null;

        // audit trail: supplier transaction (type 20)
        try {
          const company = Array.isArray(companyData) && companyData.length > 0 ? companyData[0] : null;
          const fiscalYearIdToUse = company ? (company.fiscal_year_id ?? company.fiscal_year ?? null) : (selectedFiscalYear?.id ?? null);
          const currentUserId = user?.id ?? Number(localStorage.getItem("userId")) ?? 0;
          const auditSupp: any = {
            type: 20,
            trans_no: suppTransNo,
            user: currentUserId,
            stamp: new Date().toISOString(),
            description: '',
            fiscal_year: fiscalYearIdToUse,
            gl_date: orderDate,
            gl_seq: 0,
          };
          try { const resp = await auditTrailApi.create(auditSupp); console.log('Audit supp_trans created', resp); } catch (e) { console.warn('Audit supp_trans create failed', e); }
        } catch (e) {
          console.warn('Failed to prepare audit supp_trans payload', e);
        }

        // create supp_invoice_items for each detail
        for (let idx = 0; idx < detailsToPost.length; idx++) {
          const r = detailsToPost[idx];
          const createdDetail = createdDetails[idx] || {};
            const createdGrnItem = createdGrnItems[idx] || { id: null, raw: null };
            const suppInvItem: any = {
            supp_trans_no: suppTransNo,
            supp_trans_type: 20,
            gl_code: "0",
            grn_item_id: createdGrnItem?.id ?? createdGrnItem?.raw?.id ?? createdGrnItem?.raw?.grn_item_id ?? null,
            po_detail_item_id: createdDetail?.po_detail_item ?? createdDetail?.id ?? null,
            stock_id: r.itemCode ?? r.stockId ?? null,
            description: r.description || createdDetail?.description || null,
            quantity: Number(r.quantity) || Number(createdDetail?.quantity_ordered) || 0,
            unit_price: Number(r.price) || Number(createdDetail?.unit_price) || 0,
            unit_tax: 0,
            memo: memo || "",
            dimension_id: dimension || 0,
            dimension2_id: 0,
          };
          try {
            await createSuppInvoiceItem(suppInvItem);
          } catch (err) {
            console.warn('Failed to create supp invoice item:', err, 'payload:', suppInvItem);
          }
        }

        // prepare state for success page and view page
        const successState: any = {
          location: intoLocationCode,
          reference: reference,
          date: orderDate,
          supplier: supplierIdToSend,
          supplierRef: supplierRef,
          invoiceDate: orderDate,
          dueDate: dueDate,
          items: detailsToPost.map((r) => ({
            delivery: dueDate,
            item: r.itemCode ?? r.stockId ?? null,
            description: r.description || "",
            quantity: Number(r.quantity) || 0,
            price: Number(r.price) || 0,
            lineValue: (Number(r.quantity) || 0) * (Number(r.price) || 0),
          })),
          subtotal: subTotal,
          totalInvoice: subTotal,
        };

        navigate('/purchase/transactions/direct-supplier-invoice/success', { state: successState });
      } catch (err: any) {
        console.error('Failed to process supplier invoice', err);
        const detail = err?.response?.data ? JSON.stringify(err.response.data) : err?.message || String(err);
        setSaveError('Failed to process supplier invoice: ' + detail);
      } finally {
        setIsSaving(false);
      }
    })();
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
                  <MenuItem key={s.supplier_id} value={s.supplier_id}>{s.supp_name}</MenuItem>
                ))}
              </TextField>

              <TextField label="Invoice Date" type="date" fullWidth size="small" value={orderDate} onChange={(e) => { setOrderDate(e.target.value); validateDate(e.target.value, setOrderDateError); }} InputLabelProps={{ shrink: true }} inputProps={{ min: selectedFiscalYear ? new Date(selectedFiscalYear.fiscal_year_from).toISOString().split('T')[0] : undefined, max: selectedFiscalYear ? new Date(selectedFiscalYear.fiscal_year_to).toISOString().split('T')[0] : undefined, }} error={!!orderDateError} helperText={orderDateError} />

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
                  <TextField size="small" value={row.itemCode} InputProps={{ readOnly: true }} disabled={!row.isEditing} />
                </TableCell>

                {/* Description */}
                <TableCell>
                  <TextField
                    select
                    size="small"
                    value={row.stockId}
                    disabled={!row.isEditing}
                    onChange={(e) => {
                      const selectedStockId = e.target.value;
                      const selected = items.find((it) => it.stock_id === selectedStockId);
                      handleChange(row.id, "stockId", selectedStockId);
                        if (selected) {
                        const unitObj = itemUnits.find((u) => u.id === selected.units);
                        handleChange(row.id, "description", selected.description);
                        handleChange(row.id, "itemCode", selected.stock_id);
                        handleChange(row.id, "unit", unitObj ? unitObj.abbr : selected.units);
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
                  <TextField size="small" type="number" value={row.quantity} disabled={!row.isEditing} onChange={(e) => handleChange(row.id, "quantity", Number(e.target.value))} />
                </TableCell>

                {/* Unit */}
                <TableCell>
                  <TextField size="small" value={row.unit} InputProps={{ readOnly: true }} />
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
                        <Button variant="contained" size="small" onClick={() => validateAndConfirm(row.id)}>
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
              <TableCell align="center">
                <Button variant="contained" size="small" color="primary">
                  Update
                </Button>
              </TableCell>
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

      {/* Payment Section */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Payment
        </Typography>
        <TextField
          select
          fullWidth
          label="Bank Account"
          size="small"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(Number(e.target.value))}
        >
          {(() => {
            const accounts = Array.isArray(bankAccounts) ? bankAccounts : [];
            const visible = accounts.filter((b: any) => {
              let t: any = b.account_type ?? b.type ?? b.accountType ?? b.type_id ?? b.accounttype ?? b.account_type_id ?? b.accountTypeId ?? null;
              if (t && typeof t === "object") {
                t = t.id ?? t.account_type ?? t.type ?? t.accountType ?? t.type_id ?? null;
              }
              return String(t) === "4" || Number(t) === 4;
            });
            return visible.map((b: any) => (
              <MenuItem key={b.id ?? b.bank_account_id ?? b.account_id} value={b.id ?? b.bank_account_id ?? b.account_id}>
                {b.bank_account_name ?? b.account_name ?? `${b.bank_name || ''}`}
              </MenuItem>
            ));
          })()}
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
                <Button variant="contained" color="primary" onClick={handlePlaceOrder} disabled={isSaving || !!orderDateError}>
            {isSaving ? 'Processing...' : 'Process Invoice'}
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
