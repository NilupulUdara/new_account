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
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

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

import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

export default function CustomerCreditNotes() {
    const navigate = useNavigate();

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

    // ===== Table rows =====
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
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0");
        setReference(`${random}/${year}`);
    }, []);

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

    const subTotal = rows.reduce((sum, r) => sum + r.total, 0);

    const handleProcessCreditNote = () => {
        if (!customer || rows.length === 0) return;
        console.log({
            customer,
            branch,
            reference,
            salesType,
            shippingCompany,
            creditNoteDate,
            dimension,
            creditNoteType,
            returnLocation,
            memo,
            rows,
        });
        alert("Credit Note processed successfully!");
        navigate(-1);
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
                    </Grid>

                    <Grid item xs={12} sm={4}>
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
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField label="Reference" fullWidth size="small" value={reference} InputProps={{ readOnly: true }} />
                    </Grid>

                    <Grid item xs={12} sm={4}>
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
                    </Grid>

                    <Grid item xs={12} sm={4}>
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
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField label="Customer Discount (%)" fullWidth size="small" value={discount} InputProps={{ readOnly: true }} />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Credit Note Date"
                            type="date"
                            fullWidth
                            size="small"
                            value={creditNoteDate}
                            onChange={(e) => setCreditNoteDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            select
                            fullWidth
                            label="Dimension"
                            value={dimension}
                            onChange={(e) => setDimension(e.target.value)}
                            size="small"
                        >
                            {/* {dimensions.map((d: any) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))} */}
                        </TextField>
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
                                                    handleChange(row.id, "price", itemData.material_cost || 0);
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
                            <MenuItem value="">Select Type</MenuItem>
                            <MenuItem value="Return">Return</MenuItem>
                            <MenuItem value="Allowance">Allowance</MenuItem>
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
