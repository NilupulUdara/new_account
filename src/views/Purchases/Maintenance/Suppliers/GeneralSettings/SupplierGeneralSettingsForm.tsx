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
  ListSubheader,
} from "@mui/material";
import theme from "../../../../../theme";
import { createSupplier } from "../../../../../api/Supplier/SupplierApi";
import { getSuppliers } from "../../../../../api/Supplier/SupplierApi";
import { useNavigate } from "react-router";
import { getCurrencies, Currency } from "../../../../../api/Currency/currencyApi";
import { getTaxGroups, TaxGroup } from "../../../../../api/Tax/taxServices";
import { getChartMasters } from "../../../../../api/GLAccounts/ChartMasterApi";

interface SupplierGeneralSettingProps {
  supplierId?: string | number;
}

export default function SupplierGeneralSettingsForm({ supplierId }: SupplierGeneralSettingProps) {
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
  });
  
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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const [chartMasters, setChartMasters] = useState<any[]>([]);
  useEffect(() => {
    const fetchChartMasters = async () => {
      try {
        const res = await getChartMasters();
        setChartMasters(res || []);
      } catch (err) {
        console.error("Failed to fetch chart masters", err);
      }
    };
    fetchChartMasters();
  }, []);
  const [customers, setCustomers] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  useEffect(() => {
    getCurrencies().then(setCurrencies);
  }, []);

  const [TaxGroups, setTaxGroups] = useState<TaxGroup[]>([]);
  useEffect(() => {
    getTaxGroups().then(setTaxGroups);
  }, [])
  // Fetch customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await getSuppliers(); // API should return a list of suppliers
        setCustomers(res || []);
      } catch (err) {
        console.error("Failed to fetch customers", err);
      }
    };
    fetchCustomers();
  }, []);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const validate = () => {
    let tempErrors: { [key: string]: string } = {};

    // Basic Data
    if (!formData.supplierName) tempErrors.supplierName = "Supplier Name is required";
    if (!formData.supplierShortName) tempErrors.supplierShortName = "Supplier Short Name is required";
    if (!formData.gstNumber) tempErrors.gstNumber = "GST Number is required";
    if (formData.website && !/^https?:\/\/[^\s]+$/.test(formData.website)) tempErrors.website = "Enter a valid website URL";
    if (!formData.supplierCurrency) tempErrors.supplierCurrency = "Supplier Currency is required";
    if (!formData.taxGroup) tempErrors.taxGroup = "Tax Group is required";
    if (!formData.ourCustomerNo) tempErrors.ourCustomerNo = "Customer No. is required";

    // Purchasing
    if (!formData.bankName) tempErrors.bankName = "Bank Name is required";
    if (!formData.bankAccount) tempErrors.bankAccount = "Bank Account is required";
    if (formData.creditLimit && isNaN(Number(formData.creditLimit))) tempErrors.creditLimit = "Credit Limit must be a number";
    if (!formData.paymentTerms) tempErrors.paymentTerms = "Payment Terms are required";

    // Accounts
    if (!formData.accountsPayable) tempErrors.accountsPayable = "Accounts Payable Account is required";
    if (!formData.purchaseAccount) tempErrors.purchaseAccount = "Purchase Account is required";
    if (!formData.purchaseDiscountAccount) tempErrors.purchaseDiscountAccount = "Purchase Discount Account is required";

    // Contact Data
    if (!formData.contactPerson) tempErrors.contactPerson = "Contact Person is required";
    if (!formData.phone) tempErrors.phone = "Phone Number is required";
    else if (!/^\d{10,15}$/.test(formData.phone)) tempErrors.phone = "Enter a valid phone number";
    if (formData.secondaryPhone && !/^\d{10,15}$/.test(formData.secondaryPhone)) tempErrors.secondaryPhone = "Enter a valid phone number";
    if (formData.fax && !/^\d+$/.test(formData.fax)) tempErrors.fax = "Enter a valid fax number";
    if (!formData.email) tempErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) tempErrors.email = "Enter a valid email";
    if (!formData.documentLanguage) tempErrors.documentLanguage = "Document Language is required";

    // Addresses
    if (!formData.mailingAddress) tempErrors.mailingAddress = "Mailing Address is required";
    if (!formData.physicalAddress) tempErrors.physicalAddress = "Physical Address is required";

    // General
    if (!formData.generalNotes) tempErrors.generalNotes = "General Notes are required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      alert("Please fix validation errors before submitting");
      return;
    }

    try {
      const payload = {
        supplier_name: formData.supplierName,
        supplier_short_name: formData.supplierShortName,
        gst_number: formData.gstNumber,
        website: formData.website,
        supplier_currency: formData.supplierCurrency,
        tax_group: formData.taxGroup,
        our_customer_no: formData.ourCustomerNo,
        bank_account: formData.bankAccount,
        bank_name: formData.bankName,
        credit_limit: formData.creditLimit,
        payment_terms: formData.paymentTerms,
        prices_include_tax: formData.pricesIncludeTax,
        accounts_payable: formData.accountsPayable,
        purchase_account: formData.purchaseAccount,
        purchase_discount_account: formData.purchaseDiscountAccount,
        contact_person: formData.contactPerson,
        phone: formData.phone,
        secondary_phone: formData.secondaryPhone,
        fax: formData.fax,
        email: formData.email,
        document_language: formData.documentLanguage,
        mailing_address: formData.mailingAddress,
        physical_address: formData.physicalAddress,
        general_notes: formData.generalNotes,
      };

      await createSupplier(payload);
      alert("Supplier created successfully");

      setFormData({
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
      })

      navigate("/purchase/maintenance/suppliers");

    } catch (error: any) {
      console.error("Error creating supplier:", error);
      alert("Failed to save supplier. See console for details.");
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
          Supplier Setup
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
                  {currencies.map((currency) => (
                    <MenuItem
                      key={currency.id}
                      value={currency.currency_abbreviation}
                    >
                      {currency.currency_name}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="error">{errors.supplierCurrency}</Typography>
              </FormControl>
              <FormControl size="small" fullWidth error={!!errors.taxGroup}>
                <InputLabel>Tax Group</InputLabel>
                <Select
                  value={formData.taxGroup}
                  onChange={(e) => handleChange("taxGroup", e.target.value)}
                >
                  {TaxGroups.map((TaxGroup) => (
                    <MenuItem
                      key={TaxGroup.id}
                      value={TaxGroup.description}
                    >
                      {TaxGroup.description}
                    </MenuItem>
                  ))}
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
                  label="Accounts Payable Account"
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
                              {acc.account_code}- {acc.account_name}
                            </Stack>
                          </MenuItem>
                        )),
                      ];
                    });
                  })()}
                </Select>
                <Typography variant="caption" color="error">
                  {errors.accountsPayable}
                </Typography>
              </FormControl>

              <FormControl size="small" fullWidth error={!!errors.purchaseAccount}>
                <InputLabel>Purchase Account</InputLabel>
                <Select
                  value={formData.purchaseAccount}
                  onChange={(e) => handleChange("purchaseAccount", e.target.value)}
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
                              {acc.account_code}- {acc.account_name}
                            </Stack>
                          </MenuItem>
                        )),
                      ];
                    });
                  })()}
                </Select>
                <Typography variant="caption" color="error">{errors.purchaseAccount}</Typography>
              </FormControl>
              <FormControl size="small" fullWidth error={!!errors.purchaseDiscountAccount}>
                <InputLabel>Purchase Discount Account</InputLabel>
                <Select
                  value={formData.purchaseDiscountAccount}
                  onChange={(e) => handleChange("purchaseDiscountAccount", e.target.value)}
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
                              {acc.account_code}- {acc.account_name}
                            </Stack>
                          </MenuItem>
                        )),
                      ];
                    });
                  })()}
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
          <Button variant="outlined"
            onClick={() => window.history.back()}>
            Back
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: theme.palette.primary.main }}
            onClick={handleSubmit}
          >
            Add New Supplier Details
          </Button>
        </Box>
      </Box>
    </Stack>
  );
}
