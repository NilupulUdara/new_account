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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";

// APIs
import { getSuppliers } from "../../../../api/Supplier/SupplierApi";
import { getTags } from "../../../../api/DimensionTag/DimensionTagApi";
import { getBankAccounts } from "../../../../api/BankAccount/BankAccountApi";
import { getSuppTrans } from "../../../../api/SuppTrans/SuppTransApi";
import { getSuppInvoiceItems } from "../../../../api/SuppInvoiceItems/SuppInvoiceItemsApi";
import { getPurchOrders } from "../../../../api/PurchOrders/PurchOrderApi";
import { getPurchOrderDetails } from "../../../../api/PurchOrders/PurchOrderDetailsApi";

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

  // ================== GENERATE REFERENCE ==================
  useEffect(() => {
    const year = new Date().getFullYear();
    const rnd = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    setReference(`${rnd}/${year}`);
  }, []);

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

      // Map supplier transactions first
      const filteredSupp = (suppTrans || []).filter((t: any) => Number(t.supplier_id ?? t.supplier ?? t.supp_id ?? 0) === sid);
      const mappedSupp = filteredSupp.map((t: any, idx: number) => {
        const ovAmount = Number(t.ov_amount ?? t.amount ?? 0) || 0;
        const ovGst = Number(t.ov_gst ?? 0) || 0;
        const amount = ovAmount + ovGst;
        const otherAlloc = 0;
        const left = amount + otherAlloc;
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
        return pid === sid && ref.toLowerCase() !== "auto";
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
        const otherAlloc = 0;
        const left = amount + otherAlloc;
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

  // keep Amount of Payment in sync with sum of allocations
  useEffect(() => {
    const sum = (rows || []).reduce((s, r) => s + (Number(r.allocation) || 0), 0);
    setAmountPayment(sum);
  }, [rows]);

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

  const handleSubmit = () => {
    alert("Supplier Payment Saved!");
    navigate(-1);
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
                onChange={(e) => setDatePaid(e.target.value)}
                InputLabelProps={{ shrink: true }}
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

          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Enter Payment
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
