import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import theme from "../../../../../theme";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSalesGroups, SalesGroup,
  getSalesAreas, SalesArea
} from "../../../../../api/SalesMaintenance/salesService";
import { getSalesPersons, SalesPerson } from "../../../../../api/SalesPerson/SalesPersonApi";
import { getInventoryLocations, InventoryLocation } from "../../../../../api/InventoryLocation/InventoryLocationApi";
import { getShippingCompanies, ShippingCompany } from "../../../../../api/ShippingCompany/ShippingCompanyApi";
import { getTaxGroups, TaxGroup } from "../../../../../api/Tax/taxServices";
import { CustomerBranch, getBranch, updateBranch } from "../../../../../api/CustomerBranch/CustomerBranchApi";

export default function UpdateCustomerBranchesGeneralSettingForm() {
  const { branchCode } = useParams<{ branchCode: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    debtor_no: "",
    branchName: "",
    branchShortName: "",
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
    mailingAddress: "",
    billingAddress: "",
    generalNotes: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch dropdown data
  const [salesGroups, setSalesGroups] = useState<SalesGroup[]>([]);
  useEffect(() => { 
    getSalesGroups().then(setSalesGroups).catch(console.error); 
  }, []);
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  useEffect(() => { 
    getSalesPersons().then(setSalesPersons).catch(console.error); 
  }, []);
  const [salesAreas, setSalesAreas] = useState<SalesArea[]>([]);
  useEffect(() => { 
    getSalesAreas().then(setSalesAreas).catch(console.error); 
  }, []);
  const [InventoryLocations, setInventoryLocations] = useState<InventoryLocation[]>([]);
  useEffect(() => { 
    getInventoryLocations().then(setInventoryLocations).catch(console.error); 
  }, []);
  const [ShippingCompanies, setShippingCompanies] = useState<ShippingCompany[]>([]);
  useEffect(() => { 
    getShippingCompanies().then(setShippingCompanies).catch(console.error); 
  }, []);
  const [TaxGroups, setTaxGroups] = useState<TaxGroup[]>([]);
  useEffect(() => { 
    getTaxGroups().then(setTaxGroups).catch(console.error); 
  }, []);

  // Fetch branch data
  useEffect(() => {
    if (!branchCode) return;

    const fetchBranch = async () => {
      try {
        const data = await getBranch(branchCode);
        setFormData({
          debtor_no: data.debtor_no || "",
          branchName: data.br_name || "",
          branchShortName: data.branch_ref || "",
          salesPerson: data.sales_person ? (typeof data.sales_person === 'object' ? String(data.sales_person.id || '') : String(data.sales_person)) : "",
          salesArea: data.sales_area ? (typeof data.sales_area === 'object' ? String(data.sales_area.id || '') : String(data.sales_area)) : "",
          salesGroup: data.sales_group ? (typeof data.sales_group === 'object' ? String(data.sales_group.id || '') : String(data.sales_group)) : "",
          defaultInventoryLocation: data.inventory_location ? (typeof data.inventory_location === 'object' ? String(data.inventory_location.loc_code || '') : String(data.inventory_location)) : "",
          defaultShippingCompany: data.shipping_company ? (typeof data.shipping_company === 'object' ? String(data.shipping_company.shipper_id || '') : String(data.shipping_company)) : "",
          taxGroup: data.tax_group ? (typeof data.tax_group === 'object' ? String(data.tax_group.id || '') : String(data.tax_group)) : "",
          salesAccount: data.sales_account || "",
          salesDiscountAccount: data.sales_discount_account || "",
          accountsReceivable: data.receivables_account || "",
          promptPaymentDiscount: data.payment_discount_account || "",
          bankAccountNumber: data.bank_account || "",
          mailingAddress: data.br_post_address || "",
          billingAddress: data.br_address || "",
          generalNotes: data.notes || "",
        });
      } catch (error) {
        console.error("Failed to fetch branch data", error);
      }
    };

    fetchBranch();
  }, [branchCode]);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const validate = () => {
    const tempErrors: { [key: string]: string } = {};

    if (!formData.branchName.trim()) tempErrors.branchName = "Branch Name is required";
    if (!formData.branchShortName.trim()) tempErrors.branchShortName = "Branch Short Name is required";
    if (!formData.salesPerson.trim()) tempErrors.salesPerson = "Sales Person is required";
    if (!formData.salesArea.trim()) tempErrors.salesArea = "Sales Area is required";
    if (!formData.salesGroup.trim()) tempErrors.salesGroup = "Sales Group is required";
    if (!formData.defaultInventoryLocation.trim()) tempErrors.defaultInventoryLocation = "Default Inventory Location is required";
    if (!formData.defaultShippingCompany.trim()) tempErrors.defaultShippingCompany = "Default Shipping Company is required";
    if (!formData.taxGroup.trim()) tempErrors.taxGroup = "Tax Group is required";
    if (!formData.salesAccount.trim()) tempErrors.salesAccount = "Sales Account is required";
    if (!formData.salesDiscountAccount.trim()) tempErrors.salesDiscountAccount = "Sales Discount Account is required";
    if (!formData.accountsReceivable.trim()) tempErrors.accountsReceivable = "Accounts Receivable is required";
    if (!formData.promptPaymentDiscount.trim()) tempErrors.promptPaymentDiscount = "Prompt Payment Discount Account is required";
    if (!formData.bankAccountNumber.trim()) tempErrors.bankAccountNumber = "Bank Account Number is required";
    if (!formData.mailingAddress.trim()) tempErrors.mailingAddress = "Mailing Address is required";
    if (!formData.billingAddress.trim()) tempErrors.billingAddress = "Billing Address is required";
    if (!formData.generalNotes.trim()) tempErrors.generalNotes = "General Notes are required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!branchCode) {
      alert("Branch code is missing.");
      return;
    }

    const payload: CustomerBranch = {
      ...(formData.debtor_no && { debtor_no: Number(formData.debtor_no) }),
      br_name: formData.branchName,
      branch_ref: formData.branchShortName,
      sales_person: Number(formData.salesPerson),
      sales_area: Number(formData.salesArea),
      sales_group: Number(formData.salesGroup),
      inventory_location: formData.defaultInventoryLocation,
      shipping_company: Number(formData.defaultShippingCompany),
      tax_group: Number(formData.taxGroup),
      sales_account: formData.salesAccount,
      sales_discount_account: formData.salesDiscountAccount,
      receivables_account: formData.accountsReceivable,
      payment_discount_account: formData.promptPaymentDiscount,
      bank_account: formData.bankAccountNumber,
      br_post_address: formData.mailingAddress,
      br_address: formData.billingAddress,
      notes: formData.generalNotes,
      inactive: false,
    };

    try {
      await updateBranch(branchCode, payload);
      alert("Branch updated successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update branch.");
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
          Update Customer Branch Setup
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
                {/* Sales Person */}
                <FormControl size="small" fullWidth error={!!errors.salesPerson}>
                  <InputLabel>Sales Person</InputLabel>
                  <Select
                    value={formData.salesPerson}
                    label="Sales Person"
                    onChange={(e) => handleChange("salesPerson", String(e.target.value))}
                  >
                    {salesPersons.map((person) => (
                      <MenuItem key={person.id} value={String(person.id)}>
                        {person.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.salesPerson && (
                    <Typography variant="caption" color="error">
                      {errors.salesPerson}
                    </Typography>
                  )}
                </FormControl>

                {/* Sales Area */}
                <FormControl size="small" fullWidth error={!!errors.salesArea}>
                  <InputLabel>Sales Area</InputLabel>
                  <Select
                    value={formData.salesArea}
                    label="Sales Area"
                    onChange={(e) => handleChange("salesArea", String(e.target.value))}
                  >
                    {salesAreas.map((area) => (
                      <MenuItem key={area.id} value={String(area.id)}>
                        {area.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.salesArea && (
                    <Typography variant="caption" color="error">
                      {errors.salesArea}
                    </Typography>
                  )}
                </FormControl>

                {/* Sales Group */}
                <FormControl fullWidth size="small" error={!!errors.salesGroup}>
                  <InputLabel>Sales Group</InputLabel>
                  <Select
                    value={formData.salesGroup}
                    onChange={(e) => handleChange("salesGroup", String(e.target.value))}
                    label="Sales Group"
                  >
                    {salesGroups.map((group) => (
                      <MenuItem key={group.id} value={String(group.id)}>
                        {group.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{errors.salesGroup || " "}</FormHelperText>
                </FormControl>

                {/* Default Inventory Location */}
                <FormControl size="small" fullWidth error={!!errors.defaultInventoryLocation}>
                  <InputLabel>Default Inventory Location</InputLabel>
                  <Select
                    value={formData.defaultInventoryLocation}
                    label="Default Inventory Location"
                    onChange={(e) =>
                      handleChange("defaultInventoryLocation", String(e.target.value))
                    }
                  >
                    {InventoryLocations.map((loc) => (
                      <MenuItem key={loc.loc_code} value={loc.loc_code}>
                        {loc.location_name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.defaultInventoryLocation && (
                    <Typography variant="caption" color="error">
                      {errors.defaultInventoryLocation}
                    </Typography>
                  )}
                </FormControl>

                {/* Default Shipping Company */}
                <FormControl size="small" fullWidth error={!!errors.defaultShippingCompany}>
                  <InputLabel>Default Shipping Company</InputLabel>
                  <Select
                    value={formData.defaultShippingCompany}
                    label="Default Shipping Company"
                    onChange={(e) =>
                      handleChange("defaultShippingCompany", String(e.target.value))
                    }
                  >
                    {ShippingCompanies.map((ship) => (
                      <MenuItem key={ship.shipper_id} value={String(ship.shipper_id)}>
                        {ship.shipper_name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.defaultShippingCompany && (
                    <Typography variant="caption" color="error">
                      {errors.defaultShippingCompany}
                    </Typography>
                  )}
                </FormControl>

                {/* Tax Group */}
                <FormControl size="small" fullWidth error={!!errors.taxGroup}>
                  <InputLabel>Tax Group</InputLabel>
                  <Select
                    value={formData.taxGroup}
                    label="Tax Group"
                    onChange={(e) => handleChange("taxGroup", String(e.target.value))}
                  >
                    {TaxGroups.map((tax) => (
                      <MenuItem key={tax.id} value={String(tax.id)}>
                        {tax.description}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.taxGroup && (
                    <Typography variant="caption" color="error">
                      {errors.taxGroup}
                    </Typography>
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

              {/* Addresses */}
              <Stack spacing={2}>
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