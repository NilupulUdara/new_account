import React, { useState, useMemo, useEffect } from "react";
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
    Alert,
    ListSubheader,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createSalesOrder, getSalesOrders } from "../../../../api/SalesOrders/SalesOrdersApi";
import { createSalesOrderDetail } from "../../../../api/SalesOrders/SalesOrderDetailsApi";
import { createDebtorTran, getDebtorTrans } from "../../../../api/DebtorTrans/DebtorTransApi";
import { createDebtorTransDetail } from "../../../../api/DebtorTrans/DebtorTransDetailsApi";
import { getCustomers } from "../../../../api/Customer/AddCustomerApi";
import { getBranches } from "../../../../api/CustomerBranch/CustomerBranchApi";
import { getPaymentTerms } from "../../../../api/PaymentTerm/PaymentTermApi";
import { getSalesTypes } from "../../../../api/SalesMaintenance/salesService";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
// import { getCashAccounts } from "../../../../api/Accounts/CashAccountsApi";
import { getItems, getItemById } from "../../../../api/Item/ItemApi";
import { getItemUnits } from "../../../../api/ItemUnit/ItemUnitApi";
import { getItemCategories } from "../../../../api/ItemCategories/ItemCategoriesApi";
import { getSalesPricingByStockId } from "../../../../api/SalesPricing/SalesPricingApi";
import { getShippingCompanies } from "../../../../api/ShippingCompany/ShippingCompanyApi";
import { getFiscalYears } from "../../../../api/FiscalYear/FiscalYearApi";
import { getTaxGroupItemsByGroupId } from "../../../../api/Tax/TaxGroupItemApi";
import { getTaxTypes } from "../../../../api/Tax/taxServices";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";
import AddedConfirmationModal from "../../../../components/AddedConfirmationModal";

export default function DirectInvoice() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

     const [open, setOpen] = useState(false);

    // ===== Form fields =====
    const [customer, setCustomer] = useState("");
    const [branch, setBranch] = useState("");
    const [reference, setReference] = useState("");
    const [credit, setCredit] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [payment, setPayment] = useState("");
    const [priceList, setPriceList] = useState("");
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
    const [deliverFrom, setDeliverFrom] = useState("");
    const [cashAccount, setCashAccount] = useState("");
    const [comments, setComments] = useState("");
    const [shippingCharge, setShippingCharge] = useState(0);
    const [priceColumnLabel, setPriceColumnLabel] = useState("Price After Tax");

    // Additional fields for Quotation Delivery Details
    const [validUntil, setValidUntil] = useState("");
    const [deliverTo, setDeliverTo] = useState("");
    const [address, setAddress] = useState("");
    const [contactPhoneNumber, setContactPhoneNumber] = useState("");
    const [customerReference, setCustomerReference] = useState("");
    const [shippingCompany, setShippingCompany] = useState("");

    // ===== Fetch master data =====
    const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: getCustomers });
    const { data: branches = [] } = useQuery({ queryKey: ["branches"], queryFn: () => getBranches() });
    const { data: paymentTerms = [] } = useQuery({ queryKey: ["payments"], queryFn: getPaymentTerms });
    const { data: priceLists = [] } = useQuery({ queryKey: ["priceLists"], queryFn: getSalesTypes });
    const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: getInventoryLocations });
    //   const { data: cashAccounts = [] } = useQuery({ queryKey: ["cashAccounts"], queryFn: getCashAccounts });
    const { data: items = [] } = useQuery({ queryKey: ["items"], queryFn: getItems });
    const { data: itemUnits = [] } = useQuery({ queryKey: ["itemUnits"], queryFn: getItemUnits });
    const { data: categories = [] } = useQuery({ queryKey: ["itemCategories"], queryFn: () => getItemCategories() });
    const { data: shippingCompanies = [] } = useQuery({ queryKey: ["shippingCompanies"], queryFn: getShippingCompanies });
    const { data: fiscalYears = [] } = useQuery({ queryKey: ["fiscalYears"], queryFn: getFiscalYears });
    const { data: salesOrders = [] } = useQuery({ queryKey: ["salesOrders"], queryFn: getSalesOrders });
    const { data: debtorTrans = [] } = useQuery({ queryKey: ["debtorTrans"], queryFn: getDebtorTrans });
    const { data: taxTypes = [] } = useQuery({ queryKey: ["taxTypes"], queryFn: getTaxTypes });

    // ===== Tax-related state =====
    const [taxGroupItems, setTaxGroupItems] = useState<any[]>([]);

    // ===== Table rows =====
    const [rows, setRows] = useState([
        {
            id: 1,
            itemCode: "",
            description: "",
            quantity: 0,
            unit: "",
            priceAfterTax: 0,
            priceBeforeTax: 0,
            discount: 0,
            total: 0,
            selectedItemId: null as string | number | null,
            materialCost: 0,
        },
    ]);

    const handleAddRow = () => {
        setRows((prev) => [
            ...prev,
            {
                id: prev.length + 1,
                itemCode: "",
                description: "",
                quantity: 0,
                unit: "",
                priceAfterTax: 0,
                priceBeforeTax: 0,
                discount: 0,
                total: 0,
                selectedItemId: null,
                materialCost: 0,
            },
        ]);
    };

    const handleRemoveRow = (id: number) => {
        setRows((prev) => prev.filter((r) => r.id !== id));
    };

    const handleChange = (id: number, field: string, value: any) => {
        setRows((prev) =>
            prev.map((r) =>
                r.id === id
                    ? {
                        ...r,
                        [field]: value,
                        total:
                            field === "quantity" ||
                                field === "priceAfterTax" ||
                                field === "priceBeforeTax" ||
                                field === "discount"
                                ? (field === "quantity" ? value : r.quantity) *
                                (field === "priceAfterTax" ? value : field === "priceBeforeTax" ? value : r.priceAfterTax || r.priceBeforeTax) *
                                (1 - (field === "discount" ? value : r.discount) / 100)
                                : r.total,
                    }
                    : r
            )
        );
    };

    const handleItemChange = async (rowId: number, selectedItem: any) => {
        handleChange(rowId, "description", selectedItem.description);
        handleChange(rowId, "itemCode", selectedItem.stock_id);
        handleChange(rowId, "selectedItemId", selectedItem.stock_id);
        // default quantity to 1 when selecting an item (same as DirectDelivery)
        handleChange(rowId, "quantity", 1);
        const itemData = await getItemById(selectedItem.stock_id);
        if (itemData) {
            const unitName = itemUnits.find((u: any) => u.id === itemData.units)?.name || "";
            handleChange(rowId, "unit", unitName);
            handleChange(rowId, "materialCost", itemData.material_cost || 0);
            // Fetch pricing
            const pricingList = await getSalesPricingByStockId(selectedItem.stock_id);
            const pricing = pricingList.find((p: any) =>
                Number(p.sales_type_id) === Number(priceList) &&
                String(p.stock_id ?? p.stockId ?? p.stock) === String(selectedItem.stock_id)
            );
            if (pricing) {
                const after = pricing.price_after_tax ?? pricing.priceAfterTax ?? pricing.price;
                const before = pricing.price_before_tax ?? pricing.priceBeforeTax ?? pricing.price;
                handleChange(rowId, "priceAfterTax", after);
                handleChange(rowId, "priceBeforeTax", before);
            } else {
                // Fallback to material_cost
                handleChange(rowId, "priceAfterTax", itemData.material_cost || 0);
                handleChange(rowId, "priceBeforeTax", itemData.material_cost || 0);
            }
        }
    };

    // ===== Auto-generate reference based on fiscal year =====
    useEffect(() => {
        if (fiscalYears.length === 0 || debtorTrans.length === 0) return;

        const today = new Date(invoiceDate);
        const currentFiscalYear = fiscalYears.find((fy: any) => {
            const fromDate = new Date(fy.fiscal_year_from);
            const toDate = new Date(fy.fiscal_year_to);
            return today >= fromDate && today <= toDate;
        });

        if (currentFiscalYear) {
            const fromYear = new Date(currentFiscalYear.fiscal_year_from).getFullYear();
            const toYear = new Date(currentFiscalYear.fiscal_year_to).getFullYear();
            const yearLabel = fromYear === toYear ? `${fromYear}` : `${fromYear}/${toYear}`;

            // Filter for trans_type=10 (invoice) references from debtor_trans
            const existingRefs = debtorTrans
                .filter((d: any) => Number(d.trans_type) === 10 && d.reference)
                .map((d: any) => d.reference);

            const currentYearRefs = existingRefs.filter((ref: string) =>
                ref.endsWith(`/${yearLabel}`) || ref === yearLabel
            );

            let nextNum = 1;
            if (currentYearRefs.length > 0) {
                const nums = currentYearRefs
                    .map((ref: string) => {
                        const match = ref.match(/^(\d{3})\/.+$/);
                        return match ? parseInt(match[1], 10) : 0;
                    })
                    .filter((n: number) => n > 0);

                if (nums.length > 0) {
                    nextNum = Math.max(...nums) + 1;
                }
            }

            setReference(`${nextNum.toString().padStart(3, '0')}/${yearLabel}`);
        }
    }, [fiscalYears, debtorTrans, invoiceDate]);

    // Auto-select first customer on load (match DirectDelivery behaviour)
    useEffect(() => {
        if (customers.length > 0 && !customer) {
            setCustomer(customers[0].debtor_no);
        }
    }, [customers, customer]);

    // Reset branch when customer changes and auto-select first branch
    useEffect(() => {
        const customerBranches = branches.filter((b: any) => b.debtor_no === customer);
        const newBranch = customerBranches.length > 0 ? customerBranches[0].branch_code : "";
        if (newBranch !== branch) setBranch(newBranch);
    }, [customer, branches]);

    // Update deliver to and address when branch changes
    useEffect(() => {
        if (branch) {
            const selectedBranch = branches.find((b: any) => b.branch_code === branch);
            if (selectedBranch) {
                setDeliverTo(selectedBranch.br_name || "");
                setAddress(selectedBranch.br_address || "");

                // Fetch tax group items for this branch
                if (selectedBranch.tax_group) {
                    getTaxGroupItemsByGroupId(selectedBranch.tax_group)
                        .then((items) => setTaxGroupItems(items))
                        .catch((err) => {
                            console.error("Failed to fetch tax group items:", err);
                            setTaxGroupItems([]);
                        });
                } else {
                    setTaxGroupItems([]);
                }
            }
        } else {
            setDeliverTo("");
            setAddress("");
            setTaxGroupItems([]);
        }
    }, [branch, branches]);

    // Update price column label when price list changes
    useEffect(() => {
        if (priceList) {
            const selected = priceLists.find((pl: any) => pl.id === priceList);
            if (selected) {
                if (selected.taxIncl) {
                    setPriceColumnLabel("Price after Tax");
                } else {
                    setPriceColumnLabel("Price before Tax");
                }
            }
        } else {
            setPriceColumnLabel("Price after Tax");
        }
    }, [priceList, priceLists]);

    // Update prices when price list changes (guarded update)
    useEffect(() => {
        if (priceList) {
            const updatePrices = async () => {
                const newRows = await Promise.all(
                    rows.map(async (row) => {
                        if (row.selectedItemId) {
                            const pricingList = await getSalesPricingByStockId(row.selectedItemId);
                            const pricing = pricingList.find((p: any) =>
                                Number(p.sales_type_id) === Number(priceList) &&
                                String(p.stock_id ?? p.stockId ?? p.stock) === String(row.selectedItemId)
                            );
                            if (pricing) {
                                const after = pricing.price_after_tax ?? pricing.priceAfterTax ?? pricing.price;
                                const before = pricing.price_before_tax ?? pricing.priceBeforeTax ?? pricing.price;
                                return {
                                    ...row,
                                    priceAfterTax: after,
                                    priceBeforeTax: before,
                                };
                            }
                        }
                        return row;
                    })
                );
                try {
                    const same = JSON.stringify(newRows) === JSON.stringify(rows);
                    if (!same) setRows(newRows);
                } catch (e) {
                    setRows(newRows);
                }
            };
            updatePrices();
        }
    }, [priceList]);

    // Update credit, discount, payment and priceList when customer changes (guarded updates)
    useEffect(() => {
        if (customer) {
            const selectedCustomer = customers.find((c: any) => c.debtor_no === customer);
            if (selectedCustomer) {
                const newCredit = selectedCustomer.credit_limit || 0;
                const newDiscount = selectedCustomer.discount || 0;
                const newPayment = selectedCustomer.payment_terms ? String(selectedCustomer.payment_terms) : "";
                const newPriceList = selectedCustomer.sales_type ? String(selectedCustomer.sales_type) : "";
                if (newCredit !== credit) setCredit(newCredit);
                if (newDiscount !== discount) setDiscount(newDiscount);
                if (newPayment !== payment) setPayment(newPayment);
                if (newPriceList !== priceList) setPriceList(newPriceList);
                setRows((prev) => {
                    const updated = prev.map((r) => ({ ...r, discount: newDiscount }));
                    try {
                        const same = JSON.stringify(updated) === JSON.stringify(prev);
                        return same ? prev : updated;
                    } catch (e) {
                        return updated;
                    }
                });
            }
        } else {
            if (credit !== 0) setCredit(0);
            if (discount !== 0) setDiscount(0);
            if (payment !== "") setPayment("");
            if (priceList !== "") setPriceList("");
            setRows((prev) => {
                const updated = prev.map((r) => ({ ...r, discount: 0 }));
                try {
                    const same = JSON.stringify(updated) === JSON.stringify(prev);
                    return same ? prev : updated;
                } catch (e) {
                    return updated;
                }
            });
        }
    }, [customer, customers]);

    // === Save flow: create sales_order, sales_order_details and two debtor_trans + details
    const [submitting, setSubmitting] = useState(false);
    const [orderNo, setOrderNo] = useState<number>(1);

    useEffect(() => {
        if (salesOrders.length > 0) {
            const maxOrderNo = Math.max(...salesOrders.map((o: any) => o.order_no));
            setOrderNo(maxOrderNo + 1);
        }
    }, [salesOrders]);

    // Helper to get selected customer object
    const selectedCustomer = useMemo(() => customers.find((c: any) => String(c.debtor_no) === String(customer)), [customers, customer]);
    const customerName = selectedCustomer?.name || null;
    const customerPhone = selectedCustomer?.phone || selectedCustomer?.contact_phone || null;
    const customerEmail = selectedCustomer?.email || selectedCustomer?.contact_email || null;
    const customerAddr = selectedCustomer?.address || selectedCustomer?.delivery_address || address || null;

    const handlePlaceQuotation = async () => {
        if (!customer) { alert("Select customer first"); return; }
        if (!branch) { alert("Select branch first"); return; }
        if (!deliverFrom) { alert("Select deliver-from location"); return; }
        if (rows.filter(r => r.itemCode && r.quantity > 0).length === 0) {
            alert("At least one item must be added to the invoice.");
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                order_no: orderNo,
                trans_type: 30,
                version: 1,
                type: 0,
                debtor_no: Number(customer),
                branch_code: Number(branch),
                reference: "auto",
                ord_date: invoiceDate,
                order_type: priceList ? Number(priceList) : null,
                ship_via: shippingCompany ? Number(shippingCompany) : 1,
                delivery_address: customerAddr,
                contact_phone: customerPhone,
                contact_email: customerEmail,
                deliver_to: customerName,
                freight_cost: 0,
                from_stk_loc: deliverFrom,
                delivery_date: validUntil || invoiceDate,
                payment_terms: payment ? Number(payment) : null,
                customer_ref: customerReference || "",
                total: subTotal + shippingCharge,
                prep_amount: 0,
                alloc: 0,
            };
            console.log("Posting sales order payload", payload);
            await createSalesOrder(payload as any);

            // Prepare debtor trans numbers per type (10 -> version 0) and (13 -> version 1)
            const existingDebtorTrans = await getDebtorTrans();
            const maxTrans10 = (existingDebtorTrans || [])
                .filter((d: any) => Number(d.trans_type) === 10 && d.trans_no != null)
                .reduce((m: number, d: any) => Math.max(m, Number(d.trans_no)), 0);
            const maxTrans13 = (existingDebtorTrans || [])
                .filter((d: any) => Number(d.trans_type) === 13 && d.trans_no != null)
                .reduce((m: number, d: any) => Math.max(m, Number(d.trans_no)), 0);

            let nextTransNo10 = maxTrans10 + 1;
            let nextTransNo13 = maxTrans13 + 1;
            if (nextTransNo10 === orderNo) nextTransNo10++;
            if (nextTransNo13 === orderNo) nextTransNo13++;

            const debtorPayload10 = {
                trans_no: nextTransNo10,
                trans_type: 10,
                version: 0,
                debtor_no: Number(customer),
                branch_code: Number(branch),
                tran_date: invoiceDate,
                due_date: validUntil || invoiceDate,
                reference: reference || "",
                tpe: priceList ? Number(priceList) : 1,
                order_no: orderNo,
                ov_amount: subTotal + shippingCharge,
                ov_gst: 0,
                ov_freight: shippingCharge || 0,
                ov_freight_tax: 0,
                ov_discount: 0,
                alloc: subTotal + shippingCharge,
                prep_amount: 0,
                rate: 1,
                ship_via: shippingCompany ? Number(shippingCompany) : 1,
                dimension_id: 0,
                dimension2_id: 0,
                payment_terms: payment ? Number(payment) : null,
                tax_included: selectedPriceList?.taxIncl ? 1 : 0,
            };

            const debtorPayload13 = {
                trans_no: nextTransNo13,
                trans_type: 13,
                version: 1,
                debtor_no: Number(customer),
                branch_code: Number(branch),
                tran_date: invoiceDate,
                due_date: validUntil || invoiceDate,
                reference: "auto",
                tpe: priceList ? Number(priceList) : 1,
                order_no: orderNo,
                ov_amount: subTotal + shippingCharge,
                ov_gst: 0,
                ov_freight: shippingCharge || 0,
                ov_freight_tax: 0,
                ov_discount: 0,
                alloc: 0,
                prep_amount: 0,
                rate: 1,
                ship_via: shippingCompany ? Number(shippingCompany) : 1,
                dimension_id: 0,
                dimension2_id: 0,
                payment_terms: payment ? Number(payment) : null,
                tax_included: selectedPriceList?.taxIncl ? 1 : 0,
            };

            console.log("Posting debtor_trans payloads", debtorPayload10, debtorPayload13);
            const debtorResp10 = await createDebtorTran(debtorPayload10 as any);
            const debtorResp13 = await createDebtorTran(debtorPayload13 as any);

            const debtorTransNo10 = debtorResp10?.trans_no ?? debtorResp10?.id ?? null;
            const debtorTransNo13 = debtorResp13?.trans_no ?? debtorResp13?.id ?? null;

            // Now create sales order details and for each created detail create two debtor_trans_details
            const detailsToPost = rows.filter(r => r.selectedItemId);
            for (const row of detailsToPost) {
                const unitPrice = priceColumnLabel === "Price after Tax" ? row.priceAfterTax : row.priceBeforeTax;
                const detailPayload = {
                    order_no: orderNo,
                    trans_type: 30,
                    stk_code: row.itemCode,
                    description: row.description,
                    qty_sent: row.quantity,
                    unit_price: unitPrice,
                    quantity: row.quantity,
                    invoiced: 0,
                    discount_percent: discount,
                };
                console.log("Posting sales order detail", detailPayload);
                const detailResp = await createSalesOrderDetail(detailPayload);

                const createdDetailId = detailResp?.id ?? detailResp?.sales_order_detail_id ?? detailResp?.detail_id ?? detailResp?.order_detail_id ?? null;

                const debtorDetail10 = {
                    debtor_trans_no: debtorTransNo10,
                    debtor_trans_type: debtorResp10?.trans_type ?? 10,
                    stock_id: row.itemCode,
                    description: row.description,
                    unit_price: unitPrice,
                    unit_tax: 0,
                    quantity: row.quantity,
                    discount_percent: discount,
                    standard_cost: row.materialCost,
                    qty_done: 0,
                    src_id: createdDetailId,
                };

                const debtorDetail13 = {
                    debtor_trans_no: debtorTransNo13,
                    debtor_trans_type: debtorResp13?.trans_type ?? 13,
                    stock_id: row.itemCode,
                    description: row.description,
                    unit_price: unitPrice,
                    unit_tax: 0,
                    quantity: row.quantity,
                    discount_percent: discount,
                    standard_cost: row.materialCost,
                    qty_done: 0,
                    src_id: createdDetailId,
                };

                console.log("Posting debtor_trans_detail 10", debtorDetail10);
                await createDebtorTransDetail(debtorDetail10);
                console.log("Posting debtor_trans_detail 13", debtorDetail13);
                await createDebtorTransDetail(debtorDetail13);
            }

           // alert("Saved to sales_orders (order_no: " + orderNo + ")");
             setOpen(true);
            await queryClient.invalidateQueries({ queryKey: ["salesOrders"] });
            await queryClient.invalidateQueries({ queryKey: ["debtorTrans"] });
            navigate("/sales/transactions/direct-invoice/success", { state: { orderNo, reference, invoiceDate } });
        } catch (e: any) {
            console.error("Save error", e);
            const detail = e?.response?.data ? JSON.stringify(e.response.data) : (e?.message || 'Unknown error');
            alert("Failed to save: " + detail);
        } finally {
            setSubmitting(false);
        }
    };

    const breadcrumbItems = [
        { title: "Transactions", href: "/sales/transactions/" },
        { title: "Direct Sales Invoice" },
    ];

    // Only calculate subtotal for completed rows (all rows except the last one which is being edited)
    const subTotal = rows.slice(0, -1).reduce((sum, r) => sum + r.total, 0);

    // Calculate taxes if taxIncl is true
    const selectedPriceList = useMemo(() => {
        return priceLists.find((pl: any) => String(pl.id) === String(priceList));
    }, [priceList, priceLists]);

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
                taxAmount = subTotal - (subTotal / (1 + taxRate / 100));
            } else {
                // For prices that don't include tax, calculate tax on subtotal
                // Tax amount = subtotal * (rate/100)
                taxAmount = subTotal * (taxRate / 100);
            }

            return {
                name: taxName,
                rate: taxRate,
                amount: taxAmount,
            };
        });
    }, [selectedPriceList, taxGroupItems, taxTypes, subTotal]);

    const totalTaxAmount = taxCalculations.reduce((sum, tax) => sum + tax.amount, 0);

    // Find currently selected payment term object so we can inspect its payment_type
    const selectedPaymentTerm = useMemo(() => {
        return paymentTerms.find((pt: any) => String(pt.terms_indicator) === String(payment));
    }, [payment, paymentTerms]);

    const selectedPaymentType = useMemo(() => {
        const pt = selectedPaymentTerm?.payment_type;
        if (pt == null) return null;
        if (typeof pt === "number") return pt;
        // try common id fields when payment_type is an object
        return pt.id ?? pt.payment_type ?? null;
    }, [selectedPaymentTerm]);

    const showQuotationDeliveryDetails = selectedPaymentType === 3 || selectedPaymentType === 4;

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
                    <PageTitle title="Direct Sales Invoice" />
                    <Breadcrumb breadcrumbs={breadcrumbItems} />
                </Box>

                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                    Back
                </Button>
            </Box>

            {/* Form fields */}
            <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                        <Stack spacing={2}>
                            <TextField
                                select
                                fullWidth
                                label="Customer"
                                value={customer}
                                onChange={(e) => setCustomer(e.target.value)}
                                size="small"
                            >
                                {customers.map((c: any) => (
                                    <MenuItem key={c.debtor_no} value={c.debtor_no}>
                                        {c.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                fullWidth
                                label="Branch"
                                value={branch}
                                onChange={(e) => setBranch(e.target.value)}
                                size="small"
                            >
                                {branches
                                    .filter((b: any) => b.debtor_no === customer)
                                    .map((b: any) => (
                                        <MenuItem key={b.branch_code} value={b.branch_code}>
                                            {b.br_name}
                                        </MenuItem>
                                    ))}
                            </TextField>
                            <TextField
                                label="Reference"
                                fullWidth
                                size="small"
                                value={reference}
                                InputProps={{ readOnly: true }}
                            />
                        </Stack>
                    </Grid>

                    <Grid item xs={12} sm={3}>
                        <Stack spacing={2}>
                            <TextField label="Current Credit" fullWidth size="small" value={credit} InputProps={{ readOnly: true }} />
                            <TextField label="Customer Discount (%)" fullWidth size="small" value={discount} InputProps={{ readOnly: true }} />
                        </Stack>
                    </Grid>

                    <Grid item xs={12} sm={3}>
                        <Stack spacing={2}>
                            <TextField
                                select
                                fullWidth
                                label="Payment Type"
                                value={payment}
                                onChange={(e) => setPayment(e.target.value)}
                                size="small"
                                // Ensure the selected value shows the human-friendly `description`
                                SelectProps={{
                                    renderValue: (selected) => {
                                        const sel = paymentTerms.find((pt: any) => String(pt.terms_indicator) === String(selected));
                                        return sel ? sel.description : (selected as string);
                                    },
                                }}
                            >
                                {paymentTerms.map((p: any) => (
                                    <MenuItem key={p.terms_indicator} value={p.terms_indicator}>
                                        {p.description}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                fullWidth
                                label="Price List"
                                value={priceList}
                                onChange={(e) => setPriceList(e.target.value)}
                                size="small"
                            >
                                {priceLists.map((pl: any) => (
                                    <MenuItem key={pl.id} value={pl.id}>
                                        {pl.typeName}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    </Grid>

                    <Grid item xs={12} sm={3}>
                        <TextField
                            label="Invoice Date"
                            type="date"
                            fullWidth
                            size="small"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Items Table */}
            <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center' }}>Sales Invoice Items</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                        <TableRow>
                            <TableCell>No</TableCell>
                            <TableCell>Item Code</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Unit</TableCell>
                            <TableCell>{priceColumnLabel}</TableCell>
                            <TableCell>Discount (%)</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {rows.map((row, i) => (
                            <TableRow key={row.id}>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell>
                                    <TextField
                                        size="small"
                                        value={row.itemCode}
                                        onChange={(e) => handleChange(row.id, "itemCode", e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        select
                                        size="small"
                                        value={row.description}
                                        onChange={(e) => {
                                            const selected = items.find((item: any) => item.description === e.target.value);
                                            if (selected) {
                                                handleItemChange(row.id, selected);
                                            }
                                        }}
                                    >
                                        {Object.entries(
                                            items.reduce((acc: any, item: any) => {
                                                const category = categories.find((c: any) => c.category_id === item.category_id)?.description || "Uncategorized";
                                                if (!acc[category]) acc[category] = [];
                                                acc[category].push(item);
                                                return acc;
                                            }, {} as Record<string, any[]>)
                                        ).map(([category, catItems]: [string, any[]]) => [
                                            <ListSubheader key={category}>{category}</ListSubheader>,
                                            ...catItems.map((item: any) => (
                                                <MenuItem key={item.stock_id} value={item.description}>
                                                    {item.description}
                                                </MenuItem>
                                            )),
                                        ])}
                                    </TextField>
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={row.quantity}
                                        onChange={(e) => handleChange(row.id, "quantity", Number(e.target.value))}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField size="small" value={row.unit} InputProps={{ readOnly: true }} />
                                </TableCell>
                                <TableCell align="right">
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={priceColumnLabel === "Price before Tax" ? row.priceBeforeTax : row.priceAfterTax}
                                        onChange={(e) => {
                                            if (priceColumnLabel === "Price before Tax") {
                                                handleChange(row.id, "priceBeforeTax", Number(e.target.value));
                                            } else {
                                                handleChange(row.id, "priceAfterTax", Number(e.target.value));
                                            }
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={row.discount}
                                        InputProps={{ readOnly: true }}
                                    />
                                </TableCell>
                                <TableCell>{row.total.toFixed(2)}</TableCell>
                                <TableCell>
                                    {i === rows.length - 1 ? (
                                        <Button
                                            size="small"
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            onClick={handleAddRow}
                                        >
                                            Add
                                        </Button>
                                    ) : (
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => {
                                                    // Focus on the first editable field (item code)
                                                    const rowElement = document.querySelector(`[data-row-id="${row.id}"]`);
                                                    if (rowElement) {
                                                        const firstInput = rowElement.querySelector('input') as HTMLInputElement;
                                                        if (firstInput) firstInput.focus();
                                                    }
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleRemoveRow(row.id)}
                                            >
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
                            <TableCell colSpan={7}>Shipping Charge</TableCell>
                            <TableCell>
                                <TextField
                                    size="small"
                                    type="number"
                                    value={shippingCharge}
                                    onChange={(e) => setShippingCharge(Number(e.target.value))}
                                />
                            </TableCell>
                            <TableCell></TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell colSpan={7} sx={{ fontWeight: 600 }}>Sub-total</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{subTotal.toFixed(2)}</TableCell>
                            <TableCell></TableCell>
                        </TableRow>

                        {/* Show tax breakdown */}
                        {taxCalculations.length > 0 && (
                            <>
                                <TableRow>
                                    <TableCell colSpan={9} sx={{ fontWeight: 600, fontStyle: 'italic', color: 'text.secondary' }}>
                                        {selectedPriceList?.taxIncl ? "Taxes Included:" : "Taxes:"}
                                    </TableCell>
                                </TableRow>
                                {taxCalculations.map((tax, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell colSpan={7} sx={{ pl: 4 }}>
                                            {tax.name} ({tax.rate}%)
                                        </TableCell>
                                        <TableCell>{tax.amount.toFixed(2)}</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                ))}
                            </>
                        )}

                        <TableRow>
                            <TableCell colSpan={7} sx={{ fontWeight: 600 }}>Amount Total</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                                {(subTotal + shippingCharge + (selectedPriceList?.taxIncl ? 0 : totalTaxAmount)).toFixed(2)}
                            </TableCell>
                            <TableCell>
                                <Button variant="contained" size="small">
                                    Update
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>

            {/* Cash Payment Section */}
            <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center' }}>
                    {showQuotationDeliveryDetails ? "Quotation Delivery Details" : "Cash Payment"}
                </Typography>
                <Grid container spacing={2}>
                    {showQuotationDeliveryDetails ? (
                        <>
                            <Grid item xs={12} sm={6}>
                                <Stack spacing={2}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Deliver From Location"
                                        value={deliverFrom}
                                        onChange={(e) => setDeliverFrom(e.target.value)}
                                        size="small"
                                    >
                                        {locations.map((loc: any) => (
                                            <MenuItem key={loc.loc_code} value={loc.loc_code}>
                                                {loc.location_name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    <TextField
                                        label="Valid Until"
                                        type="date"
                                        fullWidth
                                        size="small"
                                        value={validUntil}
                                        onChange={(e) => setValidUntil(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                    <TextField
                                        label="Deliver To"
                                        fullWidth
                                        size="small"
                                        value={deliverTo}
                                        onChange={(e) => setDeliverTo(e.target.value)}
                                    />
                                    <TextField
                                        label="Address"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        size="small"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Stack spacing={2}>
                                    <TextField
                                        label="Contact Phone Number"
                                        fullWidth
                                        size="small"
                                        value={contactPhoneNumber}
                                        onChange={(e) => setContactPhoneNumber(e.target.value)}
                                    />
                                    <TextField
                                        label="Customer Reference"
                                        fullWidth
                                        size="small"
                                        value={customerReference}
                                        onChange={(e) => setCustomerReference(e.target.value)}
                                    />
                                    <TextField
                                        select
                                        fullWidth
                                        label="Shipping Company"
                                        value={shippingCompany}
                                        onChange={(e) => setShippingCompany(e.target.value)}
                                        size="small"
                                    >
                                        {shippingCompanies.map((sc: any) => (
                                            <MenuItem key={sc.shipper_id} value={sc.shipper_id}>
                                                {sc.shipper_name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        label="Comments"
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                    />
                                </Stack>
                            </Grid>
                        </>
                    ) : (
                        <>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Deliver From Location"
                                    value={deliverFrom}
                                    onChange={(e) => setDeliverFrom(e.target.value)}
                                    size="small"
                                >
                                    {locations.map((loc: any) => (
                                        <MenuItem key={loc.loc_code} value={loc.loc_code}>
                                            {loc.location_name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Cash Account"
                                    value={cashAccount}
                                    onChange={(e) => setCashAccount(e.target.value)}
                                    size="small"
                                >
                                    <MenuItem value="">Select</MenuItem>
                                    {/* {cashAccounts.map((acc: any) => (
                                <MenuItem key={acc.id} value={acc.id}>
                                    {acc.name}
                                </MenuItem>
                            ))} */}
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    label="Comments"
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                />
                            </Grid>
                        </>
                    )}
                </Grid>

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 2 }}>
                    <Button variant="outlined" onClick={() => navigate(-1)}>
                        Cancel Invoice
                    </Button>
                    <Button variant="contained" color="primary" onClick={handlePlaceQuotation}>
                        Place Invoice
                    </Button>
                </Box>
            </Paper>
            <AddedConfirmationModal
                open={open}
                title="Success"
                content="Sales Invoice has been added successfully!"
                addFunc={async () => { }}
                handleClose={() => setOpen(false)}
                onSuccess={() => {
                    // Form was already cleared on successful submission
                    window.history.back();
                }}
            />
        </Stack>
    );
}
