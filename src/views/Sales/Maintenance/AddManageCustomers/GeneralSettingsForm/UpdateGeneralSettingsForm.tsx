import React, { useEffect, useState } from "react";
import {
    Box,
    Stack,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Button,
    Divider,
    FormHelperText,
} from "@mui/material";
import theme from "../../../../../theme";
import { getCustomer, getCustomers, updateCustomer, deleteCustomer } from "../../../../../api/Customer/AddCustomerApi";
import { useNavigate, useParams } from "react-router";

interface GeneralSettingsFormProps {
    customerId?: string | number;
}

export default function UpdateGeneralSettingsForm({ customerId }: GeneralSettingsFormProps) {
    const { id } = useParams(); // get id from route if not passed as prop
    const customerIdToUse = customerId || id;

    const [formData, setFormData] = useState({
        customerName: "",
        customerShortName: "",
        address: "",
        gstNumber: "",
        currency: "",
        salesType: "",
        phone: "",
        secondaryPhone: "",
        email: "",
        bankAccount: "",
        salesPerson: "",
        discountPercent: "",
        promptPaymentDiscount: "",
        creditLimit: "",
        paymentTerms: "",
        creditStatus: "",
        dimension: "",
        generalNotes: "",
        defaultInventoryLocation: "",
        defaultShippingCompany: "",
        salesArea: "",
        taxGroup: "",
        status: "",
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [customers, setCustomers] = useState<any[]>([]); // store customers
    const [selectedCustomer, setSelectedCustomer] = useState<string>("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!customerIdToUse) return;

        const fetchCustomer = async () => {
            try {
                const res = await getCustomer(customerIdToUse);
                if (res) {
                    setFormData({
                        customerName: res.customer_name || "",
                        customerShortName: res.customer_short_name || "",
                        address: res.address || "",
                        gstNumber: res.gst_number || "",
                        currency: res.currency || "",
                        salesType: res.sales_type || "",
                        phone: res.phone || "",
                        secondaryPhone: res.secondary_phone || "",
                        email: res.email || "",
                        bankAccount: res.bank_account || "",
                        salesPerson: res.sales_person || "",
                        discountPercent: res.discount_percent || "",
                        promptPaymentDiscount: res.prompt_payment_discount || "",
                        creditLimit: res.credit_limit || "",
                        paymentTerms: res.payment_terms || "",
                        creditStatus: res.credit_status || "",
                        dimension: res.dimension || "",
                        generalNotes: res.general_notes || "",
                        defaultInventoryLocation: res.default_inventory_location || "",
                        defaultShippingCompany: res.default_shipping_company || "",
                        salesArea: res.sales_area || "",
                        taxGroup: res.tax_group || "",
                        status: res.status || "",
                    });
                }
            } catch (error) {
                console.error("Error fetching customer:", error);
                alert("Failed to load customer data.");
            }
        };

        fetchCustomer();
    }, [customerIdToUse]);

    const handleChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    const validate = () => {
        let newErrors: { [key: string]: string } = {};

        // Name & Address
        if (!formData.customerName.trim())
            newErrors.customerName = "Customer Name is required";
        if (!formData.customerShortName.trim())
            newErrors.customerShortName = "Customer Short Name is required";
        if (!formData.address.trim())
            newErrors.address = "Address is required";

        // GST
        if (!formData.gstNumber.trim())
            newErrors.gstNumber = "GST Number is required";

        // Currency & Sales Type
        if (!formData.currency) newErrors.currency = "Currency is required";
        if (!formData.salesType) newErrors.salesType = "Sales Type is required";

        // Contact
        if (!formData.phone.trim()) newErrors.phone = "Phone is required";
        else if (!/^\d{10,15}$/.test(formData.phone))
            newErrors.phone = "Phone must be 10–15 digits";

        if (formData.secondaryPhone && !/^\d{10,15}$/.test(formData.secondaryPhone))
            newErrors.secondaryPhone = "Secondary Phone must be 10–15 digits";

        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newErrors.email = "Enter a valid email";

        // Bank
        if (!formData.bankAccount.trim())
            newErrors.bankAccount = "Bank Account Number is required";
        else if (!/^\d+$/.test(formData.bankAccount))
            newErrors.bankAccount = "Bank Account must be numeric";

        if (!formData.salesPerson)
            newErrors.salesPerson = "Sales Person is required";

        // Sales fields
        if (formData.discountPercent && isNaN(Number(formData.discountPercent)))
            newErrors.discountPercent = "Discount must be a number";

        if (
            formData.promptPaymentDiscount &&
            isNaN(Number(formData.promptPaymentDiscount))
        )
            newErrors.promptPaymentDiscount =
                "Prompt Payment Discount must be a number";

        if (formData.creditLimit && isNaN(Number(formData.creditLimit)))
            newErrors.creditLimit = "Credit Limit must be a number";

        if (!formData.paymentTerms)
            newErrors.paymentTerms = "Payment Terms are required";

        if (!formData.creditStatus)
            newErrors.creditStatus = "Credit Status is required";

        // Notes
        if (!formData.generalNotes.trim())
            newErrors.generalNotes = "General Notes are required";

        // Branch settings
        if (!formData.defaultInventoryLocation)
            newErrors.defaultInventoryLocation = "Inventory Location is required";
        if (!formData.defaultShippingCompany)
            newErrors.defaultShippingCompany = "Shipping Company is required";
        if (!formData.salesArea) newErrors.salesArea = "Sales Area is required";
        if (!formData.taxGroup) newErrors.taxGroup = "Tax Group is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpdate = async () => {
        if (!customerIdToUse) return;
        if (!validate()) {
            alert("Please fix validation errors before submitting.");
            return;
        }

        try {
            const payload = {
                customer_name: formData.customerName,
                customer_short_name: formData.customerShortName,
                address: formData.address,
                gst_number: formData.gstNumber,
                currency: formData.currency,
                sales_type: formData.salesType,
                phone: formData.phone,
                secondary_phone: formData.secondaryPhone,
                email: formData.email,
                bank_account: formData.bankAccount,
                sales_person: formData.salesPerson,
                discount_percent: formData.discountPercent,
                prompt_payment_discount: formData.promptPaymentDiscount,
                credit_limit: formData.creditLimit,
                payment_terms: formData.paymentTerms,
                credit_status: formData.creditStatus,
                general_notes: formData.generalNotes,
                default_inventory_location: formData.defaultInventoryLocation,
                default_shipping_company: formData.defaultShippingCompany,
                sales_area: formData.salesArea,
                tax_group: formData.taxGroup,
                status: formData.status,
            };

            await updateCustomer(customerIdToUse, payload);
            alert("Customer updated successfully");
            navigate("/sales/maintenance/add-and-manage-customers");
        } catch (error) {
            console.error("Error updating customer:", error);
            alert("Failed to update customer.");
        }
    };

    const handleDelete = async () => {
        if (!customerIdToUse) return;
        if (!window.confirm("Are you sure you want to delete this customer?")) return;

        try {
            await deleteCustomer(customerIdToUse);
            alert("Customer deleted successfully");
            navigate("/sales/maintenance/add-and-manage-customers");
        } catch (error) {
            console.error("Error deleting customer:", error);
            alert("Failed to delete customer.");
        }
    };

    return (
        <Stack alignItems="center" sx={{ p: { xs: 2, md: 3 } }}>
            <Box
                sx={{
                    width: "100%",
                    maxWidth: "1200px",
                    p: theme.spacing(3),
                    boxShadow: theme.shadows[2],
                    borderRadius: theme.shape.borderRadius,
                    backgroundColor: theme.palette.background.paper,
                }}
            >
                <Typography
                    variant="h5"
                    sx={{ mb: theme.spacing(3), textAlign: "center" }}
                >
                    Update General Settings
                </Typography>

                <Grid container spacing={4}>
                    {/* Left Column */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={3}>
                            <Typography variant="subtitle1">Name and Address</Typography>
                            <Divider />
                            <TextField
                                label="Customer Name"
                                value={formData.customerName}
                                onChange={(e) => handleChange("customerName", e.target.value)}
                                fullWidth
                                size="small"
                                error={!!errors.customerName}
                                helperText={errors.customerName || " "}
                            />
                            <TextField
                                label="Customer Short Name"
                                value={formData.customerShortName}
                                onChange={(e) => handleChange("customerShortName", e.target.value)}
                                fullWidth
                                size="small"
                                error={!!errors.customerShortName}
                                helperText={errors.customerShortName || " "}
                            />
                            <TextField
                                label="Address"
                                value={formData.address}
                                onChange={(e) => handleChange("address", e.target.value)}
                                fullWidth
                                size="small"
                                multiline
                                rows={2}
                                error={!!errors.address}
                                helperText={errors.address || " "}
                            />
                            <TextField
                                label="GST Number"
                                value={formData.gstNumber}
                                onChange={(e) => handleChange("gstNumber", e.target.value)}
                                fullWidth
                                size="small"
                                error={!!errors.gstNumber}
                                helperText={errors.gstNumber || " "}
                            />
                            <FormControl fullWidth size="small" error={!!errors.currency}>
                                <InputLabel>Currency</InputLabel>
                                <Select
                                    value={formData.currency}
                                    onChange={(e) => handleChange("currency", e.target.value)}
                                    label="Currency"
                                >
                                    <MenuItem value="USD">USD</MenuItem>
                                    <MenuItem value="LKR">LKR</MenuItem>
                                    <MenuItem value="EUR">EUR</MenuItem>
                                </Select>
                                <FormHelperText>{errors.currency || " "}</FormHelperText>
                            </FormControl>
                            <FormControl fullWidth size="small" error={!!errors.salesType}>
                                <InputLabel>Sales Type / Price List</InputLabel>
                                <Select
                                    value={formData.salesType}
                                    onChange={(e) => handleChange("salesType", e.target.value)}
                                    label="Sales Type / Price List"
                                >
                                    <MenuItem value="Retail">Retail</MenuItem>
                                    <MenuItem value="Wholesale">Wholesale</MenuItem>
                                </Select>
                                <FormHelperText>{errors.salesType || " "}</FormHelperText>
                            </FormControl>
                            <FormControl fullWidth size="small" error={!!errors.salesType}>
                                <InputLabel>Customer Status</InputLabel>
                                <Select
                                    value={formData.status}
                                    onChange={(e) => handleChange("status", e.target.value)}
                                    label="Customer Status"
                                >
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Inactive">Inactive</MenuItem>
                                </Select>
                                <FormHelperText>{errors.salesType || " "}</FormHelperText>
                            </FormControl>
                        </Stack>
                    </Grid>

                    {/* Right Column */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={3}>
                            <Typography variant="subtitle1">Sales</Typography>
                            <Divider />
                            <TextField
                                label="Discount Percent"
                                value={formData.discountPercent}
                                onChange={(e) => handleChange("discountPercent", e.target.value)}
                                fullWidth
                                size="small"
                                error={!!errors.discountPercent}
                                helperText={errors.discountPercent || " "}
                            />
                            <TextField
                                label="Prompt Payment Discount Percent"
                                value={formData.promptPaymentDiscount}
                                onChange={(e) =>
                                    handleChange("promptPaymentDiscount", e.target.value)
                                }
                                fullWidth
                                size="small"
                                error={!!errors.promptPaymentDiscount}
                                helperText={errors.promptPaymentDiscount || " "}
                            />
                            <TextField
                                label="Credit Limit"
                                value={formData.creditLimit}
                                onChange={(e) => handleChange("creditLimit", e.target.value)}
                                fullWidth
                                size="small"
                                error={!!errors.creditLimit}
                                helperText={errors.creditLimit || " "}
                            />
                            <FormControl fullWidth size="small" error={!!errors.paymentTerms}>
                                <InputLabel>Payment Terms</InputLabel>
                                <Select
                                    value={formData.paymentTerms}
                                    onChange={(e) => handleChange("paymentTerms", e.target.value)}
                                    label="Payment Terms"
                                >
                                    <MenuItem value="Cash Only">Cash Only</MenuItem>
                                    <MenuItem value="Credit 30 Days">Credit 30 Days</MenuItem>
                                </Select>
                                <FormHelperText>{errors.paymentTerms || " "}</FormHelperText>
                            </FormControl>
                            <FormControl fullWidth size="small" error={!!errors.creditStatus}>
                                <InputLabel>Credit Status</InputLabel>
                                <Select
                                    value={formData.creditStatus}
                                    onChange={(e) => handleChange("creditStatus", e.target.value)}
                                    label="Credit Status"
                                >
                                    <MenuItem value="Good History">Good History</MenuItem>
                                    <MenuItem value="Under Review">Under Review</MenuItem>
                                </Select>
                                <FormHelperText>{errors.creditStatus || " "}</FormHelperText>
                            </FormControl>
                            <FormControl fullWidth size="small" error={!!errors.creditStatus}>
                                <InputLabel>Dimension 1</InputLabel>
                                <Select
                                    value={formData.dimension}
                                    onChange={(e) => handleChange("dimension", e.target.value)}
                                    label="Dimension 1"
                                >
                                    <MenuItem value="0">0</MenuItem>
                                    <MenuItem value="1">1</MenuItem>
                                </Select>
                                <FormHelperText>{errors.dimension || " "}</FormHelperText>
                            </FormControl>
                            {/* Customer Branches */}
                            <Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                    <Typography variant="subtitle2">Customer Branches</Typography>
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => navigate("/sales/maintenance/customer-branches")}
                                        sx={{ textTransform: "none" }}
                                    >
                                        Add or Edit
                                    </Button>
                                </Box>
                            </Box>

                            <TextField
                                label="General Notes"
                                value={formData.generalNotes}
                                onChange={(e) => handleChange("generalNotes", e.target.value)}
                                fullWidth
                                size="small"
                                multiline
                                rows={3}
                                error={!!errors.generalNotes}
                                helperText={errors.generalNotes || " "}
                            />

                        </Stack>
                    </Grid>
                </Grid>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: theme.spacing(4),
                        flexDirection: { xs: "column", sm: "row" },
                        gap: theme.spacing(2),
                    }}
                >
                    <Button variant="outlined" onClick={() => window.history.back()}>
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ backgroundColor: theme.palette.primary.main }}
                        onClick={handleUpdate}
                    >
                        Update Customer
                    </Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>
                        Delete Customer
                    </Button>
                </Box>
            </Box>
        </Stack>
    );
}
