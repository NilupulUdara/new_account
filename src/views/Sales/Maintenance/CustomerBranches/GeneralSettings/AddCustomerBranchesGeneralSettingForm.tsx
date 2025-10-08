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
import {
  getSalesTypes, SalesType,
  getSalesAreas, SalesArea
} from "../../../../../api/SalesMaintenance/salesService";
import { getSalesPersons, SalesPerson } from "../../../../../api/SalesPerson/SalesPersonApi";
import { getInventoryLocations, InventoryLocation } from "../../../../../api/InventoryLocation/InventoryLocationApi";
import { getShippingCompanies, ShippingCompany } from "../../../../../api/ShippingCompany/ShippingCompanyApi";
import { getTaxGroups, TaxGroup } from "../../../../../api/Tax/taxServices";
import { createBranch } from "../../../../../api/CustomerBranch/CustomerBranchApi";
import { useParams } from "react-router";
import ErrorModal from "../../../../../components/ErrorModal";
import AddedConfirmationModal from "../../../../../components/AddedConfirmationModal";

export default function AddCustomerBranchesGeneralSettingForm() {
  const { id: customerId } = useParams();
  useEffect(() => {
    if (customerId) setFormData((prev) => ({ ...prev, debtor_no: customerId }));
  }, [customerId]);

const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    debtor_no: customerId,   
    branchName: "",
    branchShortName: "",
    branch_ref: "",          
    salesPerson: "",
    salesArea: "",
    salesGroup: "",
    defaultInventoryLocation: "",
    defaultShippingCompany: "",
    taxGroup: "",
    salesAccount: "",
    salesDiscountAccount: "",
    accountsReceivable: "",
    promptPaymentDiscount: "",
    bankAccountNumber: "",
    contactPerson: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    faxNumber: "",
    email: "",
    documentLanguage: "",
    mailingAddress: "",
    billingAddress: "",
    generalNotes: "",
  });


  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [salesTypes, setSalesTypes] = useState<SalesType[]>([]);
  useEffect(() => { getSalesTypes().then(setSalesTypes); }, []);

  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  useEffect(() => { getSalesPersons().then(setSalesPersons); }, []);

  const [salesAreas, setSalesAreas] = useState<SalesArea[]>([]);
  useEffect(() => { getSalesAreas().then(setSalesAreas); }, []);

  const [InventoryLocations, setInventoryLocations] = useState<InventoryLocation[]>([]);
  useEffect(() => { getInventoryLocations().then(setInventoryLocations); }, []);

  const [ShippingCompanies, setShippingCompanies] = useState<ShippingCompany[]>([]);
  useEffect(() => { getShippingCompanies().then(setShippingCompanies); }, []);

  const [TaxGroups, setTaxGroups] = useState<TaxGroup[]>([]);
  useEffect(() => { getTaxGroups().then(setTaxGroups); }, []);

  const handleChange = (field: string, value: string | number) => {
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

    // Sales - ID fields just check for truthiness
    if (!formData.salesPerson) tempErrors.salesPerson = "Sales Person is required";
    if (!formData.salesArea) tempErrors.salesArea = "Sales Area is required";
    if (!formData.salesGroup) tempErrors.salesGroup = "Sales Group is required";
    if (!formData.defaultInventoryLocation) tempErrors.defaultInventoryLocation = "Default Inventory Location is required";
    if (!formData.defaultShippingCompany) tempErrors.defaultShippingCompany = "Default Shipping Company is required";
    if (!formData.taxGroup) tempErrors.taxGroup = "Tax Group is required";

    // GL Accounts
    if (!formData.salesAccount.trim()) tempErrors.salesAccount = "Sales Account is required";
    if (!formData.salesDiscountAccount.trim()) tempErrors.salesDiscountAccount = "Sales Discount Account is required";
    if (!formData.accountsReceivable.trim()) tempErrors.accountsReceivable = "Accounts Receivable is required";
    if (!formData.promptPaymentDiscount.trim()) tempErrors.promptPaymentDiscount = "Prompt Payment Discount Account is required";
    if (!formData.bankAccountNumber.trim()) tempErrors.bankAccountNumber = "Bank Account Number is required";

    // General Contact Data
    if (!formData.contactPerson.trim()) tempErrors.contactPerson = "Contact Person is required";
    if (!formData.phoneNumber.trim()) tempErrors.phoneNumber = "Phone Number is required";
    else if (!phoneRegex.test(formData.phoneNumber)) tempErrors.phoneNumber = "Enter a valid 10-digit phone number";
    if (formData.secondaryPhoneNumber.trim() && !phoneRegex.test(formData.secondaryPhoneNumber))
      tempErrors.secondaryPhoneNumber = "Enter a valid 10-digit secondary phone number";
    if (formData.faxNumber.trim() && !faxRegex.test(formData.faxNumber))
      tempErrors.faxNumber = "Enter a valid fax number (6–15 digits)";
    if (!formData.email.trim()) tempErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) tempErrors.email = "Enter a valid email address";
    if (!formData.documentLanguage.trim()) tempErrors.documentLanguage = "Document Language is required";

    // Addresses
    if (!formData.mailingAddress.trim()) tempErrors.mailingAddress = "Mailing Address is required";
    if (!formData.billingAddress.trim()) tempErrors.billingAddress = "Billing Address is required";
    if (!formData.generalNotes.trim()) tempErrors.generalNotes = "General Notes are required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async () => {
  if (validate()) {
    try {
      const payload = {
        debtor_no: formData.debtor_no,
        br_name: formData.branchName,
        branch_ref: formData.branchShortName,
        salesman: formData.salesPerson ? Number(formData.salesPerson) : null,
        area: formData.salesArea ? Number(formData.salesArea) : null,
        sales_group: formData.salesGroup ? Number(formData.salesGroup) : null,
        inventory_location: formData.defaultInventoryLocation,
        tax_group_id: formData.taxGroup ? Number(formData.taxGroup) : null,
        sales_account: formData.salesAccount || '',
        sales_discount_account: formData.salesDiscountAccount || '',
        receivables_account: formData.accountsReceivable || '',
        payment_discount_account: formData.promptPaymentDiscount || '',
        bank_account: formData.bankAccountNumber || '',
        contact_person: formData.contactPerson || '',
        phone: formData.phoneNumber || '',
        phone2: formData.secondaryPhoneNumber || '',
        fax: formData.faxNumber || '',
        email: formData.email || '',
        lang: formData.documentLanguage || '',
        br_address: formData.mailingAddress || '',
        br_post_address: formData.billingAddress || '',
        notes: formData.generalNotes || '',
      };

      const response = await createBranch(payload);
      setOpen(true);
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.errors) {
        console.table(err.response.data.errors);
        // alert(
        //   "Validation failed:\n" +
        //     Object.values(err.response.data.errors).flat().join("\n")
        // );
        setErrorMessage(
        err?.response?.data?.message ||
        "Validation Failed Please try again."
      );
      setErrorOpen(true);
      } else {
        setErrorMessage(
                "Failed to save branch. See console for details."
              );
              setErrorOpen(true);
        // alert("Failed to save branch. See console for details.");
      }
    }
  }
};


  return (
    <Stack alignItems="center" sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{
        width: "100%",
        maxWidth: "1200px",
        p: theme.spacing(3),
        boxShadow: theme.shadows[2],
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.paper,
      }}>
        <Typography variant="h5" sx={{ mb: theme.spacing(3), textAlign: "center" }}>
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
                  onChange={(e) => handleChange("branchShortName", e.target.value)}
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
                {/* Sales Person */}
                <FormControl size="small" fullWidth error={!!errors.salesPerson}>
                  <InputLabel>Sales Person</InputLabel>
                  <Select
                    value={formData.salesPerson}
                    label="Sales Person"
                    onChange={(e) => handleChange("salesPerson", e.target.value)}
                  >
                    {salesPersons.map((person) => (
                      <MenuItem key={person.id} value={person.id.toString()}>
                        {person.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.salesPerson && (
                    <Typography variant="caption" color="error">{errors.salesPerson}</Typography>
                  )}
                </FormControl>

                {/* Sales Area */}
                <FormControl size="small" fullWidth error={!!errors.salesArea}>
                  <InputLabel>Sales Area</InputLabel>
                  <Select
                    value={formData.salesArea}
                    label="Sales Area"
                    onChange={(e) => handleChange("salesArea", e.target.value)}
                  >
                    {salesAreas.map((area) => (
                      <MenuItem key={area.id} value={area.id}>
                        {area.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.salesArea && (
                    <Typography variant="caption" color="error">{errors.salesArea}</Typography>
                  )}
                </FormControl>

                {/* Sales Group */}
                <FormControl fullWidth size="small" error={!!errors.salesGroup}>
                  <InputLabel>Sales Group</InputLabel>
                  <Select
                    value={formData.salesGroup}
                    onChange={(e) => handleChange("salesGroup", e.target.value)}
                    label="Sales Group"
                  >
                    <MenuItem value="small">Small</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                  </Select>
                  <FormHelperText>{errors.salesGroup || " "}</FormHelperText>
                </FormControl>

                {/* Default Inventory Location */}
                <FormControl size="small" fullWidth error={!!errors.defaultInventoryLocation}>
                  <InputLabel>Default Inventory Location</InputLabel>
                  <Select
                    value={formData.defaultInventoryLocation}
                    label="Default Inventory Location"
                    onChange={(e) => handleChange("defaultInventoryLocation", e.target.value)}
                  >
                    {InventoryLocations.map((loc) => (
                      <MenuItem key={loc.loc_code} value={loc.loc_code}>
                        {loc.location_name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.defaultInventoryLocation && (
                    <Typography variant="caption" color="error">{errors.defaultInventoryLocation}</Typography>
                  )}
                </FormControl>

                {/* Default Shipping Company */}
                <FormControl size="small" fullWidth error={!!errors.defaultShippingCompany}>
                  <InputLabel>Default Shipping Company</InputLabel>
                  <Select
                    value={formData.defaultShippingCompany}
                    label="Default Shipping Company"
                    onChange={(e) => handleChange("defaultShippingCompany", e.target.value)}
                  >
                    {ShippingCompanies.map((ship) => (
                      <MenuItem key={ship.shipper_id} value={ship.shipper_id}>
                        {ship.shipper_name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.defaultShippingCompany && (
                    <Typography variant="caption" color="error">{errors.defaultShippingCompany}</Typography>
                  )}
                </FormControl>

                {/* Tax Group */}
                <FormControl size="small" fullWidth error={!!errors.taxGroup}>
                  <InputLabel>Tax Group</InputLabel>
                  <Select
                    value={formData.taxGroup}
                    label="Tax Group"
                    onChange={(e) => handleChange("taxGroup", e.target.value)}
                  >
                    {TaxGroups.map((tax) => (
                      <MenuItem key={tax.id} value={tax.id}>
                        {tax.description}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.taxGroup && (
                    <Typography variant="caption" color="error">{errors.taxGroup}</Typography>
                  )}
                </FormControl>
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

                <FormControl fullWidth size="small">
                  <InputLabel>Sales Account</InputLabel>
                  <Select
                    value={formData.salesAccount}
                    onChange={(e) => handleChange("salesAccount", e.target.value)}
                    label="Sales Account"
                  >
                    <MenuItem value="sales">Sales</MenuItem>
                    <MenuItem value="product">Product</MenuItem>
                    <MenuItem value="service">Service</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Sales Discount Account</InputLabel>
                  <Select
                    value={formData.salesDiscountAccount}
                    onChange={(e) => handleChange("salesDiscountAccount", e.target.value)}
                    label="Sales Discount Account"
                  >
                    <MenuItem value="discount">Discount</MenuItem>
                    <MenuItem value="seasonal">Seasonal</MenuItem>
                    <MenuItem value="volume">Volume</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Accounts Receivable</InputLabel>
                  <Select
                    value={formData.accountsReceivable}
                    onChange={(e) => handleChange("accountsReceivable", e.target.value)}
                    label="Accounts Receivable"
                  >
                    <MenuItem value="domestic">Domestic</MenuItem>
                    <MenuItem value="foreign">Foreign</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Prompt Payment Discount</InputLabel>
                  <Select
                    value={formData.promptPaymentDiscount}
                    onChange={(e) => handleChange("promptPaymentDiscount", e.target.value)}
                    label="Prompt Payment Discount"
                  >
                    <MenuItem value="early">Early</MenuItem>
                    <MenuItem value="cash">Cash</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Bank Account Number"
                  value={formData.bankAccountNumber}
                  onChange={(e) => handleChange("bankAccountNumber", e.target.value)}
                  fullWidth
                  size="small"
                  error={!!errors.bankAccountNumber}
                  helperText={errors.bankAccountNumber || " "}
                />
              </Stack>

              {/* General Contact Data */}
              <Stack spacing={2}>
                <Typography variant="subtitle1">General Contact Data</Typography>
                <Divider />
                {[
                  "contactPerson",
                  "phoneNumber",
                  "secondaryPhoneNumber",
                  "faxNumber",
                  "email",
                  "documentLanguage",
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

          {/* Addresses */}
          <Grid item xs={12}>
            <Stack spacing={2}>
              <Typography variant="subtitle1">Addresses</Typography>
              <Divider />
              {["mailingAddress", "billingAddress", "generalNotes"].map((field) => (
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
              ))}
            </Stack>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: theme.spacing(4),
          flexDirection: { xs: "column", sm: "row" },
          gap: theme.spacing(2),
        }}>
          <Button variant="outlined" fullWidth onClick={() => window.history.back()}>
            Back
          </Button>
          <Button variant="contained" sx={{ backgroundColor: theme.palette.primary.main }} fullWidth onClick={handleSubmit}>
            Add New Branch
          </Button>
        </Box>
      </Box>
      <AddedConfirmationModal
              open={open}
              title="Success"
              content="Customer has been added successfully!"
              addFunc={async () => { }}
              handleClose={() => setOpen(false)}
              onSuccess={() => window.history.back()}
            />
      
            <ErrorModal
              open={errorOpen}
              onClose={() => setErrorOpen(false)}
              message={errorMessage}
            />
    </Stack>
  );
}
