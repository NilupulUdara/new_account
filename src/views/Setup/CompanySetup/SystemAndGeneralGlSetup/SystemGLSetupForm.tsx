import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  Theme,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import theme from "../../../../theme";

interface SystemGLSetupFormData {
  [key: string]: string;
}

export default function SystemGLSetupForm() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState<SystemGLSetupFormData>({
    pastDueDaysInterval: "",
    accountType: "",
    retainedEarnings: "",
    profitLossYear: "",
    exchangeVariancesAccount: "",
    bankChargesAccount: "",
    taxAlgorithm: "",
    dimensionRequiredByAfter: "",
    defaultCreditLimit: "",
    invoiceIdentification: "",
    accumulateBatchShipping: "",
    printItemImageOnQuote: "",
    legalTextOnInvoice: "",
    shippingChargedAccount: "",
    deferredIncomeAccount: "",
    receivableAccount: "",
    salesAccount: "",
    salesDiscountAccount: "",
    promptPaymentDiscountAccount: "",
    quoteValidDays: "",
    deliveryRequiredBy: "",
    deliveryOverReceiveAllowance: "",
    invoiceOverChangeAllowance: "",
    payableAccount: "",
    purchaseDiscountAccount: "",
    grnClearingAccount: "",
    receivalRequiredBy: "",
    showPOItemCodes: "",
    allowNegativeInventory: "",
    noZeroAmountsService: "",
    locationNotification: "",
    allowNegativePrices: "",
    itemSalesAccount: "",
    inventoryAccount: "",
    cogsAccount: "",
    inventoryAdjustmentsAccount: "",
    wipAccount: "",
    lossOnAssetDisposalAccount: "",
    depreciationPeriod: "",
    workOrderRequiredByAfter: "",
  });

  const [errors, setErrors] = useState<Partial<SystemGLSetupFormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isNumber = (value: string) => !isNaN(Number(value));

  const validateForm = (data: SystemGLSetupFormData) => {
    const errors: Partial<SystemGLSetupFormData> = {};
    Object.keys(data).forEach((key) => {
      if (!data[key]) errors[key] = "Required";
    });
    // Numeric fields validation
    ["pastDueDaysInterval", "defaultCreditLimit", "quoteValidDays"].forEach((key) => {
      if (data[key] && !isNumber(data[key])) errors[key] = "Must be a number";
    });
    return errors;
  };

  const handleSubmit = () => {
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      console.log("Form valid, sending to backend:", formData);
    }
  };

  const renderSection = (title: string, fields: { name: string; label: string }[]) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1">{title}</Typography>
      <Divider sx={{ mb: 2 }} />
      <Stack spacing={2}>
        {fields.map((field) => (
          <TextField
            key={field.name}
            fullWidth
            size="small"
            label={field.label}
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
            error={!!errors[field.name]}
            helperText={errors[field.name] || ""}
          />
        ))}
      </Stack>
    </Box>
  );

  const sectionPairs = [
    {
      left: {
        title: "General GL",
        fields: [
          { name: "pastDueDaysInterval", label: "Past Due Days Interval" },
          { name: "accountType", label: "Account Type" },
          { name: "retainedEarnings", label: "Retained Earnings" },
          { name: "profitLossYear", label: "Profit/Loss Year" },
          { name: "exchangeVariancesAccount", label: "Exchange Variances Account" },
          { name: "bankChargesAccount", label: "Bank Charges Account" },
          { name: "taxAlgorithm", label: "Tax Algorithm" },
        ],
      },
      right: {
        title: "Dimension Defaults",
        fields: [{ name: "dimensionRequiredByAfter", label: "Dimension Required By After" }],
      },
    },
    {
      left: {
        title: "Customers & Sales",
        fields: [
          { name: "defaultCreditLimit", label: "Default Credit Limit" },
          { name: "invoiceIdentification", label: "Invoice Identification" },
          { name: "accumulateBatchShipping", label: "Accumulate Batch Shipping" },
          { name: "printItemImageOnQuote", label: "Print Item Image on Quote" },
          { name: "legalTextOnInvoice", label: "Legal Text on Invoice" },
          { name: "shippingChargedAccount", label: "Shipping Charged Account" },
          { name: "deferredIncomeAccount", label: "Deferred Income Account" },
        ],
      },
      right: {
        title: "Customers & Sales Defaults",
        fields: [
          { name: "receivableAccount", label: "Receivable Account" },
          { name: "salesAccount", label: "Sales Account" },
          { name: "salesDiscountAccount", label: "Sales Discount Account" },
          { name: "promptPaymentDiscountAccount", label: "Prompt Payment Discount Account" },
          { name: "quoteValidDays", label: "Quote Valid Days" },
          { name: "deliveryRequiredBy", label: "Delivery Required By" },
        ],
      },
    },
    {
      left: {
        title: "Suppliers & Purchasing",
        fields: [
          { name: "deliveryOverReceiveAllowance", label: "Delivery Over Receive Allowance" },
          { name: "invoiceOverChangeAllowance", label: "Invoice Over Change Allowance" },
        ],
      },
      right: {
        title: "Suppliers & Purchasing Defaults",
        fields: [
          { name: "payableAccount", label: "Payable Account" },
          { name: "purchaseDiscountAccount", label: "Purchase Discount Account" },
          { name: "grnClearingAccount", label: "GRN Clearing Account" },
          { name: "receivalRequiredBy", label: "Receival Required By" },
          { name: "showPOItemCodes", label: "Show PO Item Codes" },
        ],
      },
    },
    {
      left: {
        title: "Inventory",
        fields: [
          { name: "allowNegativeInventory", label: "Allow Negative Inventory" },
          { name: "noZeroAmountsService", label: "No Zero Amounts (Service)" },
          { name: "locationNotification", label: "Location Notification" },
          { name: "allowNegativePrices", label: "Allow Negative Prices" },
        ],
      },
      right: {
        title: "Item Defaults",
        fields: [
          { name: "itemSalesAccount", label: "Sales Account" },
          { name: "inventoryAccount", label: "Inventory Account" },
          { name: "cogsAccount", label: "C.O.G.S. Account" },
          { name: "inventoryAdjustmentsAccount", label: "Inventory Adjustments Account" },
          { name: "wipAccount", label: "WIP Account" },
        ],
      },
    },
    {
      left: {
        title: "Fixed Assets Defaults",
        fields: [
          { name: "lossOnAssetDisposalAccount", label: "Loss on Asset Disposal Account" },
          { name: "depreciationPeriod", label: "Depreciation Period" },
        ],
      },
      right: {
        title: "Manufacturing Defaults",
        fields: [{ name: "workOrderRequiredByAfter", label: "Work Order Required By After" }],
      },
    },
  ];

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: 2 }}>
      <Paper sx={{ p: theme.spacing(3), width: "100%", maxWidth: "1200px", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: "center" }}>
          System & General GL Setup
        </Typography>

        {sectionPairs.map((pair, idx) => (
          <Grid container spacing={2} key={idx}>
            <Grid item xs={12} md={6}>
              {renderSection(pair.left.title, pair.left.fields)}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderSection(pair.right.title, pair.right.fields)}
            </Grid>
          </Grid>
        ))}

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            gap: 2,
            mt: 3,
          }}
        >
          <Button fullWidth={isMobile} variant="outlined" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button fullWidth={isMobile} variant="contained" sx={{ backgroundColor: "var(--pallet-blue)" }} onClick={handleSubmit}>
            Update
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
