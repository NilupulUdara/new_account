import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Divider,
  Grid,
} from "@mui/material";
import theme from "../../../../../theme";

interface CustomerBranchesProps {
  customerId?: string | number;
}

export default function UpdateCustomerBranchesGeneralSettingForm({ customerId }: CustomerBranchesProps) {
  const [formData, setFormData] = useState({
    // Name and Contacts
    branchName: "",
    branchShortName: "",

    // Sales
    salesPerson: "",
    salesArea: "",
    salesGroup: "",
    defaultInventoryLocation: "",
    defaultShippingCompany: "",
    taxGroup: "",

    // GL Accounts
    salesAccount: "",
    salesDiscountAccount: "",
    accountsReceivable: "",
    promptPaymentDiscount: "",
    bankAccountNumber: "",

    // General Contact Data
    contactPerson: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    faxNumber: "",
    email: "",
    documentLanguage: "",

    // Addresses
    mailingAddress: "",
    billingAddress: "",
    generalNotes: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const validate = () => {
    const tempErrors: { [key: string]: string } = {};
    const phoneRegex = /^[0-9]{10}$/;
    const faxRegex = /^[0-9]{6,15}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Name and Contacts
    if (!formData.branchName.trim())
      tempErrors.branchName = "Branch Name is required";
    if (!formData.branchShortName.trim())
      tempErrors.branchShortName = "Branch Short Name is required";

    // Sales
    if (!formData.salesPerson.trim())
      tempErrors.salesPerson = "Sales Person is required";
    if (!formData.salesArea.trim())
      tempErrors.salesArea = "Sales Area is required";
    if (!formData.salesGroup.trim())
      tempErrors.salesGroup = "Sales Group is required";
    if (!formData.defaultInventoryLocation.trim())
      tempErrors.defaultInventoryLocation = "Default Inventory Location is required";
    if (!formData.defaultShippingCompany.trim())
      tempErrors.defaultShippingCompany = "Default Shipping Company is required";
    if (!formData.taxGroup.trim())
      tempErrors.taxGroup = "Tax Group is required";

    // GL Accounts
    if (!formData.salesAccount.trim())
      tempErrors.salesAccount = "Sales Account is required";
    if (!formData.salesDiscountAccount.trim())
      tempErrors.salesDiscountAccount = "Sales Discount Account is required";
    if (!formData.accountsReceivable.trim())
      tempErrors.accountsReceivable = "Accounts Receivable is required";
    if (!formData.promptPaymentDiscount.trim())
      tempErrors.promptPaymentDiscount =
        "Prompt Payment Discount Account is required";
    if (!formData.bankAccountNumber.trim())
      tempErrors.bankAccountNumber = "Bank Account Number is required";

    // General Contact Data
    if (!formData.contactPerson.trim())
      tempErrors.contactPerson = "Contact Person is required";
    if (!formData.phoneNumber.trim())
      tempErrors.phoneNumber = "Phone Number is required";
    else if (!phoneRegex.test(formData.phoneNumber))
      tempErrors.phoneNumber = "Enter a valid 10-digit phone number";
    if (formData.secondaryPhoneNumber.trim() &&
      !phoneRegex.test(formData.secondaryPhoneNumber))
      tempErrors.secondaryPhoneNumber =
        "Enter a valid 10-digit secondary phone number";
    if (formData.faxNumber.trim() && !faxRegex.test(formData.faxNumber))
      tempErrors.faxNumber = "Enter a valid fax number (6–15 digits)";
    if (!formData.email.trim()) tempErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email))
      tempErrors.email = "Enter a valid email address";
    if (!formData.documentLanguage.trim())
      tempErrors.documentLanguage = "Document Language is required";

    // Addresses
    if (!formData.mailingAddress.trim())
      tempErrors.mailingAddress = "Mailing Address is required";
    if (!formData.billingAddress.trim())
      tempErrors.billingAddress = "Billing Address is required";
    if (!formData.generalNotes.trim())
      tempErrors.generalNotes = "General Notes are required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log("Submitted Branch:", formData);
      alert("Branch settings saved!");
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
          Customer Branch Setup
        </Typography>

        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {/* Name and Contacts */}
              <Stack spacing={2}>
                <Typography variant="subtitle1">Name and Contacts</Typography>
                <Divider />
                <TextField
                  label="Branch Name"
                  value={formData.branchName}
                  onChange={(e) => handleChange("branchName", e.target.value)}
                  size="small"
                  fullWidth
                  error={!!errors.branchName}
                  helperText={errors.branchName}
                />
                <TextField
                  label="Branch Short Name"
                  value={formData.branchShortName}
                  onChange={(e) =>
                    handleChange("branchShortName", e.target.value)
                  }
                  size="small"
                  fullWidth
                  error={!!errors.branchShortName}
                  helperText={errors.branchShortName}
                />
              </Stack>

              {/* Sales */}
              <Stack spacing={2}>
                <Typography variant="subtitle1">Sales</Typography>
                <Divider />
                {[
                  "salesPerson",
                  "salesArea",
                  "salesGroup",
                  "defaultInventoryLocation",
                  "defaultShippingCompany",
                  "taxGroup",
                ].map((field) => (
                  <TextField
                    key={field}
                    label={field.replace(/([A-Z])/g, " $1")}
                    value={formData[field as keyof typeof formData]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    size="small"
                    fullWidth
                    error={!!errors[field]}
                    helperText={errors[field]}
                  />
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {/* GL Accounts */}
              <Stack spacing={2}>
                <Typography variant="subtitle1">GL Accounts</Typography>
                <Divider />
                {[
                  "salesAccount",
                  "salesDiscountAccount",
                  "accountsReceivable",
                  "promptPaymentDiscount",
                  "bankAccountNumber",
                ].map((field) => (
                  <TextField
                    key={field}
                    label={field.replace(/([A-Z])/g, " $1")}
                    value={formData[field as keyof typeof formData]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    size="small"
                    fullWidth
                    error={!!errors[field]}
                    helperText={errors[field]}
                  />
                ))}
              </Stack>

              {/* General Contact Data */}
              <Stack spacing={2}>
                <Typography variant="subtitle1">
                  General Contact Data
                </Typography>
                <Divider />

                <Typography variant="subtitle1">Addresses</Typography>
                <Divider />
                {["mailingAddress", "billingAddress", "generalNotes"].map(
                  (field) => (
                    <TextField
                      key={field}
                      label={field.replace(/([A-Z])/g, " $1")}
                      value={formData[field as keyof typeof formData]}
                      onChange={(e) => handleChange(field, e.target.value)}
                      size="small"
                      fullWidth
                      multiline
                      rows={field === "generalNotes" ? 3 : 2}
                      error={!!errors[field]}
                      helperText={errors[field]}
                    />
                  )
                )}

              </Stack>
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
            fullWidth
            onClick={() => window.history.back()}
          >
            Back
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: theme.palette.primary.main }}
            fullWidth
            onClick={handleSubmit}
          >
            Update
          </Button>
        </Box>
      </Box>
    </Stack>
  );
}
