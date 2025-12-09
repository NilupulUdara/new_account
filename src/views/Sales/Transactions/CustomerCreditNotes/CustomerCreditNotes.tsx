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
    ListSubheader,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// ===== API Imports =====
import { getCustomers } from "../../../../api/Customer/AddCustomerApi";
import { getBranches } from "../../../../api/CustomerBranch/CustomerBranchApi";
import { getSalesTypes } from "../../../../api/SalesMaintenance/salesService";
import { getShippingCompanies } from "../../../../api/ShippingCompany/ShippingCompanyApi";
// import { getDimensions } from "../../../../api/Dimension/DimensionApi";
import { getItems, getItemById } from "../../../../api/Item/ItemApi";
import { getItemUnits } from "../../../../api/ItemUnit/ItemUnitApi";
import { getItemCategories } from "../../../../api/ItemCategories/ItemCategoriesApi";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getSalesPricing } from "../../../../api/SalesPricing/SalesPricingApi";
import { getTaxTypes } from "../../../../api/Tax/taxServices";
import { getTaxGroupItemsByGroupId } from "../../../../api/Tax/TaxGroupItemApi";
import { getDebtorTrans, createDebtorTran } from "../../../../api/DebtorTrans/DebtorTransApi";
import { createDebtorTransDetail } from "../../../../api/DebtorTrans/DebtorTransDetailsApi";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

export default function CustomerCreditNotes() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // ===== Form fields =====
    const [customer, setCustomer] = useState("");
    const [branch, setBranch] = useState("");
    const [reference, setReference] = useState("");
    const [salesType, setSalesType] = useState("");
    const [shippingCompany, setShippingCompany] = useState("");
    const [discount, setDiscount] = useState(0);
    const [creditNoteDate, setCreditNoteDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [dimension, setDimension] = useState("");
    const [creditNoteType, setCreditNoteType] = useState("");
    const [returnLocation, setReturnLocation] = useState("");
    const [memo, setMemo] = useState("");

    // ===== Fetch master data =====
    const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: getCustomers });
    const { data: branches = [] } = useQuery({ queryKey: ["branches"], queryFn: () => getBranches() });
    const { data: salesTypes = [] } = useQuery({ queryKey: ["salesTypes"], queryFn: getSalesTypes });
    const { data: shippingCompanies = [] } = useQuery({ queryKey: ["shippingCompanies"], queryFn: getShippingCompanies });
    //   const { data: dimensions = [] } = useQuery({ queryKey: ["dimensions"], queryFn: getDimensions });
    const { data: items = [] } = useQuery({ queryKey: ["items"], queryFn: getItems });
    const { data: itemUnits = [] } = useQuery({ queryKey: ["itemUnits"], queryFn: getItemUnits });
    const { data: categories = [] } = useQuery({ queryKey: ["itemCategories"], queryFn: () => getItemCategories() });
    const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: getInventoryLocations });
    const { data: salesPricing = [] } = useQuery({ queryKey: ["salesPricing"], queryFn: getSalesPricing });
    const { data: taxTypes = [] } = useQuery({ queryKey: ["taxTypes"], queryFn: getTaxTypes });
    const { data: debtorTrans = [] } = useQuery({ queryKey: ["debtorTrans"], queryFn: getDebtorTrans });

    // ===== Tax-related state =====
    const [taxGroupItems, setTaxGroupItems] = useState<any[]>([]);
    const [rows, setRows] = useState([
        {
            id: 1,
            itemCode: "",
            description: "",
            quantity: 0,
            unit: "",
            price: 0,
            discount: 0,
            total: 0,
            selectedItemId: null as string | number | null,
            material_cost: 0,
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
                price: 0,
                discount: 0,
                total: 0,
                selectedItemId: null,
                material_cost: 0,
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
                                field === "price" ||
                                field === "discount"
                                ? (field === "quantity" ? value : r.quantity) *
                                (field === "price" ? value : r.price) *
                                (1 - (field === "discount" ? value : r.discount) / 100)
                                : r.total,
                    }
                    : r
            )
        );
    };

    // ===== Auto-generate reference =====
    useEffect(() => {
        const fiscalYear = new Date().getFullYear();
        if (debtorTrans.length === 0) {
            setReference(`001/${fiscalYear}`);
            return;
        }
        const refsForType = debtorTrans
            .filter((d: any) => d.trans_type === 11)
            .map((d: any) => d.reference)
            .filter((ref: string) => ref && typeof ref === 'string');
        const numbers = refsForType.map((ref: string) => {
            const parts = ref.split('/');
            if (parts.length === 2 && parts[1] === fiscalYear.toString()) {
                const num = parseInt(parts[0], 10);
                return isNaN(num) ? 0 : num;
            }
            return 0;
        });
        const maxNum = Math.max(...numbers, 0);
        const nextNum = maxNum + 1;
        setReference(`${nextNum.toString().padStart(3, '0')}/${fiscalYear}`);
    }, [debtorTrans]);

    // Reset branch when customer changes
    useEffect(() => {
        setBranch("");
    }, [customer]);

    // Update discount when customer changes
    useEffect(() => {
        if (customer) {
            const selectedCustomer = customers.find((c: any) => c.debtor_no === customer);
            if (selectedCustomer) {
                setDiscount(selectedCustomer.discount || 0);
                setRows((prev) => prev.map((r) => ({ ...r, discount: selectedCustomer.discount || 0 })));
            }
        } else {
            setDiscount(0);
            setRows((prev) => prev.map((r) => ({ ...r, discount: 0 })));
        }
    }, [customer, customers]);

    // Update prices when sales type changes
    useEffect(() => {
        if (salesType && salesPricing.length > 0) {
            setRows((prev) =>
                prev.map((r) => {
                    if (r.selectedItemId) {
                        const pricing = salesPricing.find(
                            (p: any) => p.stock_id === r.selectedItemId && p.sales_type_id === salesType
                        );
                        const newPrice = pricing ? pricing.price : r.price; // Keep current if not found
                        return {
                            ...r,
                            price: newPrice,
                            total: r.quantity * newPrice * (1 - r.discount / 100),
                        };
                    }
                    return r;
                })
            );
        }
    }, [salesType, salesPricing]);

    // Update tax group items when branch changes
    useEffect(() => {
        if (branch) {
            const selectedBranch = branches.find((b: any) => b.branch_code === branch);
            if (selectedBranch && selectedBranch.tax_group) {
                getTaxGroupItemsByGroupId(selectedBranch.tax_group)
                    .then((items) => setTaxGroupItems(items))
                    .catch((err) => console.error(err));
            } else {
                setTaxGroupItems([]);
            }
        } else {
            setTaxGroupItems([]);
        }
    }, [branch, branches]);

    const subTotal = rows.reduce((sum, r) => sum + r.total, 0);

    // Calculate taxes if taxIncl is true
    const selectedPriceList = useMemo(() => {
        return salesTypes.find((st: any) => String(st.id) === String(salesType));
    }, [salesType, salesTypes]);

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

    const hasValidRows = rows.some(r => r.selectedItemId && r.quantity > 0);

    const handleProcessCreditNote = async () => {
        if (!customer) {
            alert("Please select a customer.");
            return;
        }
        if (!branch) {
            alert("Please select a branch.");
            return;
        }
        if (!hasValidRows) {
            alert("Please add items with quantity greater than 0.");
            return;
        }
        // Compute next trans_no for trans_type 11 (credit note)
        const existingDebtorTrans = (debtorTrans || []) as any[];
        const maxTrans = existingDebtorTrans
            .filter((d: any) => Number(d.trans_type) === 11 && d.trans_no != null)
            .reduce((m: number, d: any) => Math.max(m, Number(d.trans_no)), 0);
        const nextTransNo = maxTrans + 1;

        const selectedCustomer = customers.find((c: any) => c.debtor_no === customer);

        const total = subTotal + (selectedPriceList?.taxIncl ? 0 : totalTaxAmount);

        const debtorPayload = {
            trans_no: nextTransNo,
            trans_type: 11,
            version: 0,
            debtor_no: Number(customer),
            branch_code: Number(branch),
            tran_date: creditNoteDate,
            due_date: creditNoteDate,
            reference,
            tpe: salesType,
            order_no: 0,
            ov_amount: total,
            ov_gst: 0,
            ov_freight: 0,
            ov_freight_tax: 0,
            ov_discount: 0,
            alloc: 0,
            prep_amount: 0,
            rate: 1,
            ship_via:  Number(shippingCompany),
            dimension_id: 0,
            dimension2_id: 0,
            payment_terms: selectedCustomer?.payment_terms || null,
            tax_included: selectedPriceList?.taxIncl ? 1 : 0,
        };
      //  console.log("Posting debtor_trans payload", debtorPayload);
        const debtorResp = await createDebtorTran(debtorPayload as any);
        const debtorTransNo = debtorResp?.trans_no ?? debtorResp?.id ?? null;
       // console.log("Debtor trans created:", debtorResp, "debtorTransNo:", debtorTransNo);

        // Create debtor_trans_details
        const detailsToPost = rows.filter(r => r.selectedItemId);
       // console.log("Number of details to post:", detailsToPost.length);
        for (const row of detailsToPost) {
            const debtorDetailPayload = {
                debtor_trans_no: debtorTransNo,
                debtor_trans_type: 11,
                stock_id: row.itemCode,
                description: row.description,
                unit_price: row.price,
                unit_tax: 0,
                quantity: row.quantity,
                discount_percent: row.discount,
                standard_cost: row.material_cost,
                qty_done: 0,
                src_id: 1,
            };
            console.log("Posting debtor_trans_detail", debtorDetailPayload);
            try {
                const response = await createDebtorTransDetail(debtorDetailPayload);
                console.log("Debtor trans detail posted successfully:", response);
            } catch (error) {
                console.error("Failed to post debtor trans detail:", error);
            }
        }

        alert("Credit Note processed successfully!");
        queryClient.invalidateQueries({ queryKey: ["debtorTrans"] });
        queryClient.invalidateQueries({ queryKey: ["debtorTransDetails"] });
        navigate("/sales/transactions/customer-credit-notes/success", { state: { trans_no: debtorTransNo, reference } });
    };

    const breadcrumbItems = [
        { title: "Transactions", href: "/sales/transactions/" },
        { title: "Customer Credit Notes" },
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
                    <PageTitle title="Customer Credit Note" />
                    <Breadcrumb breadcrumbs={breadcrumbItems} />
                </Box>

                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                    Back
                </Button>
            </Box>

            {/* Form fields */}
            <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
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
                            <TextField label="Reference" fullWidth size="small" value={reference} InputProps={{ readOnly: true }} />
                        </Stack>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Stack spacing={2}>
                            <TextField
                                select
                                fullWidth
                                label="Sales Type"
                                value={salesType}
                                onChange={(e) => setSalesType(e.target.value)}
                                size="small"
                            >
                                {salesTypes.map((st: any) => (
                                    <MenuItem key={st.id} value={st.id}>
                                        {st.typeName}
                                    </MenuItem>
                                ))}
                            </TextField>
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
                            <TextField label="Customer Discount (%)" fullWidth size="small" value={discount} InputProps={{ readOnly: true }} />
                        </Stack>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Stack spacing={2}>
                            <TextField
                                label="Credit Note Date"
                                type="date"
                                fullWidth
                                size="small"
                                value={creditNoteDate}
                                onChange={(e) => setCreditNoteDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                select
                                fullWidth
                                label="Dimension"
                                value={dimension}
                                onChange={(e) => setDimension(e.target.value)}
                                size="small"
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {/* {dimensions.map((d: any) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name}
                    </MenuItem>
                  ))} */}
                            </TextField>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {/* Items Table */}
            <Typography variant="subtitle1" sx={{ mb: 2, textAlign: "center" }}>
                Customer Credit Note Items
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
                            <TableCell>Price</TableCell>
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
                                        onChange={async (e) => {
                                            const selected = items.find((item: any) => item.description === e.target.value);
                                            handleChange(row.id, "description", e.target.value);
                                            if (selected) {
                                                handleChange(row.id, "itemCode", selected.stock_id);
                                                handleChange(row.id, "selectedItemId", selected.stock_id);
                                                const itemData = await getItemById(selected.stock_id);
                                                if (itemData) {
                                                    const unitName = itemUnits.find((u: any) => u.id === itemData.units)?.name || "";
                                                    handleChange(row.id, "unit", unitName);
                                                    handleChange(row.id, "price", 0); // Will be updated when sales type is selected
                                                    handleChange(row.id, "material_cost", itemData.material_cost || 0);
                                                }
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
                                <TableCell>
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={row.price}
                                        onChange={(e) => handleChange(row.id, "price", Number(e.target.value))}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField size="small" type="number" value={row.discount} InputProps={{ readOnly: true }} />
                                </TableCell>
                                <TableCell>{row.total.toFixed(2)}</TableCell>
                                <TableCell>
                                    {i === rows.length - 1 ? (
                                        <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={handleAddRow}>
                                            Add
                                        </Button>
                                    ) : (
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleRemoveRow(row.id)}
                                        >
                                            Delete
                                        </Button>
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
                        {taxCalculations.map((tax, index) => (
                            <TableRow key={index}>
                                <TableCell colSpan={7} sx={{ fontWeight: 600 }}>
                                    {tax.name} ({tax.rate}%)
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{tax.amount.toFixed(2)}</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={7} sx={{ fontWeight: 600 }}>
                                Total
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{(subTotal + (selectedPriceList?.taxIncl ? 0 : totalTaxAmount)).toFixed(2)}</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>

            {/* Credit Note Type + Memo Section */}
            <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            label="Credit Note Type"
                            value={creditNoteType}
                            onChange={(e) => setCreditNoteType(e.target.value)}
                            size="small"
                        >
                            <MenuItem value="Return">Items Returned to Inventory Location</MenuItem>
                            <MenuItem value="Allowance">Items Written Off</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            label="Items Returned To Location"
                            value={returnLocation}
                            onChange={(e) => setReturnLocation(e.target.value)}
                            size="small"
                        >
                            {locations.map((loc: any) => (
                                <MenuItem key={loc.loc_code} value={loc.loc_code}>
                                    {loc.location_name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Memo"
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 2 }}>
                    <Button variant="outlined" onClick={() => navigate(-1)}>
                        Update
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleProcessCreditNote}>
                        Process Credit Note
                    </Button>
                </Box>
            </Paper>
        </Stack>
    );
}
