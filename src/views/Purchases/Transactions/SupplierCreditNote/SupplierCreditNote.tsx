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
    ListSubheader,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSuppliers } from "../../../../api/Supplier/SupplierApi";
import { getTags } from "../../../../api/DimensionTag/DimensionTagApi";
import { getTaxGroups } from "../../../../api/Tax/taxServices";
import { getPaymentTerms } from "../../../../api/PaymentTerm/PaymentTermApi";
import { getChartMasters } from "../../../../api/GLAccounts/ChartMasterApi";
import { getGrnBatches } from "../../../../api/GRN/GrnBatchApi";
import { getGrnItems, getGrnItemById, updateGrnItem } from "../../../../api/GRN/GrnItemsApi";
import { getPurchDataById } from "../../../../api/PurchasingPricing/PurchasingPricingApi";
import { getSuppTrans, createSuppTrans } from "../../../../api/SuppTrans/SuppTransApi";
import { getPurchOrderDetails, updatePurchOrderDetail } from "../../../../api/PurchOrders/PurchOrderDetailsApi";
import { createSuppInvoiceItem } from "../../../../api/SuppInvoiceItems/SuppInvoiceItemsApi";
import { getFiscalYears } from "../../../../api/FiscalYear/FiscalYearApi";
import { createComment } from "../../../../api/Comments/CommentsApi";
import auditTrailApi from "../../../../api/AuditTrail/AuditTrailApi";
import useCurrentUser from "../../../../hooks/useCurrentUser";

export default function SupplierCreditNote() {
    const navigate = useNavigate();

    // ================= Form States =================
    const [supplier, setSupplier] = useState(0);
    const [dueDate, setDueDate] = useState("");
    const [invoiceDate, setInvoiceDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [taxGroup, setTaxGroup] = useState(0);
    const [terms, setTerms] = useState(0);
    const [credit, setCredit] = useState(0);
    const [reference, setReference] = useState("");
    const [dimension, setDimension] = useState(0);
    const [sourceInvoices, setSourceInvoices] = useState("");
    const [supplierRef, setSupplierRef] = useState("");
    const [memo, setMemo] = useState("");

    // Date range filter for GRN items table
    const [receivedFromDate, setReceivedFromDate] = useState("");
    const [receivedToDate, setReceivedToDate] = useState("");

    // keep due date in sync with invoice date when due date is empty
    useEffect(() => {
        if (!dueDate && invoiceDate) {
            setDueDate(invoiceDate);
        }
    }, [invoiceDate, dueDate]);

    // API Data
    const [suppliers, setSuppliers] = useState([]);
    const [dimensions, setDimensions] = useState([]);
    const [taxGroups, setTaxGroups] = useState([]);
    const [termList, setTermList] = useState([]);
    const [chartMasters, setChartMasters] = useState([]);
    const [taxGroupDesc, setTaxGroupDesc] = useState("");
    const [termsDesc, setTermsDesc] = useState("");
    const { user } = useCurrentUser();

    const accountTypeMap: { [key: number]: string } = {
        "1": "Current Assets",
        "2": "Inventory Assets",
        "3": "Capital Assets",
        "4": "Current Liabilities",
        "5": "Long Term Liabilities",
        "6": "Share Capital",
        "7": "Retained Earnings",
        "8": "Sales Revenue",
        "9": "Other Revenue",
        "10": "Cost of Good Sold",
        "11": "Payroll Expenses",
        "12": "General and Adminitrative Expenses",
    };

    // Fiscal-year aware Reference (scoped to supplier credit notes trans_type 21)
    const { data: fiscalYears = [] } = useQuery({ queryKey: ["fiscalYears"], queryFn: getFiscalYears });

    useEffect(() => {
        (async () => {
            try {
                if (!invoiceDate) return;
                const dateObj = new Date(invoiceDate);
                if (isNaN(dateObj.getTime())) return;

                // determine fiscal year label (fallback to calendar year)
                let yearLabel = String(dateObj.getFullYear());
                if (Array.isArray(fiscalYears) && fiscalYears.length > 0) {
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

                // compute next sequential number for trans_type 21 within this fiscal year
                let nextNum = 1;
                try {
                    const allSupp = await getSuppTrans();
                    if (Array.isArray(allSupp) && allSupp.length > 0) {
                        const yearPattern = `/${yearLabel}`;
                        const matchingRefs = allSupp
                            .filter((t: any) => Number(t.trans_type ?? t.type ?? 0) === 21)
                            .map((s: any) => s.reference ?? s.supp_reference ?? '')
                            .filter((ref: string) => String(ref).endsWith(yearPattern))
                            .map((ref: string) => {
                                const parts = String(ref).split('/');
                                if (parts.length < 2) return 0;
                                const numPart = parts[0];
                                const parsed = parseInt(numPart, 10);
                                return isNaN(parsed) ? 0 : parsed;
                            })
                            .filter((n: number) => n > 0);

                        if (matchingRefs.length > 0) {
                            nextNum = Math.max(...matchingRefs) + 1;
                        }
                    }
                } catch (e) {
                    console.warn('Failed to fetch supplier transactions for credit note reference generation', e);
                }

                setReference(`${nextNum.toString().padStart(3, '0')}/${yearLabel}`);
            } catch (err) {
                console.warn('Failed to generate supplier credit note reference', err);
            }
        })();
    }, [invoiceDate, fiscalYears]);

    // Fetch API
    useEffect(() => {
        const load = async () => {
            const [s, d, t, p, c] = await Promise.all([
                getSuppliers(),
                getTags(),
                getTaxGroups(),
                getPaymentTerms(),
                getChartMasters(),
            ]);
            setSuppliers(s);
            setDimensions(d);
            setTaxGroups(t);
            setTermList(p);
            setChartMasters(c);
            // default-select first supplier if none selected
            try {
                if ((!supplier || supplier === 0) && Array.isArray(s) && s.length > 0) {
                    const first = s[0];
                    const firstId = first?.supplier_id ?? first?.id ?? null;
                    if (firstId != null) setSupplier(Number(firstId));
                }
            } catch (err) {
                console.warn('Failed to default select supplier', err);
            }
        };
        load();
    }, []);

    // Update payment terms and tax group when supplier changes
    useEffect(() => {
        const find = suppliers.find((x) => Number(x.supplier_id ?? x.id ?? x.supplier) === Number(supplier));
        if (find) {
            // supplier.tax_group may be an id or an object with {id, description}
            let supplierTaxGroupId: any = find.tax_group ?? find.taxGroup ?? find.taxgroup ?? find.tax_group_id ?? null;
            const supplierPaymentTerms = find.payment_terms ?? find.paymentTerms ?? find.terms ?? null;

            // If tax_group is an object, extract id and description
            let supplierTaxGroupDesc = "";
            if (supplierTaxGroupId && typeof supplierTaxGroupId === 'object') {
                supplierTaxGroupDesc = supplierTaxGroupId.description ?? supplierTaxGroupId.desc ?? "";
                supplierTaxGroupId = supplierTaxGroupId.id ?? null;
            }

            setTaxGroup(Number(supplierTaxGroupId) || 0);
            setTerms(Number(supplierPaymentTerms) || 0);

            // normalize taxGroups which may be an array, an object with `data`, or a single object
            const tgCandidates = Array.isArray(taxGroups)
                ? taxGroups
                : (taxGroups && Array.isArray((taxGroups as any).data))
                    ? (taxGroups as any).data
                    : taxGroups
                        ? [taxGroups]
                        : [];

            if (!supplierTaxGroupDesc) {
                const tg = (tgCandidates || []).find((t: any) => Number(t.id) === Number(supplierTaxGroupId));
                supplierTaxGroupDesc = tg ? (tg.description ?? tg.desc ?? '') : "";
            }
            setTaxGroupDesc(supplierTaxGroupDesc);

            const ptCandidates = Array.isArray(termList) ? termList : ((termList && Array.isArray((termList as any).data)) ? (termList as any).data : termList ? [termList] : []);
            const pt = (ptCandidates || []).find((t: any) => t.terms_indicator === supplierPaymentTerms || t.id === supplierPaymentTerms);
            setTermsDesc(pt ? pt.description : "");
        } else {
            setTaxGroup(0);
            setTerms(0);
            setTaxGroupDesc("");
            setTermsDesc("");
        }
    }, [supplier, suppliers, taxGroups, termList]);

    // Load GRN batches and items for the selected supplier and populate itemRows
    useEffect(() => {
        const loadGrnData = async () => {
            try {
                if (!supplier) {
                    setItemRows([{
                        id: 1,
                        delivery: "",
                        po: "",
                        item: "",
                        description: "",
                        receivedOn: "",
                        qtyReceived: 0,
                        qtyInvoiced: 0,
                        qtyYet: 0,
                        price: 0,
                        total: 0,
                        included: false,
                        grn_item_id: null,
                        po_detail_item: null,
                        po_item_detail: null,
                    }]);
                    return;
                }

                const [batchesRes, itemsRes] = await Promise.all([getGrnBatches(), getGrnItems()]);
                const batches = Array.isArray(batchesRes) ? batchesRes : (batchesRes?.data ?? []);
                const items = Array.isArray(itemsRes) ? itemsRes : (itemsRes?.data ?? []);

                const supplierIdNum = Number(supplier);

                const filteredBatches = (batches || []).filter((b: any) => {
                    const ref = (b.reference ?? b.ref ?? "").toString().toLowerCase();
                    const bidSupplier = Number(b.supplier_id ?? b.supp_id ?? b.supplier ?? 0);
                    return ref !== "auto" && bidSupplier === supplierIdNum;
                });

                const rows: any[] = [];
                for (const b of filteredBatches) {
                    const grnId = b.id ?? b.grn_batch_id ?? b.batch_id ?? b.grn_id ?? null;
                    if (!grnId) continue;
                    const batchItems = (items || []).filter((it: any) => Number(it.grn_batch_id ?? it.batch_id ?? it.grn_batch ?? 0) === Number(grnId));
                    for (const it of batchItems) {
                        const qtyReceived = Number(it.qty_recd ?? it.quantity ?? it.qty ?? it.quantity_received ?? 0) || 0;
                        const qtyInvoiced = Number(it.quantity_inv ?? it.qty_inv ?? it.qty_invoiced ?? 0) || 0;
                        const qtyYet = qtyInvoiced; // qty yet to credit - defaults to qty invoiced
                        // skip rows where nothing has been invoiced (credit notes are for invoiced items)
                        if ((Number(qtyInvoiced) || 0) <= 0) continue;
                        // try supplier-specific purchase price first
                        let price = Number(it.unit_price ?? it.price ?? 0) || 0;
                        try {
                            const itemCode = String(it.item_code ?? it.stock_id ?? it.item ?? "");
                            if (itemCode && supplierIdNum) {
                                const purch = await getPurchDataById(supplierIdNum, itemCode);
                                if (purch && typeof purch.price !== 'undefined' && purch.price !== null) {
                                    price = Number(purch.price);
                                }
                            }
                        } catch (e) {
                            // ignore and keep fallback price from GRN item
                        }
                        rows.push({
                            id: `${grnId}-${it.id ?? it.grn_item_id ?? Math.random()}`,
                            delivery: grnId,
                            po: b.purch_order_no ?? b.purch_order ?? b.order_no ?? "",
                            item: it.item_code ?? it.stock_id ?? it.item ?? "",
                            description: it.description ?? "",
                            receivedOn: b.delivery_date ?? b.del_date ?? b.date ?? "",
                            qtyReceived: qtyReceived,
                            qtyInvoiced: qtyInvoiced,
                            qtyYet: qtyYet,
                            price: price,
                            total: Number((qtyYet * price) || 0),
                            included: false,
                            grn_item_id: it.id ?? it.grn_item_id ?? null,
                            po_detail_item: it.po_detail_item ?? it.po_item ?? it.po_detail ?? null,
                            po_item_detail: it.po_item_detail ?? it.po_detail ?? it.po_item ?? null,
                        });
                    }
                }

                if (rows.length > 0) setItemRows(rows);
                else setItemRows([{
                    id: 1,
                    delivery: "",
                    po: "",
                    item: "",
                    description: "",
                    receivedOn: "",
                    qtyReceived: 0,
                    qtyInvoiced: 0,
                    qtyYet: 0,
                    price: 0,
                    total: 0,
                    included: false,
                    grn_item_id: null,
                    po_detail_item: null,
                    po_item_detail: null,
                }]);
            } catch (e) {
                console.error('Failed to load GRN data for supplier credit note:', e);
            }
        };
        loadGrnData();
    }, [supplier]);

    // ================= Table 1: Items Yet To Invoice =================
    const [itemRows, setItemRows] = useState([
        {
            id: 1,
            delivery: "",
            po: "",
            item: "",
            description: "",
            receivedOn: "",
            qtyReceived: 0,
            qtyInvoiced: 0,
            qtyYet: 0,
            price: 0,
            total: 0,
            included: false,
            grn_item_id: null,
            po_detail_item: null,
            po_item_detail: null,
        },
    ]);

    // Filter itemRows by received date range
    const filteredItemRows = itemRows.filter((row) => {
        if (!receivedFromDate && !receivedToDate) return true;
        const rowDate = row.receivedOn;
        if (!rowDate) return true;
        if (receivedFromDate && rowDate < receivedFromDate) return false;
        if (receivedToDate && rowDate > receivedToDate) return false;
        return true;
    });

    const addItemRow = () => {
        setItemRows((p) => [
            ...p,
            {
                id: p.length + 1,
                delivery: "",
                po: "",
                item: "",
                description: "",
                receivedOn: "",
                qtyReceived: 0,
                qtyInvoiced: 0,
                qtyYet: 0,
                price: 0,
                total: 0,
                included: false,
                grn_item_id: null,
                po_detail_item: null,
                po_item_detail: null,
            },
        ]);
    };

    const removeItemRow = (id) => {
        setItemRows((p) => p.filter((x) => x.id !== id));
    };

    const updateItemRow = (id, field, value) => {
        setItemRows((p) =>
            p.map((r) =>
                r.id === id
                    ? {
                        ...r,
                        [field]: value,
                        total:
                            field === "qtyYet" || field === "price"
                                ? (field === "qtyYet" ? value : r.qtyYet) *
                                (field === "price" ? value : r.price)
                                : r.total,
                    }
                    : r
            )
        );
    };

    // subtotal includes only rows that have been 'added' (included === true)
    const itemsSubtotal = itemRows.reduce((s, r) => s + ((r.included ? Number(r.total || 0) : 0)), 0);

    const includeRow = (id) => {
        setItemRows((p) => p.map((r) => r.id === id ? { ...r, included: true } : r));
    };

    const cancelInclude = (id) => {
        setItemRows((p) => p.map((r) => r.id === id ? { ...r, included: false } : r));
    };

    const addAllItems = () => {
        setItemRows((p) => p.map((r) => 
            filteredItemRows.some((fr) => fr.id === r.id) ? { ...r, included: true } : r
        ));
    };

    // ================= Table 2: GL Items =================
    const [glRows, setGlRows] = useState([
        {
            id: 1,
            account: "",
            name: "",
            dimension: "",
            amount: 0,
            memo: "",
        },
    ]);

    const addGLRow = () => {
        setGlRows((p) => [
            ...p,
            {
                id: p.length + 1,
                account: "",
                name: "",
                dimension: "",
                amount: 0,
                memo: "",
            },
        ]);
    };

    const resetGLRows = () => {
        setGlRows([
            {
                id: 1,
                account: "",
                name: "",
                dimension: "",
                amount: 0,
                memo: "",
            },
        ]);
    };

    const updateGLRow = (id, field, value) => {
        setGlRows((p) =>
            p.map((r) => (r.id === id ? { ...r, [field]: value } : r))
        );
    };

    const glSubtotal = glRows.reduce((s, r) => s + Number(r.amount), 0);

    const creditNoteTotal = itemsSubtotal + glSubtotal;

    // ================= Submit Handlers =================
    const handleUpdate = () => alert("Credit Note Updated");
    const handleEnterCreditNote = async () => {
        try {
            const included = itemRows.filter((r: any) => r.included);
            if (!included || included.length === 0) return alert('No items selected for credit note');

            // compute totals
            const subTotalIncluded = included.reduce((s: number, r: any) => s + Number(r.total || 0), 0);

            // resolve supplier
            const selectedSupplierObj = (suppliers || []).find((s: any) => Number(s.supplier_id ?? s.id ?? s.supplier) === Number(supplier));
            const supplierIdToSend = selectedSupplierObj ? Number(selectedSupplierObj.supplier_id ?? selectedSupplierObj.id ?? selectedSupplierObj.supplier) : null;
            if (!supplierIdToSend) return alert('Supplier not found');
            const taxIncludedForSupplier = Boolean(selectedSupplierObj?.tax_included ?? selectedSupplierObj?.taxIncluded ?? 0);

            // compute starting trans_no for supp_trans (type 21) and we'll increment per row
            let nextTransNo = 1;
            try {
                const allSupp = await getSuppTrans();
                const relevant = Array.isArray(allSupp) ? allSupp.filter((t: any) => Number(t.trans_type ?? t.type ?? 0) === 21) : [];
                if (relevant.length > 0) {
                    const nums = relevant.map((t: any) => Number(t.trans_no ?? t.transno ?? t.id ?? 0)).filter((n: number) => !isNaN(n) && n > 0);
                    if (nums.length > 0) nextTransNo = Math.max(...nums) + 1;
                }
            } catch (e) {
                console.warn('Failed to compute starting supp trans no for type 21', e);
            }

            // for each included row: update purch_order_details (decrement qty_invoiced) and grn_items (decrement qty_recd and quantity_inv)
            const allPurchDetails = await getPurchOrderDetails();

            const createdSuppTransNos: Array<number | string> = [];

            for (const r of included) {
                try {
                    const grnItemId = r.grn_item_id ?? r.id ?? null;
                    const poDetailItem = r.po_detail_item ?? r.po_item_detail ?? null;
                    const qtyYetToCredit = Number(r.qtyYet || 0);

                    // update purch_order_detail: decrement qty_invoiced by qtyYetToCredit
                    if (poDetailItem != null) {
                        const foundDetail = (allPurchDetails || []).find((d: any) => Number(d.po_detail_item ?? d.po_item_detail ?? d.id ?? 0) === Number(poDetailItem));
                        if (foundDetail) {
                            const currentQtyInvoiced = Number(foundDetail.qty_invoiced ?? foundDetail.quantity_invoiced ?? 0);
                            const currentQtyOrdered = Number(foundDetail.quantity_ordered ?? foundDetail.qty_ordered ?? 0);
                            const currentQtyReceived = Number(foundDetail.quantity_received ?? foundDetail.qty_received ?? 0);
                            const newQtyInvoiced = currentQtyInvoiced - qtyYetToCredit;
                            const newQtyOrdered = currentQtyOrdered - qtyYetToCredit;
                            const newQtyReceived = currentQtyReceived - qtyYetToCredit;
                            const updateId = foundDetail.id ?? poDetailItem;
                            const updatePayload = {
                                ...foundDetail,
                                po_detail_item: Number(foundDetail.po_detail_item ?? foundDetail.po_item_detail ?? poDetailItem),
                                qty_invoiced: newQtyInvoiced,
                                quantity_ordered: newQtyOrdered,
                                quantity_received: newQtyReceived,
                            };
                            await updatePurchOrderDetail(updateId, updatePayload);
                        }
                    }

                    // update grn_item: decrement qty_recd and quantity_inv by qtyYetToCredit
                    if (grnItemId != null) {
                        try {
                            const grnItem = await getGrnItemById(grnItemId);
                            if (grnItem) {
                                const currentQtyRecd = Number(grnItem.qty_recd ?? grnItem.quantity ?? 0);
                                const currentQtyInv = Number(grnItem.quantity_inv ?? grnItem.qty_inv ?? 0);
                                const grnUpdateId = grnItem.id ?? grnItem.grn_item_id ?? grnItemId;
                                const grnUpdatePayload = {
                                    ...grnItem,
                                    po_detail_item: grnItem.po_detail_item ?? grnItem.po_item_detail ?? poDetailItem ?? null,
                                    qty_recd: currentQtyRecd - qtyYetToCredit,
                                    quantity_inv: currentQtyInv - qtyYetToCredit,
                                };
                                await updateGrnItem(grnUpdateId, grnUpdatePayload);
                            }
                        } catch (e) {
                            console.warn('Failed to update grn_item for credit note', e);
                        }
                    }

                    // create a supp_trans for this row with type 21, ov_amount negative, alloc positive
                    try {
                        const rowTotal = Number(r.total || (r.qtyYet * r.price) || 0);
                        const suppTransPayloadForRow: any = {
                            trans_no: nextTransNo,
                            trans_type: 21,
                            supplier_id: supplierIdToSend,
                            reference: reference || '',
                            supp_reference: supplierRef || '',
                            trans_date: invoiceDate || new Date().toISOString().split('T')[0],
                            due_date: dueDate || new Date().toISOString().split('T')[0],
                            ov_amount: -rowTotal,
                            ov_discount: 0,
                            ov_gst: 0,
                            rate: 1,
                            alloc: rowTotal,
                            tax_included: taxIncludedForSupplier ? 1 : 0,
                        };
                        const createdSuppForRow = await createSuppTrans(suppTransPayloadForRow);
                        const createdSuppTransNoForRow = createdSuppForRow?.trans_no ?? createdSuppForRow?.id ?? createdSuppForRow?.supp_trans_no ?? nextTransNo;
                        nextTransNo = Number(nextTransNo) + 1;

                        // keep track of created supp trans numbers for comments
                        createdSuppTransNos.push(createdSuppTransNoForRow);

                        // create audit trail entry for this supp_trans (type 21)
                        try {
                            const auditDateObj = new Date(invoiceDate || new Date());
                            let auditFiscalYearId = null;
                            if (Array.isArray(fiscalYears) && fiscalYears.length > 0) {
                                const matching = fiscalYears.find((fy: any) => {
                                    if (!fy.fiscal_year_from || !fy.fiscal_year_to) return false;
                                    const from = new Date(fy.fiscal_year_from);
                                    const to = new Date(fy.fiscal_year_to);
                                    if (isNaN(from.getTime()) || isNaN(to.getTime())) return false;
                                    return auditDateObj >= from && auditDateObj <= to;
                                });
                                const chosen = matching || [...fiscalYears]
                                    .filter((fy: any) => fy.fiscal_year_from && !isNaN(new Date(fy.fiscal_year_from).getTime()))
                                    .sort((a: any, b: any) => new Date(b.fiscal_year_from).getTime() - new Date(a.fiscal_year_from).getTime())
                                    .find((fy: any) => new Date(fy.fiscal_year_from) <= auditDateObj) || fiscalYears[0];
                                if (chosen) {
                                    auditFiscalYearId = chosen.id ?? chosen.fiscal_year_id ?? null;
                                }
                            }
                            const auditPayload: any = {
                                type: 21,
                                trans_no: createdSuppTransNoForRow,
                                user: user?.id ?? null,
                                stamp: new Date().toISOString(),
                                description: '',
                                fiscal_year: auditFiscalYearId,
                                gl_date: invoiceDate || new Date().toISOString().split('T')[0],
                                gl_seq: 0,
                            };
                            await auditTrailApi.create(auditPayload);
                        } catch (e) {
                            console.warn('Failed to create audit trail for credit note supp_trans', e);
                        }

                        // create supp_invoice_item linked to this supp_trans (type 21, negative quantity)
                        const grnItemIdForPayload = (typeof grnItemId === 'string' && grnItemId.includes('-')) ? Number(grnItemId.split('-').pop()) : grnItemId;
                        const suppInvItem: any = {
                            supp_trans_no: createdSuppTransNoForRow,
                            supp_trans_type: 21,
                            gl_code: "0",
                            grn_item_id: grnItemIdForPayload,
                            po_detail_item_id: poDetailItem,
                            stock_id: r.item,
                            description: r.description || '',
                            quantity: -qtyYetToCredit,
                            unit_price: Number(r.price || 0),
                            unit_tax: 0,
                            memo: memo || '',
                            dimension_id: 0,
                            dimension2_id: 0,
                        };
                        try { await createSuppInvoiceItem(suppInvItem); } catch (e) { console.warn('Failed to create supp_invoice_item for credit note', e); }
                    } catch (e) {
                        console.warn('Failed to create supp_trans for credit note row', e);
                    }
                } catch (inner) {
                    console.warn('Failed processing included row for credit note', inner);
                }
            }

            // create comment records for each created supp_trans (type 21, use trans_no as id) only if memo is filled
            if (memo && memo.trim()) {
                try {
                    for (const transNo of createdSuppTransNos) {
                        try {
                            await createComment({ type: 21, id: transNo, date_: invoiceDate, memo_: memo });
                        } catch (e) {
                            console.warn('Failed to create comment for credit note supp_trans', transNo, e);
                        }
                    }
                } catch (e) {
                    console.warn('Failed to create comments for created credit note supp_trans', e);
                }
            }

            const successState: any = {
                location: undefined,
                reference: reference,
                date: invoiceDate,
                supplier: supplierIdToSend,
                supplierRef: supplierRef,
                creditNoteDate: invoiceDate,
                dueDate: dueDate,
                items: included.map((r: any) => ({
                    delivery: r.delivery,
                    item: r.item,
                    description: r.description || "",
                    quantity: Number(r.qtyYet || 0),
                    price: Number(r.price || 0),
                    lineValue: Number(r.total || (r.qtyYet * r.price) || 0),
                })),
                subtotal: itemsSubtotal,
                totalCreditNote: creditNoteTotal,
            };

            navigate('/purchase/transactions/supplier-credit-notes/success', { state: successState });
        } catch (err) {
            console.error('Failed to enter credit note', err);
            alert('Failed to enter credit note. See console for details.');
        }
    };

    const breadcrumbItems = [
        { title: "Purchases", href: "/purchases" },
        { title: "Supplier Credit Note" },
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
                }}
            >
                <Box>
                    <PageTitle title="Supplier Credit Note" />
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

            {/* Form */}
            <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Grid container spacing={2}>
                    {/* Column 1 */}
                    <Grid item xs={12} md={4}>
                        <Stack spacing={2}>
                            <TextField
                                select
                                label="Supplier"
                                size="small"
                                value={supplier}
                                onChange={(e) => setSupplier(Number(e.target.value))}
                            >
                                {suppliers.map((s) => (
                                    <MenuItem key={s.supplier_id} value={s.supplier_id}>
                                        {s.supp_name}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="Date"
                                type="date"
                                size="small"
                                value={invoiceDate}
                                onChange={(e) => setInvoiceDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />

                            <TextField
                                label="Reference"
                                size="small"
                                value={reference}
                                InputProps={{ readOnly: true }}
                            />
                            <TextField
                                label="Source Invoices:"
                                size="small"
                                value={sourceInvoices}
                                onChange={(e) => setSourceInvoices(e.target.value)}
                            />
                            <TextField
                                label="Supplier's Reference"
                                size="small"
                                value={supplierRef}
                                onChange={(e) => setSupplierRef(e.target.value)}
                            />
                        </Stack>
                    </Grid>

                    {/* Column 2 */}
                    <Grid item xs={12} md={4}>
                        <Stack spacing={2}>
                            <TextField
                                label="Due Date"
                                type="date"
                                size="small"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />

                            <TextField
                                label="Payment Terms"
                                size="small"
                                value={termsDesc}
                                InputProps={{ readOnly: true }}
                            />

                            <TextField
                                select
                                label="Dimension"
                                size="small"
                                value={dimension}
                                onChange={(e) => setDimension(Number(e.target.value))}
                            >
                                {dimensions.map((d) => (
                                    <MenuItem key={d.id} value={d.id}>
                                        {d.name}
                                    </MenuItem>
                                ))}
                            </TextField>

                        </Stack>
                    </Grid>

                    {/* Column 3 */}
                    <Grid item xs={12} md={4}>
                        <Stack spacing={2}>
                            <TextField
                                label="Tax Group"
                                size="small"
                                value={taxGroupDesc}
                                InputProps={{ readOnly: true }}
                            />

                            <TextField
                                label="Current Credit"
                                size="small"
                                type="number"
                                value={credit}
                                onChange={(e) => setCredit(Number(e.target.value))}
                            />

                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {/* ======================== TABLE 1 ======================== */}
            <Box mb={2}>
                <Typography variant="h6" textAlign="center">Delivery Item Selected For Adding To A Supplier Credit Note</Typography>
                <Stack direction="row" spacing={1} justifyContent="flex-end" mt={1} alignItems="center">
                    <TextField
                        label="Received between"
                        type="date"
                        size="small"
                        value={receivedFromDate}
                        onChange={(e) => setReceivedFromDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <Typography variant="body1">and</Typography>
                    <TextField
                        type="date"
                        size="small"
                        value={receivedToDate}
                        onChange={(e) => setReceivedToDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <Button variant="contained" onClick={addAllItems}>
                        Add All Item
                    </Button>
                </Stack>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                        <TableRow>
                            <TableCell>Delivery</TableCell>
                            <TableCell>P.O.</TableCell>
                            <TableCell>Item</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Received On</TableCell>
                            <TableCell>Qty Received</TableCell>
                            <TableCell>Qty Invoiced</TableCell>
                            <TableCell>Qty Yet To Credit</TableCell>
                            <TableCell>Price Before Tax</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell align="center">Action</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredItemRows.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.delivery}</TableCell>

                                <TableCell>{row.po}</TableCell>

                                <TableCell>{row.item}</TableCell>

                                <TableCell>{row.description}</TableCell>

                                <TableCell>{row.receivedOn}</TableCell>

                                <TableCell>{row.qtyReceived}</TableCell>

                                <TableCell>{row.qtyInvoiced}</TableCell>

                                <TableCell>
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={row.qtyYet}
                                        onChange={(e) =>
                                            updateItemRow(row.id, "qtyYet", Number(e.target.value))
                                        }
                                    />
                                </TableCell>

                                <TableCell>
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={row.price}
                                        onChange={(e) =>
                                            updateItemRow(row.id, "price", Number(e.target.value))
                                        }
                                    />
                                </TableCell>

                                <TableCell>{Number(row.total || 0).toFixed(2)}</TableCell>

                                <TableCell align="center">
                                    <Stack direction="row" spacing={1}>
                                        {!row.included ? (
                                            <Button startIcon={<AddIcon />} onClick={() => includeRow(row.id)}>
                                                Add
                                            </Button>
                                        ) : (
                                            <Button variant="outlined" onClick={() => cancelInclude(row.id)}>
                                                Cancel
                                            </Button>
                                        )}
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>

                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={9} sx={{ fontWeight: 600 }}>
                                Total
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                                {itemsSubtotal.toFixed(2)}
                            </TableCell>
                            <TableCell />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>

            {/* ======================== TABLE 2: GL ITEMS ======================== */}
            <Box display="flex" justifyContent="center" position="relative" mb={2}>
                <Typography variant="h6">GL Items for this Credit Note</Typography>
                <Stack direction="row" spacing={1} style={{ position: 'absolute', right: 0 }}>
                    <TextField select label="Quick enter" size="small">
                        <MenuItem value="">Select</MenuItem>
                    </TextField>
                    <TextField label="Amount" size="small" type="number" />
                    <Button variant="contained">GO</Button>
                </Stack>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                        <TableRow>
                            <TableCell>Account</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Dimension</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Memo</TableCell>
                            <TableCell align="center">Action</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {glRows.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>
                                    <TextField
                                        size="small"
                                        value={row.account}
                                        InputProps={{ readOnly: true }}
                                    />
                                </TableCell>

                                <TableCell>
                                    <TextField
                                        select
                                        size="small"
                                        value={row.account}
                                        onChange={(e) => {
                                            const selected = chartMasters.find(c => c.account_code === e.target.value);
                                            updateGLRow(row.id, "name", selected ? selected.account_name : "");
                                            updateGLRow(row.id, "account", e.target.value);
                                        }}
                                    >
                                        {(() => {
                                            // Group chart masters by account_type
                                            const groupedAccounts: { [key: string]: any[] } = {};
                                            chartMasters.forEach((acc) => {
                                                const type = acc.account_type || "Unknown";
                                                if (!groupedAccounts[type]) groupedAccounts[type] = [];
                                                groupedAccounts[type].push(acc);
                                            });

                                            // Create grouped menu items with headers
                                            return Object.entries(groupedAccounts).flatMap(([typeKey, accounts]) => {
                                                const typeText = accountTypeMap[Number(typeKey)] || "Unknown";
                                                return [
                                                    <ListSubheader key={`header-${typeKey}`}>{typeText}</ListSubheader>,
                                                    ...accounts.map((acc) => (
                                                        <MenuItem key={acc.account_code} value={acc.account_code}>
                                                            <Stack direction="row" justifyContent="space-between" sx={{ width: "100%" }}>
                                                                {acc.account_code} - {acc.account_name}
                                                            </Stack>
                                                        </MenuItem>
                                                    )),
                                                ];
                                            });
                                        })()}
                                    </TextField>
                                </TableCell>

                                <TableCell>
                                    <TextField
                                        size="small"
                                        value={row.dimension}
                                        onChange={(e) =>
                                            updateGLRow(row.id, "dimension", e.target.value)
                                        }
                                    />
                                </TableCell>

                                <TableCell>
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={row.amount}
                                        onChange={(e) =>
                                            updateGLRow(row.id, "amount", Number(e.target.value))
                                        }
                                    />
                                </TableCell>

                                <TableCell>
                                    <TextField
                                        size="small"
                                        value={row.memo}
                                        onChange={(e) =>
                                            updateGLRow(row.id, "memo", e.target.value)
                                        }
                                    />
                                </TableCell>

                                <TableCell align="center">
                                    {row.id === glRows.length ? (
                                        <Stack direction="row" spacing={1}>
                                            <Button startIcon={<AddIcon />} onClick={addGLRow}>
                                                Add
                                            </Button>
                                            <Button variant="outlined" onClick={resetGLRows}>
                                                Reset
                                            </Button>
                                        </Stack>
                                    ) : (
                                        <Stack direction="row" spacing={1}>
                                            <Button variant="outlined">
                                                Edit
                                            </Button>
                                            <Button
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() =>
                                                    setGlRows((p) => p.filter((x) => x.id !== row.id))
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </Stack>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>

                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={4} sx={{ fontWeight: 600 }}>
                                Sub Total
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                                {glSubtotal.toFixed(2)}
                            </TableCell>
                            <TableCell />
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={4} sx={{ fontWeight: 600 }}>
                                Credit Note Total
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                                {creditNoteTotal.toFixed(2)}
                            </TableCell>
                            <TableCell>
                                <Button variant="outlined" size="small" onClick={handleUpdate}>
                                    Update
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>

            {/* ================= Memo + Buttons ================= */}
            <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1">Memo</Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                />

                <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
                    <Button variant="contained" onClick={handleEnterCreditNote}>
                        Enter Credit Note
                    </Button>
                </Stack>
            </Paper>
        </Stack>
    );
}
