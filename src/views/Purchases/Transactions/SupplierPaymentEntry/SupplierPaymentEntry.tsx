import React, { useState, useEffect, useMemo } from "react";
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
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";

// APIs
import { getSuppliers } from "../../../../api/Supplier/SupplierApi";
import { getTags } from "../../../../api/DimensionTag/DimensionTagApi";
import { getBankAccounts } from "../../../../api/BankAccount/BankAccountApi";
import { getSuppTrans, createSuppTrans, updateSuppTrans } from "../../../../api/SuppTrans/SuppTransApi";
import { getSuppInvoiceItems } from "../../../../api/SuppInvoiceItems/SuppInvoiceItemsApi";
import { getPurchOrders, getPurchOrderByOrderNo, updatePurchOrder } from "../../../../api/PurchOrders/PurchOrderApi";
import { getPurchOrderDetails } from "../../../../api/PurchOrders/PurchOrderDetailsApi";
import { getFiscalYears } from "../../../../api/FiscalYear/FiscalYearApi";
import { getBankTrans, createBankTrans } from "../../../../api/BankTrans/BankTransApi";
import { getCompanies } from "../../../../api/CompanySetup/CompanySetupApi";

// NOTE: bank balance logic removed — replace with real API call when available

export default function SupplierPaymentEntry() {
  const navigate = useNavigate();

  // ================== FORM STATES ==================
  const [supplier, setSupplier] = useState(0);
  const [datePaid, setDatePaid] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [bankCharge, setBankCharge] = useState(0);
  const [bankAccount, setBankAccount] = useState(0);
  const [reference, setReference] = useState("");
  const [dimension, setDimension] = useState(0);
  const [bankBalance, setBankBalance] = useState(0);

  const [datePaidError, setDatePaidError] = useState("");

  const [amountDiscount, setAmountDiscount] = useState(0);
  const [amountPayment, setAmountPayment] = useState(0);
  const [memo, setMemo] = useState("");

  // ================== API STATES ==================
  const [suppliers, setSuppliers] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [banks, setBanks] = useState([]);

  // ================== TABLE ROWS (Allocated amounts) ==================
  const [rows, setRows] = useState<any[]>([]);
  const [suppTrans, setSuppTrans] = useState<any[]>([]);
  const [purchOrders, setPurchOrders] = useState<any[]>([]);
  const [purchOrderDetails, setPurchOrderDetails] = useState<any[]>([]);

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

  // ================== GENERATE REFERENCE ==================
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
      validateDate(datePaid, setDatePaidError);
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

        // find next supp_trans reference number for trans_type 22
        let nextNum = 1;
        try {
          const allSupp = await getSuppTrans();
          if (Array.isArray(allSupp) && allSupp.length > 0) {
            // only consider transactions of this page's type (22)
            const relevant = allSupp.filter((s: any) => Number(s.trans_type ?? s.type ?? 0) === 22);
            const yearPattern = `/${yearLabel}`;
            const matchingRefs = relevant
              .map((s: any) => s.reference ?? s.supp_reference ?? '')
              .filter((ref: string) => String(ref).endsWith(yearPattern))
              .map((ref: string) => {
                const parts = String(ref).split('/');
                if (parts.length >= 2) {
                  const parsed = parseInt(parts[0], 10);
                  return isNaN(parsed) ? 0 : parsed;
                }
                return 0;
              })
              .filter((n: number) => n > 0);

            if (matchingRefs.length > 0) {
              nextNum = Math.max(...matchingRefs) + 1;
            }
          }
        } catch (e) {
          console.warn('Failed to fetch supp_trans for reference generation', e);
        }

        setReference(`${nextNum.toString().padStart(3, '0')}/${yearLabel}`);
      } catch (err) {
        console.warn('Failed to generate payment reference', err);
      }
    })();
  }, [selectedFiscalYear]);

  // helper to normalize date strings to YYYY-MM-DD (top-level for reuse)
  const formatDate = (val: any) => {
    if (!val && val !== 0) return "";
    try {
      if (typeof val === "string") {
        if (val.includes("T")) return val.split("T")[0];
        const d = new Date(val);
        if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
        return val;
      }
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
      return String(val);
    } catch {
      return String(val);
    }
  };

  // ================== FETCH API DATA ==================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersData, dimensionsData, banksData, suppTransData, purchOrdersData, purchOrderDetailsData] = await Promise.all([
          getSuppliers(),
          getTags(),
          getBankAccounts(),
          getSuppTrans(),
          getPurchOrders(),
          getPurchOrderDetails(),
        ]);

        setSuppliers(suppliersData);
        setDimensions(dimensionsData);
        // normalize banksData which may be { data: [...] } or an array
        const normalizedBanks = banksData?.data ?? banksData ?? [];
        setBanks(Array.isArray(normalizedBanks) ? normalizedBanks : []);
        setSuppTrans(Array.isArray(suppTransData) ? suppTransData : (suppTransData?.data ?? []));
        setPurchOrders(Array.isArray(purchOrdersData) ? purchOrdersData : (purchOrdersData?.data ?? []));
        setPurchOrderDetails(Array.isArray(purchOrderDetailsData) ? purchOrderDetailsData : (purchOrderDetailsData?.data ?? []));

        // default-select first supplier and first bank account if none selected
        if ((!supplier || supplier === 0) && Array.isArray(suppliersData) && suppliersData.length > 0) {
          const firstSupplier = suppliersData[0];
          const firstSupplierId = firstSupplier?.supplier_id ?? firstSupplier?.id ?? firstSupplier?.supplier ?? null;
          if (firstSupplierId != null) setSupplier(Number(firstSupplierId));
        }
        if ((!bankAccount || bankAccount === 0) && Array.isArray(normalizedBanks) && normalizedBanks.length > 0) {
          const firstBank = normalizedBanks[0];
          const firstBankId = firstBank?.id ?? firstBank?.bank_account_id ?? null;
          if (firstBankId != null) setBankAccount(Number(firstBankId));
        }
      } catch (error) {
        console.error("Error loading payment page:", error);
      }
    };

    fetchData();
  }, []);

  // ================== GET BANK BALANCE ==================
  useEffect(() => {
    // bank balance not available client-side yet; clear to 0 or implement API
    setBankBalance(0);
  }, [bankAccount]);

  // map supplier transactions and purchase orders to table rows when supplier or data changes
  useEffect(() => {
    // helper to normalize date strings to YYYY-MM-DD
    const formatDate = (val: any) => {
      if (!val && val !== 0) return "";
      try {
        if (typeof val === "string") {
          if (val.includes("T")) return val.split("T")[0];
          // handle plain date strings
          const d = new Date(val);
          if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
          return val;
        }
        const d = new Date(val);
        if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
        return String(val);
      } catch {
        return String(val);
      }
    };
    try {
      if (!supplier) {
        setRows([]);
        return;
      }
      const sid = Number(supplier);

      // Map supplier transactions first (only supplier invoices: trans_type === 20)
      // Also exclude fully allocated invoices where ov_amount === alloc
      const filteredSupp = (suppTrans || []).filter((t: any) => {
        const isSupplier = Number(t.supplier_id ?? t.supplier ?? t.supp_id ?? 0) === sid;
        const isType20 = Number(t.trans_type ?? t.type ?? 0) === 20;
        const ovAmount = Number(t.ov_amount ?? t.amount ?? 0) || 0;
        const allocVal = Number(t.alloc ?? 0) || 0;
        const notFullyAllocated = ovAmount !== allocVal;
        return isSupplier && isType20 && notFullyAllocated;
      });
      const mappedSupp = filteredSupp.map((t: any, idx: number) => {
        const ovAmount = Number(t.ov_amount ?? t.amount ?? 0) || 0;
        const ovGst = Number(t.ov_gst ?? 0) || 0;
        const amount = ovAmount + ovGst;
        const otherAlloc = Number(t.alloc ?? 0) || 0;
        const left = amount - otherAlloc;
        return {
          id: `supp-${t.trans_no ?? t.id ?? idx + 1}`,
          type: "Supplier Invoice",
          number: t.trans_no ?? t.id ?? "-",
          supplierRef: t.supp_reference ?? t.supplier_ref ?? "",
          date: formatDate(t.trans_date ?? t.date ?? ""),
          dueDate: formatDate(t.due_date ?? t.due ?? ""),
          amount: amount,
          otherAlloc: otherAlloc,
          left: left,
          allocation: 0,
        };
      });

      // Map purchase orders (exclude reference === 'auto')
      const filteredPo = (purchOrders || []).filter((p: any) => {
        const pid = Number(p.supplier_id ?? p.supp_id ?? p.supplier ?? 0);
        const ref = (p.reference ?? p.ref ?? "").toString();
        const total = Number(p.total ?? p.ov_amount ?? p.amount ?? 0) || 0;
        const allocVal = Number(p.alloc ?? 0) || 0;
        // exclude auto-ref POs and fully allocated POs (total === alloc)
        return pid === sid && ref.toLowerCase() !== "auto" && Math.abs(total - allocVal) > 0;
      });
      const mappedPo = filteredPo.map((p: any, idx: number) => {
        const orderNo = p.order_no ?? p.id ?? p.orderNo ?? p.order_no;
        // find matching purch_order_details for this order
        const details = (purchOrderDetails || []).filter((d: any) => {
          return Number(d.order_no ?? d.purch_order_no ?? d.orderNo ?? 0) === Number(orderNo);
        });
        // pick latest delivery_date if available
        let due = "";
        if (details.length > 0) {
          const dates = details
            .map((d: any) => d.delivery_date ?? d.del_date ?? d.delivery_date ?? null)
            .filter(Boolean)
            .map((s: any) => new Date(s));
          if (dates.length > 0) {
            const latest = dates.sort((a: any, b: any) => b.getTime() - a.getTime())[0];
            due = latest.toISOString().split('T')[0];
          }
        }
        const amount = Number(p.total ?? p.ov_amount ?? p.amount ?? 0) || 0;
        const otherAlloc = Number(p.alloc ?? 0) || 0;
        const left = amount - otherAlloc;
        return {
          id: `po-${orderNo ?? idx}`,
          type: "Purchase Order",
          number: orderNo ?? "-",
          supplierRef: p.reference ?? p.ref ?? "",
          date: formatDate(p.ord_date ?? p.ordDate ?? p.date ?? ""),
          dueDate: due,
          amount: amount,
          otherAlloc: otherAlloc,
          left: left,
          allocation: 0,
        };
      });

      setRows([...mappedSupp, ...mappedPo]);
    } catch (e) {
      console.error('Failed to map supplier transactions and purchase orders to rows', e);
      setRows([]);
    }
  }, [supplier, suppTrans, purchOrders, purchOrderDetails]);

  // ================== HANDLE ROW UPDATE ==================
  const handleRowChange = (id, field, value) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              [field]: value,
            }
          : r
      )
    );
  };

  // keep Amount of Payment in sync with sum of allocations minus discount
  useEffect(() => {
    const sumAlloc = (rows || []).reduce((s, r) => s + (Number(r.allocation) || 0), 0);
    const discount = Number(amountDiscount) || 0;
    const computed = sumAlloc - discount;
    setAmountPayment(computed >= 0 ? computed : 0);
  }, [rows, amountDiscount]);

  // view supplier invoice by trans_no
  const handleViewSupplierInvoice = async (transNo: any) => {
    try {
      const tno = transNo;
      let trans = (suppTrans || []).find((s: any) => String(s.trans_no ?? s.id ?? s.transno) === String(tno));
      if (!trans) {
        // try refetch
        const fresh = await getSuppTrans();
        trans = (Array.isArray(fresh) ? fresh : (fresh?.data ?? [])).find((s: any) => String(s.trans_no ?? s.id ?? s.transno) === String(tno));
      }
      if (!trans) {
        alert('Supplier transaction not found');
        return;
      }

      // fetch invoice items
      const allItems = await getSuppInvoiceItems();
      const itemsArr = Array.isArray(allItems) ? allItems : (allItems?.data ?? []);
      const invoiceItems = itemsArr.filter((it: any) => String(it.supp_trans_no ?? it.supp_trans ?? it.trans_no) === String(trans.trans_no ?? trans.id ?? trans.transno));

      const itemsForView = invoiceItems.map((it: any) => {
        const qty = Number(it.quantity ?? it.qty ?? it.qty_recd ?? 0) || 0;
        const price = Number(it.unit_price ?? it.unitPrice ?? it.price ?? 0) || 0;

        // find purch order detail to get order_no (delivery)
        const poDetailId = it.po_detail_item_id ?? it.po_detail_item ?? it.po_detail ?? it.po_item_id ?? null;
        const matchedDetail = (purchOrderDetails || []).find((d: any) => String(d.po_detail_item ?? d.po_detail_id ?? d.id) === String(poDetailId));
        const delivery = matchedDetail ? (matchedDetail.order_no ?? matchedDetail.purch_order_no ?? matchedDetail.orderNo ?? '') : '';

        return {
          delivery: delivery,
          item: it.stock_id ?? it.item ?? it.stockId ?? '',
          description: it.description ?? '',
          quantity: qty,
          price: price,
          lineValue: qty * price,
        };
      });

      const subtotal = itemsForView.reduce((s: number, it: any) => s + (Number(it.lineValue) || 0), 0);
      const totalInvoice = Number(trans.ov_amount ?? trans.amount ?? 0) + Number(trans.ov_gst ?? 0);

      const stateToSend = {
        supplier: trans.supplier_id ?? trans.supp_id ?? trans.supplier ?? null,
        reference: trans.reference ?? trans.ref ?? trans.trans_no ?? trans.id ?? '',
        supplierRef: trans.supp_reference ?? trans.supplier_ref ?? '',
        invoiceDate: formatDate(trans.trans_date ?? trans.date ?? ''),
        dueDate: formatDate(trans.due_date ?? trans.due ?? ''),
        items: itemsForView,
        subtotal: subtotal,
        totalInvoice: totalInvoice,
      };

      navigate('/purchase/transactions/direct-supplier-invoice/view-direct-supplier-invoice', { state: stateToSend });
    } catch (e) {
      console.error('Failed to load supplier invoice view', e);
      alert('Failed to load supplier invoice details');
    }
  };

  // view purchase order by order_no
  const handleViewPurchaseOrder = async (orderNo: any) => {
    try {
      const ono = orderNo;
      let order = (purchOrders || []).find((p: any) => String(p.order_no ?? p.id ?? p.orderNo) === String(ono));
      if (!order) {
        // try to refetch purch orders
        const fresh = await getPurchOrders();
        order = (Array.isArray(fresh) ? fresh : (fresh?.data ?? [])).find((p: any) => String(p.order_no ?? p.id ?? p.orderNo) === String(ono));
      }
      if (!order) {
        alert('Purchase order not found');
        return;
      }

      // get details
      let details = (purchOrderDetails || []).filter((d: any) => String(d.order_no ?? d.purch_order_no ?? d.orderNo) === String(ono));
      if ((!details || details.length === 0)) {
        // try to refetch details
        const freshDetails = await getPurchOrderDetails();
        details = (Array.isArray(freshDetails) ? freshDetails : (freshDetails?.data ?? [])).filter((d: any) => String(d.order_no ?? d.purch_order_no ?? d.orderNo) === String(ono));
      }

      const stateToSend: any = {
        orderNo: ono,
        reference: order.reference ?? order.ref ?? '',
        supplier: order.supplier_id ?? order.supplier ?? order.supp_id ?? null,
        orderDate: order.ord_date ?? order.ordDate ?? order.date ?? '',
        location: order.into_stock_location ?? order.into_stock ?? order.loc_code ?? '',
        deliveryAddress: order.delivery_address ?? order.deliver_to ?? '',
        total: order.total ?? order.ov_amount ?? 0,
        items: details,
      };

      navigate('/purchase/transactions/purchase-order-entry/view-purchase-order', { state: stateToSend });
    } catch (e) {
      console.error('Failed to load purchase order view', e);
      alert('Failed to load purchase order details');
    }
  };

  const allocateAll = (id) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, allocation: r.left }
          : r
      )
    );
  };

  const allocateNone = (id) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, allocation: 0 } : r
      )
    );
  };

  const handleSubmit = async () => {
    try {
      if (!supplier) return alert('Select supplier');

      const selectedSupplier = (suppliers || []).find((s: any) => String(s.supplier_id ?? s.id ?? s.supplier) === String(supplier));
      const taxIncludedForSupplier = selectedSupplier ? (selectedSupplier.tax_included ?? selectedSupplier.taxIncluded ?? 0) : 0;

      // compute totals
      const discount = Number(amountDiscount) || 0;
      const payment = Number(amountPayment) || 0; // already sumAlloc - discount
      const bankChargeVal = Number(bankCharge) || 0;

      // 1) create new supp_trans with trans_type=22
      // compute next trans_no for type 22
      let nextSuppTransNo = 1;
      try {
        const allSupp = await getSuppTrans();
        const relevant = Array.isArray(allSupp) ? allSupp.filter((t: any) => Number(t.trans_type ?? t.type ?? 0) === 22) : [];
        if (relevant.length > 0) {
          const nums = relevant.map((t: any) => Number(t.trans_no ?? t.transno ?? t.id ?? 0)).filter((n: number) => !isNaN(n) && n > 0);
          if (nums.length > 0) nextSuppTransNo = Math.max(...nums) + 1;
        }
      } catch (e) {
        console.warn('Failed to compute next supp trans no for type 22', e);
        nextSuppTransNo = 1;
      }

      const suppTransPayload: any = {
        trans_no: nextSuppTransNo,
        trans_type: 22,
        supplier_id: Number(supplier),
        reference: reference || '',
        supp_reference: '',
        trans_date: datePaid,
        due_date: datePaid,
        ov_amount: -Math.abs(payment),
        ov_discount: -Math.abs(discount),
        ov_gst: 0,
        rate: 1,
        alloc: Number(payment) + Number(discount),
        tax_included: taxIncludedForSupplier ? 1 : 0,
      };

      const createdPaymentTrans = await createSuppTrans(suppTransPayload);

      // 2) update existing supp_trans (type 20) allocs for supplier invoices that had allocations
      const rowsToUpdate = (rows || []).filter(r => String(r.id).startsWith('supp-') && Number(r.allocation));
      for (const r of rowsToUpdate) {
        const origTransNo = r.number;
        try {
          // find existing trans (from local state or API)
          let existing = (suppTrans || []).find((s: any) => String(s.trans_no ?? s.id ?? s.transno) === String(origTransNo) && Number(s.trans_type ?? s.type ?? 0) === 20);
          if (!existing) {
            const fresh = await getSuppTrans();
            existing = (Array.isArray(fresh) ? fresh : (fresh?.data ?? [])).find((s: any) => String(s.trans_no ?? s.id ?? s.transno) === String(origTransNo) && Number(s.trans_type ?? s.type ?? 0) === 20);
          }
          if (existing) {
            const newAlloc = (Number(existing.alloc ?? 0) || 0) + Number(r.allocation || 0);
            const payload = { ...existing, alloc: newAlloc };
            await updateSuppTrans(existing.id ?? existing.trans_no ?? existing.transno, payload);
          }
        } catch (e) {
          console.warn('Failed to update supplier invoice alloc for', origTransNo, e);
        }
      }

      // 3) create bank_trans record
      // compute next bank trans no for type (we'll use type 22)
      let nextBankTransNo = 1;
      try {
        const allBank = await getBankTrans();
        if (Array.isArray(allBank) && allBank.length > 0) {
          const nums = allBank.map((b: any) => Number(b.trans_no ?? b.transno ?? b.id ?? 0)).filter((n: number) => !isNaN(n) && n > 0);
          if (nums.length > 0) nextBankTransNo = Math.max(...nums) + 1;
        }
      } catch (e) {
        console.warn('Failed to compute next bank trans no', e);
        nextBankTransNo = 1;
      }

      const bankPayload: any = {
        bank_act: bankAccount,
        trans_no: nextBankTransNo,
        type: 22,
        ref: reference || '',
        trans_date: datePaid,
        amount: -Math.abs(Number(payment) + Number(bankChargeVal)),
        dimension_id: 0,
        dimension2_id: 0,
        person_type_id: 0,
        person_id: 0,
        reconciled: null,
      };

      try {
        await createBankTrans(bankPayload);
      } catch (e) {
        console.warn('Failed to create bank trans', e);
      }

        // 4) For purchase order allocations, update purch_orders.alloc accordingly
        const poRows = (rows || []).filter(r => String(r.id).startsWith('po-') && Number(r.allocation));
        for (const r of poRows) {
          const orderNo = r.number;
          try {
            // Try local cache first
            let po = (purchOrders || []).find((p: any) => String(p.order_no ?? p.id ?? p.orderNo) === String(orderNo));
            if (!po) {
              const fresh = await getPurchOrderByOrderNo(orderNo);
              po = fresh ?? null;
            }
            if (po) {
              const existingAlloc = Number(po.alloc ?? 0) || 0;
              const newAlloc = existingAlloc + Number(r.allocation || 0);
              const payload: any = {
                order_no: po.order_no ?? po.id,
                supplier_id: po.supplier_id ?? po.supplier ?? po.supp_id ?? null,
                comments: po.comments ?? null,
                ord_date: po.ord_date ?? po.ordDate ?? po.date ?? null,
                reference: po.reference ?? po.ref ?? '',
                requisition_no: po.requisition_no ?? po.requisition_no ?? null,
                into_stock_location: po.into_stock_location ?? po.into_stock ?? po.loc_code ?? '',
                delivery_address: po.delivery_address ?? po.deliver_to ?? '',
                total: Number(po.total ?? po.ov_amount ?? po.amount ?? 0) || 0,
                prep_amount: Number(po.prep_amount ?? 0) || 0,
                alloc: newAlloc,
                tax_included: po.tax_included ?? po.taxIncluded ?? false,
              };
              await updatePurchOrder(Number(payload.order_no), payload);
            }
          } catch (e) {
            console.warn('Failed to update purchase order alloc for', orderNo, e);
          }
        }

          const bank = (banks || []).find((b: any) => String(b.id) === String(bankAccount));
          const bankName = bank ? (bank.bank_account_name ?? bank.name ?? String(bankAccount)) : String(bankAccount);

          const viewState = {
            supplier: supplier,
            bankAccount: bankName,
            datePaid: datePaid,
            amount: payment,
            discount: discount,
            reference: reference,
            paymentType: bankName,
            allocations: (rows || []).filter(r => Number(r.allocation) && Number(r.allocation) !== 0).map(r => ({
              type: r.type,
              number: r.number,
              date: r.date,
              totalAmount: r.amount,
              leftToAllocate: r.left,
              allocation: Number(r.allocation) || 0,
            })),
          };

          navigate('/purchase/transactions/payment-to-suppliers/success', { state: viewState });
    } catch (err) {
      console.error('Failed to process supplier payment', err);
      alert('Failed to process supplier payment. See console for details.');
    }
  };

  const breadcrumbItems = [
    { title: "Purchases", href: "/purchases" },
    { title: "Supplier Payment Entry" },
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
          <PageTitle title="Supplier Payment Entry" />
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

      {/* ================== FORM FIELDS ================== */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {/* Column 1: Payment To, From Bank Account, Bank Balance */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <TextField
                select
                fullWidth
                label="Payment To (Supplier)"
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
                select
                fullWidth
                size="small"
                label="From Bank Account"
                value={bankAccount}
                onChange={(e) => setBankAccount(Number(e.target.value))}
              >
                {banks.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.bank_account_name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Bank Balance"
                size="small"
                value={bankBalance}
                InputProps={{ readOnly: true }}
              />
            </Stack>
          </Grid>

          {/* Column 2: Date Paid, Reference */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <TextField
                label="Date Paid"
                type="date"
                fullWidth
                size="small"
                value={datePaid}
                onChange={(e) => { setDatePaid(e.target.value); validateDate(e.target.value, setDatePaidError); }}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: selectedFiscalYear ? new Date(selectedFiscalYear.fiscal_year_from).toISOString().split('T')[0] : undefined, max: selectedFiscalYear ? new Date(selectedFiscalYear.fiscal_year_to).toISOString().split('T')[0] : undefined, }}
                error={!!datePaidError}
                helperText={datePaidError}
              />

              <TextField
                label="Reference"
                size="small"
                value={reference}
                InputProps={{ readOnly: true }}
              />
            </Stack>
          </Grid>

          {/* Column 3: Bank Charge, Dimension */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <TextField
                label="Bank Charge"
                size="small"
                type="number"
                value={bankCharge}
                onChange={(e) => setBankCharge(Number(e.target.value))}
              />

              <TextField
                select
                fullWidth
                size="small"
                label="Dimension"
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
        </Grid>
      </Paper>

      {/* ================== TABLE ================== */}
      <Typography
        variant="subtitle1"
        sx={{ textAlign: "center", mt: 2, fontWeight: 600 }}
      >
        Allocated amounts in USD:
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>Transaction Type</TableCell>
              <TableCell>#</TableCell>
              <TableCell>Supplier Ref</TableCell>
              <TableCell sx={{ width: '120px' }}>Date</TableCell>
              <TableCell sx={{ width: '120px' }}>Due Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Other Allocations</TableCell>
              <TableCell>Left to Allocate</TableCell>
              <TableCell sx={{ width: '140px' }}>This Allocation</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.type}</TableCell>
                <TableCell>
                  {row.type === "Supplier Invoice" ? (
                    <Button size="small" onClick={() => handleViewSupplierInvoice(row.number)}>
                      {row.number}
                    </Button>
                  ) : row.type === "Purchase Order" ? (
                    <Button size="small" onClick={() => handleViewPurchaseOrder(row.number)}>
                      {row.number}
                    </Button>
                  ) : (
                    row.number
                  )}
                </TableCell>
                <TableCell>{row.supplierRef}</TableCell>
                <TableCell sx={{ width: '120px' }}>{row.date}</TableCell>
                <TableCell sx={{ width: '120px' }}>{row.dueDate}</TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>{row.otherAlloc}</TableCell>
                <TableCell>{row.left}</TableCell>

                {/* Allocation Input */}
                <TableCell sx={{ width: '120px' }}>
                  <TextField
                    size="small"
                    type="number"
                    value={row.allocation}
                    onChange={(e) =>
                      handleRowChange(row.id, "allocation", Number(e.target.value))
                    }
                  />
                </TableCell>

                <TableCell>
                  <Button size="small" onClick={() => allocateAll(row.id)}>
                    All
                  </Button>
                  <Button size="small" onClick={() => allocateNone(row.id)}>
                    None
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ================== PAYMENT + DISCOUNT + MEMO ================== */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Amount of Discount"
              size="small"
              type="text"
              inputProps={{ inputMode: 'decimal' }}
              fullWidth
              value={amountDiscount}
              onChange={(e) => setAmountDiscount(Number(e.target.value))}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="Amount of Payment"
              size="small"
              type="text"
              inputProps={{ inputMode: 'decimal' }}
              fullWidth
              value={amountPayment}
              onChange={(e) => setAmountPayment(Number(e.target.value))}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1">Memo:</Typography>
            <TextField
              multiline
              rows={3}
              fullWidth
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </Grid>
        </Grid>

        {/* Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Cancel
          </Button>

          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!!datePaidError}>
            Enter Payment
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
