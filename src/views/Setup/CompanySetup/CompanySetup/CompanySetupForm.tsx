import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Grid,
  FormHelperText,
} from "@mui/material";
import theme from "../../../../theme";
import DateRangePicker from "../../../../components/DateRangePicker";
import { useForm } from "react-hook-form";

interface CompanyFormData {
  name: string;
  address: string;
  domicile: string;
  phone: string;
  fax: string;
  email: string;
  bcc: string;
  companyNumber: string;
  gst: string;
  homeCurrency: string;
  deleteCompanyLogo: boolean;
  companyLogoOnReports: boolean;
  useBarcodesOnStocks: boolean;
  autoIncreaseDocRef: boolean;
  useLongDescriptions: boolean;
  companyLogoOnView: boolean;
  databaseSchemeVersion: string;
  timeZone: boolean;
  dimension: boolean;
  fiscalYear: string;
  taxPeriods: string;
  taxLastPeriod: string;
  putAltTaxDoc: boolean;
  suppressTaxDoc: boolean;
  automaticRevaluationCurrency: boolean;
  baseForAutoPriceCalculation: string;
  addPriceFromStdCost: string;
  roundCalculatedPrices: string;
  manufacturing: boolean;
  fixedAssets: boolean;
  useDimensions: boolean;
  uiShortName: boolean;
  uiPrintDialog: boolean;
  searchItems: boolean;
  searchCustomers: boolean;
  searchSuppliers: boolean;
  loginTimeout: string;
  maxDayRangeInDocuments: string;
}

export default function CompanySetupForm() {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    address: "",
    domicile: "",
    phone: "",
    fax: "",
    email: "",
    bcc: "",
    companyNumber: "",
    gst: "",
    homeCurrency: "USD",
    deleteCompanyLogo: false,
    companyLogoOnReports: false,
    useBarcodesOnStocks: false,
    autoIncreaseDocRef: false,
    useLongDescriptions: false,
    companyLogoOnView: false,
    databaseSchemeVersion: "2.4.1",
    timeZone: false,
    dimension: false,
    fiscalYear: "2021",
    taxPeriods: "",
    taxLastPeriod: "",
    putAltTaxDoc: false,
    suppressTaxDoc: false,
    automaticRevaluationCurrency: false,
    baseForAutoPriceCalculation: "",
    addPriceFromStdCost: "",
    roundCalculatedPrices: "",
    manufacturing: false,
    fixedAssets: false,
    useDimensions: false,
    uiShortName: false,
    uiPrintDialog: false,
    searchItems: false,
    searchCustomers: false,
    searchSuppliers: false,
    loginTimeout: "",
    maxDayRangeInDocuments: "",
  });

  const [errors, setErrors] = useState<Partial<CompanyFormData>>({});

  const {
    control,
    register,
    formState: { errors: formErrors },
  } = useForm({
    defaultValues: {
      dateRangeFrom: null,
      dateRangeTo: null,
    },
    mode: "onChange",
  });

  const validate = (): boolean => {
    const newErrors: Partial<CompanyFormData> = {};

    if (!formData.name) newErrors.name = "Company name is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.domicile) newErrors.domicile = "Domicile is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    else if (!/^[0-9]+$/.test(formData.phone)) newErrors.phone = "Invalid phone number";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
    if (formData.bcc && !/\S+@\S+\.\S+/.test(formData.bcc)) newErrors.bcc = "Invalid email";
    if (!formData.companyNumber) newErrors.companyNumber = "Company number is required";
    if (!formData.homeCurrency) newErrors.homeCurrency = "Currency is required";
    if (!formData.taxPeriods) newErrors.taxPeriods = "Tax periods required";
    else if (!/^[0-9]+$/.test(formData.taxPeriods)) newErrors.taxPeriods = "Invalid number";
    if (formData.taxLastPeriod && !/^[0-9]+$/.test(formData.taxLastPeriod))
      newErrors.taxLastPeriod = "Invalid number";
    if (!formData.baseForAutoPriceCalculation)
      newErrors.baseForAutoPriceCalculation = "Select a base for pricing";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = () => {
    const isValid = validate();
    const hasDateErrors = !!(formErrors.dateRangeFrom || formErrors.dateRangeTo);

    if (isValid && !hasDateErrors) {
      const fiscalYearData = {
        fiscalYearStart: control._formValues.dateRangeFrom,
        fiscalYearEnd: control._formValues.dateRangeTo,
      };
      console.log("Submitted:", { ...formData, ...fiscalYearData });
      alert("Company setup submitted successfully!");
    }
  };

  return (
    <Stack alignItems="center" sx={{ p: { xs: 1, md: 3 } }}>
      <Paper
        sx={{
          p: theme.spacing(3),
          width: "100%",
          maxWidth: "1200px",
          boxShadow: 2,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
          Company Setup
        </Typography>

        <Grid container spacing={4}>
          {/* Left Section - General Settings */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="subtitle1">General Settings</Typography>
              <Divider />

              <TextField
                label="Name (to appear on reports)"
                name="name"
                size="small"
                fullWidth
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
              />

              <TextField
                label="Address"
                name="address"
                size="small"
                fullWidth
                multiline
                rows={3}
                value={formData.address}
                onChange={handleChange}
                error={!!errors.address}
                helperText={errors.address}
              />

              <TextField
                label="Domicile"
                name="domicile"
                size="small"
                fullWidth
                value={formData.domicile}
                onChange={handleChange}
                error={!!errors.domicile}
                helperText={errors.domicile}
              />

              <TextField
                label="Phone Number"
                name="phone"
                size="small"
                fullWidth
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
              />

              <TextField
                label="Fax Number"
                name="fax"
                size="small"
                fullWidth
                value={formData.fax}
                onChange={handleChange}
              />

              <TextField
                label="Email Address"
                name="email"
                size="small"
                fullWidth
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />

              <TextField
                label="BCC Address for all outgoing mails"
                name="bcc"
                size="small"
                fullWidth
                value={formData.bcc}
                onChange={handleChange}
                error={!!errors.bcc}
                helperText={errors.bcc}
              />

              <TextField
                label="Official Company Number"
                name="companyNumber"
                size="small"
                fullWidth
                value={formData.companyNumber}
                onChange={handleChange}
                error={!!errors.companyNumber}
                helperText={errors.companyNumber}
              />

              <TextField
                label="GST Number"
                name="gst"
                size="small"
                fullWidth
                value={formData.gst}
                onChange={handleChange}
              />

              <FormControl size="small" fullWidth error={!!errors.homeCurrency}>
                <InputLabel>Home Currency</InputLabel>
                <Select
                  name="homeCurrency"
                  value={formData.homeCurrency}
                  onChange={(e) =>
                    setFormData({ ...formData, homeCurrency: e.target.value })
                  }
                  label="Home Currency"
                >
                  <MenuItem value="USD">US Dollars</MenuItem>
                  <MenuItem value="LKR">Sri Lankan Rupees</MenuItem>
                  <MenuItem value="EUR">Euros</MenuItem>
                </Select>
                <FormHelperText>{errors.homeCurrency}</FormHelperText>
              </FormControl>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">New Company Logo (.jpg)</Typography>
                <input type="file" name="newCompanyLogo" onChange={handleChange} />
              </Box>

              <FormControlLabel
                label="Delete Company Logo"
                control={
                  <Checkbox
                    name="deleteCompanyLogo"
                    checked={formData.deleteCompanyLogo}
                    onChange={handleChange}
                  />
                }
              />

              <FormControlLabel
                label="Time Zone on Reports"
                control={
                  <Checkbox
                    name="timeZone"
                    checked={formData.timeZone}
                    onChange={handleChange}
                  />
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.companyLogoOnReports}
                    onChange={handleChange}
                    name="companyLogoOnReports"
                  />
                }
                label="Company Logo on Reports"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.useBarcodesOnStocks}
                    onChange={handleChange}
                    name="useBarcodesOnStocks"
                  />
                }
                label="Use Barcodes on Stocks"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.autoIncreaseDocRef}
                    onChange={handleChange}
                    name="autoIncreaseDocRef"
                  />
                }
                label="Auto Increase of Document References"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.dimension}
                    onChange={handleChange}
                    name="dimension"
                  />
                }
                label="Use Dimensions on Recurrent Invoices"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.useLongDescriptions}
                    onChange={handleChange}
                    name="useLongDescriptions"
                  />
                }
                label="Use Long Descriptions on Invoices"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.companyLogoOnView}
                    onChange={handleChange}
                    name="companyLogoOnView"
                  />
                }
                label="Company Logo on Views"
              />

              <TextField
                label="Database Scheme Version"
                name="databaseSchemeVersion"
                size="small"
                fullWidth
                value={formData.databaseSchemeVersion}
                InputProps={{ readOnly: true }}
              />
            </Stack>
          </Grid>

          {/* Right Section - Ledger & Options */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="subtitle1">General Ledger Settings</Typography>
              <Divider />

              <Typography variant="subtitle1">Fiscal Year</Typography>
              <DateRangePicker
                label="Fiscal Year"
                control={control}
                register={register}
                errors={formErrors}
              />

              <TextField
                label="Tax Periods (months)"
                name="taxPeriods"
                size="small"
                fullWidth
                value={formData.taxPeriods}
                onChange={handleChange}
                error={!!errors.taxPeriods}
                helperText={errors.taxPeriods}
              />

              <TextField
                label="Last Tax Period (months back)"
                name="taxLastPeriod"
                size="small"
                fullWidth
                value={formData.taxLastPeriod}
                onChange={handleChange}
                error={!!errors.taxLastPeriod}
                helperText={errors.taxLastPeriod}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.putAltTaxDoc}
                    onChange={handleChange}
                    name="putAltTaxDoc"
                  />
                }
                label="Put Alternative Tax Include on Docs"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.suppressTaxDoc}
                    onChange={handleChange}
                    name="suppressTaxDoc"
                  />
                }
                label="Suppress Tax Rate on Docs"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.automaticRevaluationCurrency}
                    onChange={handleChange}
                    name="automaticRevaluationCurrency"
                  />
                }
                label="Automatic Revaluation Currency Accounts"
              />

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Sales Pricing
              </Typography>

              <FormControl size="small" fullWidth error={!!errors.baseForAutoPriceCalculation}>
                <InputLabel>Base For Auto Price Calculation</InputLabel>
                <Select
                  name="baseForAutoPriceCalculation"
                  value={formData.baseForAutoPriceCalculation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      baseForAutoPriceCalculation: e.target.value,
                    })
                  }
                  label="Base For Auto Price Calculation"
                >
                  <MenuItem value="standardCost">Standard Cost</MenuItem>
                  <MenuItem value="lastCost">Last Cost</MenuItem>
                  <MenuItem value="averageCost">Average Cost</MenuItem>
                </Select>
                <FormHelperText>{errors.baseForAutoPriceCalculation}</FormHelperText>
              </FormControl>

              <TextField
                label="Add Price from Std Cost"
                name="addPriceFromStdCost"
                size="small"
                fullWidth
                value={formData.addPriceFromStdCost}
                onChange={handleChange}
              />

              <TextField
                label="Round Calculated Prices to Nearest"
                name="roundCalculatedPrices"
                size="small"
                fullWidth
                value={formData.roundCalculatedPrices}
                onChange={handleChange}
              />

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Optional Modules
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.manufacturing}
                    onChange={handleChange}
                    name="manufacturing"
                  />
                }
                label="Manufacturing"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.fixedAssets}
                    onChange={handleChange}
                    name="fixedAssets"
                  />
                }
                label="Fixed Assets"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.useDimensions}
                    onChange={handleChange}
                    name="useDimensions"
                  />
                }
                label="Use Dimensions"
              />

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                User Interface Options
              </Typography>
              <Divider />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.uiShortName}
                    onChange={handleChange}
                    name="uiShortName"
                  />
                }
                label="Short Name and Name in List"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.uiPrintDialog}
                    onChange={handleChange}
                    name="uiPrintDialog"
                  />
                }
                label="Open Print Dialog Direct on Reports"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.searchItems}
                    onChange={handleChange}
                    name="searchItems"
                  />
                }
                label="Search Item List"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.searchCustomers}
                    onChange={handleChange}
                    name="searchCustomers"
                  />
                }
                label="Search Customer List"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.searchSuppliers}
                    onChange={handleChange}
                    name="searchSuppliers"
                  />
                }
                label="Search Supplier List"
              />

              <TextField
                label="Login Timeout (seconds)"
                name="loginTimeout"
                size="small"
                fullWidth
                value={formData.loginTimeout}
                onChange={handleChange}
              />

              <TextField
                label="Max Day Range in Documents (days)"
                name="maxDayRangeInDocuments"
                size="small"
                fullWidth
                value={formData.maxDayRangeInDocuments}
                onChange={handleChange}
              />
            </Stack>
          </Grid>
        </Grid>

        {/* Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 3,
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Button onClick={() => window.history.back()} fullWidth={true} sx={{ sm: { width: "auto" } }}>
            Back
          </Button>

          <Button
            variant="contained"
            sx={{ backgroundColor: "var(--pallet-blue)" }}
            onClick={handleSubmit}
            fullWidth={true}
          >
            Update
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
