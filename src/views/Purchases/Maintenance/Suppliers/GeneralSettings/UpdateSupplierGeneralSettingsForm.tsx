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
    Button,
    Divider,
    Checkbox,
    FormControlLabel,
    Grid,
    FormHelperText,
} from "@mui/material";
import theme from "../../../../../theme";
import {
    getSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
} from "../../../../../api/Supplier/SupplierApi";
import { useNavigate, useParams } from "react-router";

interface UpdateSupplierGeneralSettingProps {
    supplierId?: string | number;
}

export default function UpdateSupplierGeneralSettingsForm({ supplierId }: UpdateSupplierGeneralSettingProps) {
    const [formData, setFormData] = useState({
        supplierName: "",
        supplierShortName: "",
        gstNumber: "",
        website: "",
        supplierCurrency: "",
        taxGroup: "",
        ourCustomerNo: "",
        bankAccount: "",
        bankName: "",
        creditLimit: "",
        paymentTerms: "",
        pricesIncludeTax: false,
        accountsPayable: "",
        purchaseAccount: "",
        purchaseDiscountAccount: "",
        contactPerson: "",
        phone: "",
        secondaryPhone: "",
        fax: "",
        email: "",
        documentLanguage: "",
        mailingAddress: "",
        physicalAddress: "",
        generalNotes: "",
        status: "",
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const navigate = useNavigate();
    const { id } = useParams(); // id from route
    const supplierIdToUse = supplierId || id;
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const res = await getSuppliers();
                setSuppliers(res || []);
            } catch (err) {
                console.error("Failed to fetch suppliers", err);
            }
        };
        fetchSuppliers();
    }, []);

    //  Load supplier data when editing
    useEffect(() => {
        if (!supplierIdToUse) return;

        const fetchSupplier = async () => {
            try {
                const res = await getSupplierById(supplierIdToUse);
                if (res) {
                    setFormData({
                        supplierName: res.supplier_name || "",
                        supplierShortName: res.supplier_short_name || "",
                        gstNumber: res.gst_number || "",
                        website: res.website || "",
                        supplierCurrency: res.supplier_currency || "",
                        taxGroup: res.tax_group || "",
                        ourCustomerNo: res.our_customer_no || "",
                        bankAccount: res.bank_account || "",
                        bankName: res.bank_name || "",
                        creditLimit: res.credit_limit || "",
                        paymentTerms: res.payment_terms || "",
                        pricesIncludeTax: res.prices_include_tax || false,
                        accountsPayable: res.accounts_payable || "",
                        purchaseAccount: res.purchase_account || "",
                        purchaseDiscountAccount: res.purchase_discount_account || "",
                        contactPerson: res.contact_person || "",
                        phone: res.phone || "",
                        secondaryPhone: res.secondary_phone || "",
                        fax: res.fax || "",
                        email: res.email || "",
                        documentLanguage: res.document_language || "",
                        mailingAddress: res.mailing_address || "",
                        physicalAddress: res.physical_address || "",
                        generalNotes: res.general_notes || "",
                        status: "",
                    });
                    setSelectedCustomer(res.id);
                }
            } catch (err) {
                console.error("Failed to fetch supplier details", err);
            }
        };

        fetchSupplier();
    }, [supplierIdToUse]);

    const handleChange = (field: string, value: string | boolean) => {
        setFormData({ ...formData, [field]: value });
        setErrors({ ...errors, [field]: "" });
    };

    //  Update supplier
    const handleUpdate = async () => {
        if (!supplierIdToUse) return;
        try {
            const payload = {
                supplier_name: formData.supplierName || null,
                supplier_short_name: formData.supplierShortName || null,
                gst_number: formData.gstNumber || null,
                website: formData.website || null,
                supplier_currency: formData.supplierCurrency || null,
                tax_group: formData.taxGroup || null,
                our_customer_no: formData.ourCustomerNo || null,
                bank_account: formData.bankAccount || null,
                bank_name: formData.bankName || null,
                credit_limit: formData.creditLimit ? Number(formData.creditLimit) : 0,
                payment_terms: formData.paymentTerms || null,
                prices_include_tax: formData.pricesIncludeTax ? 1 : 0,
                accounts_payable: formData.accountsPayable || null,
                purchase_account: formData.purchaseAccount || null,
                purchase_discount_account: formData.purchaseDiscountAccount || null,
                contact_person: formData.contactPerson || null,
                phone: formData.phone || null,
                secondary_phone: formData.secondaryPhone || null,
                fax: formData.fax || null,
                email: formData.email || null,
                document_language: formData.documentLanguage || null,
                mailing_address: formData.mailingAddress || null,
                physical_address: formData.physicalAddress || null,
                general_notes: formData.generalNotes || null,
            };

            console.log("Update payload:", payload);

            await updateSupplier(supplierIdToUse, payload);
            alert("Supplier updated successfully");
            navigate("/purchase/maintenance/suppliers");
        } catch (error: any) {
            console.error("Error updating supplier:", error);
            alert("Failed to update supplier. See console for details.");
        }
    };

    //  Delete supplier
    const handleDelete = async () => {
        if (!supplierIdToUse) return;
        if (!window.confirm("Are you sure you want to delete this supplier?")) return;

        try {
            await deleteSupplier(supplierIdToUse);
            alert("Supplier deleted successfully");
            navigate("/purchase/maintenance");
        } catch (error: any) {
            console.error("Error deleting supplier:", error);
            alert("Failed to delete supplier. See console for details.");
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
                <Typography variant="h5" sx={{ mb: theme.spacing(3), textAlign: "center" }}>
                    Update Supplier Setup
                </Typography>

                <Grid container spacing={4}>
                    {/* Basic Data */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={2}>
                            <Typography variant="subtitle1">Basic Data</Typography>
                            <Divider />
                            <TextField
                                label="Supplier Name"
                                value={formData.supplierName}
                                onChange={(e) => handleChange("supplierName", e.target.value)}
                                size="small"
                                fullWidth
                                error={!!errors.supplierName}
                                helperText={errors.supplierName}
                            />
                            <TextField
                                label="Supplier Short Name"
                                value={formData.supplierShortName}
                                onChange={(e) => handleChange("supplierShortName", e.target.value)}
                                size="small"
                                fullWidth
                                error={!!errors.supplierShortName}
                                helperText={errors.supplierShortName}
                            />
                            <TextField
                                label="GST Number"
                                value={formData.gstNumber}
                                onChange={(e) => handleChange("gstNumber", e.target.value)}
                                size="small"
                                fullWidth
                                error={!!errors.gstNumber}
                                helperText={errors.gstNumber}
                            />
                            <TextField
                                label="Website"
                                value={formData.website}
                                onChange={(e) => handleChange("website", e.target.value)}
                                size="small"
                                fullWidth
                                error={!!errors.website}
                                helperText={errors.website}
                            />
                            <FormControl size="small" fullWidth error={!!errors.supplierCurrency}>
                                <InputLabel>Supplier Currency</InputLabel>
                                <Select
                                    value={formData.supplierCurrency}
                                    onChange={(e) => handleChange("supplierCurrency", e.target.value)}
                                >
                                    <MenuItem value="USD">USD</MenuItem>
                                    <MenuItem value="LKR">LKR</MenuItem>
                                    <MenuItem value="EUR">EUR</MenuItem>
                                </Select>
                                <Typography variant="caption" color="error">{errors.supplierCurrency}</Typography>
                            </FormControl>
                            <FormControl size="small" fullWidth error={!!errors.taxGroup}>
                                <InputLabel>Tax Group</InputLabel>
                                <Select
                                    value={formData.taxGroup}
                                    onChange={(e) => handleChange("taxGroup", e.target.value)}
                                >
                                    <MenuItem value="GST">TAX</MenuItem>
                                    <MenuItem value="VAT">VAT</MenuItem>
                                </Select>
                                <Typography variant="caption" color="error">{errors.taxGroup}</Typography>
                            </FormControl>
                            <TextField
                                label="Our Customer No."
                                value={formData.ourCustomerNo}
                                onChange={(e) => handleChange("ourCustomerNo", e.target.value)}
                                size="small"
                                fullWidth
                                error={!!errors.ourCustomerNo}
                                helperText={errors.ourCustomerNo}
                            />
                        </Stack>
                    </Grid>

                    {/* Purchasing */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={2}>
                            <Typography variant="subtitle1">Purchasing</Typography>
                            <Divider />
                            <TextField
                                label="Bank Name"
                                value={formData.bankName}
                                onChange={(e) => handleChange("bankName", e.target.value)}
                                size="small"
                                fullWidth
                                error={!!errors.bankName}
                                helperText={errors.bankName}
                            />
                            <TextField
                                label="Bank Account"
                                value={formData.bankAccount}
                                onChange={(e) => handleChange("bankAccount", e.target.value)}
                                size="small"
                                fullWidth
                                error={!!errors.bankAccount}
                                helperText={errors.bankAccount}
                            />
                            <TextField
                                label="Credit Limit"
                                value={formData.creditLimit}
                                onChange={(e) => handleChange("creditLimit", e.target.value)}
                                size="small"
                                fullWidth
                                error={!!errors.creditLimit}
                                helperText={errors.creditLimit}
                            />
                            <FormControl size="small" fullWidth error={!!errors.paymentTerms}>
                                <InputLabel>Payment Terms</InputLabel>
                                <Select
                                    value={formData.paymentTerms}
                                    onChange={(e) => handleChange("paymentTerms", e.target.value)}
                                >
                                    <MenuItem value="Cash Only">Cash Only</MenuItem>
                                    <MenuItem value="30 Days">30 Days</MenuItem>
                                    <MenuItem value="60 Days">60 Days</MenuItem>
                                </Select>
                                <Typography variant="caption" color="error">{errors.paymentTerms}</Typography>
                            </FormControl>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.pricesIncludeTax}
                                        onChange={(e) => handleChange("pricesIncludeTax", e.target.checked)}
                                    />
                                }
                                label="Prices Contain Tax Include"
                            />
                        </Stack>
                    </Grid>

                    {/* Accounts */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={2}>
                            <Typography variant="subtitle1">Accounts</Typography>
                            <Divider />
                            <FormControl size="small" fullWidth error={!!errors.accountsPayable}>
                                <InputLabel>Accounts Payable Account</InputLabel>
                                <Select
                                    value={formData.accountsPayable}
                                    onChange={(e) => handleChange("accountsPayable", e.target.value)}
                                >
                                    <MenuItem value="AP-001">AP-001</MenuItem>
                                    <MenuItem value="AP-002">AP-002</MenuItem>
                                </Select>
                                <Typography variant="caption" color="error">{errors.accountsPayable}</Typography>
                            </FormControl>
                            <FormControl size="small" fullWidth error={!!errors.purchaseAccount}>
                                <InputLabel>Purchase Account</InputLabel>
                                <Select
                                    value={formData.purchaseAccount}
                                    onChange={(e) => handleChange("purchaseAccount", e.target.value)}
                                >
                                    <MenuItem value="PUR-001">PUR-001</MenuItem>
                                    <MenuItem value="PUR-002">PUR-002</MenuItem>
                                </Select>
                                <Typography variant="caption" color="error">{errors.purchaseAccount}</Typography>
                            </FormControl>
                            <FormControl size="small" fullWidth error={!!errors.purchaseDiscountAccount}>
                                <InputLabel>Purchase Discount Account</InputLabel>
                                <Select
                                    value={formData.purchaseDiscountAccount}
                                    onChange={(e) => handleChange("purchaseDiscountAccount", e.target.value)}
                                >
                                    <MenuItem value="DISC-001">5060 Discount Received</MenuItem>
                                    <MenuItem value="DISC-002">5070 Discount Received</MenuItem>
                                </Select>
                                <Typography variant="caption" color="error">{errors.purchaseDiscountAccount}</Typography>
                            </FormControl>
                        </Stack>
                    </Grid>

                    {/* Contact Data */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={2}>
                            <Typography variant="subtitle1">Contact Data</Typography>
                            <Divider />
                            <TextField
                                label="Contact Person"
                                value={formData.contactPerson}
                                onChange={(e) => handleChange("contactPerson", e.target.value)}
                                size="small"
                                fullWidth
                                error={!!errors.contactPerson}
                                helperText={errors.contactPerson}
                            />
                            <TextField
                                label="Phone Number"
                                value={formData.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                size="small"
                                fullWidth
                                error={!!errors.phone}
                                helperText={errors.phone}
                            />
                            <TextField
                                label="Secondary Phone Number"
                                value={formData.secondaryPhone}
                                onChange={(e) => handleChange("secondaryPhone", e.target.value)}
                                size="small"
                                fullWidth
                                error={!!errors.secondaryPhone}
                                helperText={errors.secondaryPhone}
                            />
                            <TextField
                                label="Fax Number"
                                value={formData.fax}
                                onChange={(e) => handleChange("fax", e.target.value)}
                                size="small"
                                fullWidth
                                error={!!errors.fax}
                                helperText={errors.fax}
                            />
                            <TextField
                                label="Email"
                                value={formData.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                size="small"
                                fullWidth
                                error={!!errors.email}
                                helperText={errors.email}
                            />
                            <FormControl size="small" fullWidth error={!!errors.documentLanguage}>
                                <InputLabel>Document Language</InputLabel>
                                <Select
                                    value={formData.documentLanguage}
                                    onChange={(e) => handleChange("documentLanguage", e.target.value)}
                                >
                                    <MenuItem value="English">System Default</MenuItem>
                                    <MenuItem value="English">English</MenuItem>
                                    <MenuItem value="Sinhala">Sinhala</MenuItem>
                                    <MenuItem value="Tamil">Tamil</MenuItem>
                                </Select>
                                <Typography variant="caption" color="error">{errors.documentLanguage}</Typography>
                            </FormControl>
                        </Stack>
                    </Grid>

                    {/* Addresses */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={2}>
                            <Typography variant="subtitle1">Addresses</Typography>
                            <Divider />
                            <TextField
                                label="Mailing Address"
                                value={formData.mailingAddress}
                                onChange={(e) => handleChange("mailingAddress", e.target.value)}
                                size="small"
                                fullWidth
                                multiline
                                rows={2}
                                error={!!errors.mailingAddress}
                                helperText={errors.mailingAddress}
                            />
                            <TextField
                                label="Physical Address"
                                value={formData.physicalAddress}
                                onChange={(e) => handleChange("physicalAddress", e.target.value)}
                                size="small"
                                fullWidth
                                multiline
                                rows={2}
                                error={!!errors.physicalAddress}
                                helperText={errors.physicalAddress}
                            />
                        </Stack>
                    </Grid>

                    {/* General */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={2}>
                            <Typography variant="subtitle1">General</Typography>
                            <Divider />
                            <TextField
                                label="General Notes"
                                value={formData.generalNotes}
                                onChange={(e) => handleChange("generalNotes", e.target.value)}
                                size="small"
                                fullWidth
                                multiline
                                rows={3}
                                error={!!errors.generalNotes}
                                helperText={errors.generalNotes}
                            />
                            <FormControl fullWidth size="small" error={!!errors.status}>
                                <InputLabel>Customer Status</InputLabel>
                                <Select
                                    value={formData.status || ''}
                                    onChange={(e) => handleChange("status", e.target.value)}
                                    label="Customer Status"
                                >
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Inactive">Inactive</MenuItem>
                                </Select>
                                <FormHelperText>{errors.status || " "}</FormHelperText>
                            </FormControl>
                        </Stack>

                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: theme.spacing(4),
                        flexDirection: { xs: "column", sm: "row" },
                        gap: theme.spacing(2),
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={() => window.history.back()}
                        sx={{ width: { xs: "100%", sm: 150 } }}
                    >
                        Back
                    </Button>

                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: theme.palette.primary.main,
                            width: { xs: "100%", sm: 150 }
                        }}
                        onClick={handleUpdate}
                    >
                        Update Supplier
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        sx={{ width: { xs: "100%", sm: 150 } }}
                        onClick={handleDelete}
                    >
                        Delete Supplier
                    </Button>
                </Box>

            </Box>
        </Stack>
    );
}