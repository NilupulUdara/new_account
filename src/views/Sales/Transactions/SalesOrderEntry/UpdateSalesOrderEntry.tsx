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
import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "../../../../api/Customer/AddCustomerApi";
import { getBranches } from "../../../../api/CustomerBranch/CustomerBranchApi";
import { getPaymentTerms } from "../../../../api/PaymentTerm/PaymentTermApi";
import { getSalesTypes } from "../../../../api/SalesMaintenance/salesService";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
// import { getCashAccounts } from "../../../../api/Accounts/CashAccountsApi";
import { getItems, getItemById } from "../../../../api/Item/ItemApi";
import { getItemUnits } from "../../../../api/ItemUnit/ItemUnitApi";
import { getItemCategories } from "../../../../api/ItemCategories/ItemCategoriesApi";
import Breadcrumb from "../../../../components/BreadCrumb";
import PageTitle from "../../../../components/PageTitle";
import theme from "../../../../theme";

export default function UpdateSalesOrderEntry() {
    const navigate = useNavigate();

    // ===== Form fields =====
    const [customer, setCustomer] = useState("");
    const [branch, setBranch] = useState("");
    const [reference, setReference] = useState("");
    const [credit, setCredit] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [payment, setPayment] = useState("");
    const [priceList, setPriceList] = useState("");
    const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
    const [deliverFrom, setDeliverFrom] = useState("");
    const [cashAccount, setCashAccount] = useState("");
    const [comments, setComments] = useState("");
    const [shippingCharge, setShippingCharge] = useState(0);

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

    // ===== Table rows =====
    const [rows, setRows] = useState([
        {
            id: 1,
            itemCode: "",
            description: "",
            quantity: 0,
            unit: "",
            priceAfterTax: 0,
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
                priceAfterTax: 0,
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
                                field === "priceAfterTax" ||
                                field === "discount"
                                ? (field === "quantity" ? value : r.quantity) *
                                (field === "priceAfterTax" ? value : r.priceAfterTax) *
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

    // Update credit and discount when customer changes
    useEffect(() => {
        if (customer) {
            const selectedCustomer = customers.find((c: any) => c.debtor_no === customer);
            if (selectedCustomer) {
                setCredit(selectedCustomer.credit_limit || 0);
                setDiscount(selectedCustomer.discount || 0);
                // Update table rows discount
                setRows((prev) => prev.map((r) => ({ ...r, discount: selectedCustomer.discount || 0 })));
            }
        } else {
            setCredit(0);
            setDiscount(0);
            // Reset table rows discount
            setRows((prev) => prev.map((r) => ({ ...r, discount: 0 })));
        }
    }, [customer, customers]);

    const handlePlaceQuotation = () => {
        if (!customer || rows.length === 0) return;
        console.log({
            customer,
            branch,
            reference,
            orderDate,
            payment,
            priceList,
            rows,
            deliverFrom,
            cashAccount,
            comments,
        });
        alert("Quotation placed successfully!");
        navigate(-1);
    };

    const breadcrumbItems = [
        { title: "Transactions", href: "/sales/transactions/" },
        { title: "Modifying Sales Order" },
    ];

    const subTotal = rows.reduce((sum, r) => sum + r.total, 0);

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
                    <PageTitle title="Modifying Sales Order" />
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
                        <TextField
                            label="Reference"
                            fullWidth
                            size="small"
                            value={reference}
                            InputProps={{ readOnly: true }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField label="Current Credit" fullWidth size="small" value={credit} InputProps={{ readOnly: true }} />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField label="Customer Discount (%)" fullWidth size="small" value={discount} InputProps={{ readOnly: true }} />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            select
                            fullWidth
                            label="Payment Type"
                            value={payment}
                            onChange={(e) => setPayment(e.target.value)}
                            size="small"
                        >
                            {paymentTerms.map((p: any) => (
                                <MenuItem key={p.terms_indicator} value={p.terms_indicator}>
                                    {p.description}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={4}>
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
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Order Date"
                            type="date"
                            fullWidth
                            size="small"
                            value={orderDate}
                            onChange={(e) => setOrderDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Items Table */}
            <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center' }}>Sales Order Items</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                        <TableRow>
                            <TableCell>No</TableCell>
                            <TableCell>Item Code</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Unit</TableCell>
                            <TableCell>Price After Tax</TableCell>
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
                                                    handleChange(row.id, "priceAfterTax", itemData.material_cost || 0);
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
                                        value={row.priceAfterTax}
                                        onChange={(e) => handleChange(row.id, "priceAfterTax", Number(e.target.value))}
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
                       
                        <TableRow>
                            <TableCell colSpan={7} sx={{ fontWeight: 600 }}>Amount Total</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{(subTotal + shippingCharge).toFixed(2)}</TableCell>
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
                    Cash Payment
                </Typography>
                <Grid container spacing={2}>
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
                </Grid>

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 2 }}>
                    <Button variant="outlined" onClick={() => navigate(-1)}>
                        Cancel Order
                    </Button>
                    <Button variant="contained" color="primary" onClick={handlePlaceQuotation}>
                        Commit Order Changes
                    </Button>
                </Box>
            </Paper>
        </Stack>
    );
}
