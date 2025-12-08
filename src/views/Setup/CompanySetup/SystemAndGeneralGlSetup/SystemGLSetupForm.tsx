import React, { useEffect, useState } from "react";
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
  MenuItem,
  ListSubheader,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import theme from "../../../../theme";
import { getChartMasters } from "../../../../api/GLAccounts/ChartMasterApi";
import { getTaxAlgorithms } from "../../../../api/TaxAlgorithm/TaxAlgorithmApi";
import { getGlTypes } from "../../../../api/GlType/GlTypeApi";
import { getInvoiceIdentifications } from "../../../../api/InvoiceIdentification/InvoiceIdentificationApi";
import { getDepreciationPeriods } from "../../../../api/DepreciationPeriod/DepreciationPeriodApi";

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
    accumulateBatchShipping: "false",
    printItemImageOnQuote: "false",
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
    showPOItemCodes: "false",
    allowNegativeInventory: "false",
    noZeroAmountsService: "false",
    locationNotification: "false",
    allowNegativePrices: "false",
    itemSalesAccount: "",
    inventoryAccount: "",
    cogsAccount: "",
    inventoryAdjustmentsAccount: "",
    wipAccount: "",
    lossOnAssetDisposalAccount: "",
    depreciationPeriod: "",
    workOrderRequiredByAfter: "",
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

  const [errors, setErrors] = useState<Partial<SystemGLSetupFormData>>({});
  const [chartMasters, setChartMasters] = useState<any[]>([]);
  const { data: taxAlgorithms = [] } = useQuery({ queryKey: ['taxAlgorithms'], queryFn: async () => (await getTaxAlgorithms()).data });
  const { data: invoiceIdentifications = [] } = useQuery({ queryKey: ['invoiceIdentifications'], queryFn: async () => (await getInvoiceIdentifications()).data });
  const { data: depreciationPeriods = [] } = useQuery({ queryKey: ['depreciationPeriods'], queryFn: async () => (await getDepreciationPeriods()).data });
  const { data: glTypes = [] } = useQuery({ queryKey: ['glTypes'], queryFn: async () => (await getGlTypes()).data });

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

  const sectionPairs = [
    {
      left: {
        title: "General GL",
        fields: [
          { name: "pastDueDaysInterval", label: "Past Due Days Interval" },
          { name: "accountType", label: "Account Type", select: true, options: glTypes.map((gt: any) => ({ value: gt.id.toString(), label: gt.type })) },
          { name: "retainedEarnings", label: "Retained Earnings", select: true, options: (() => {
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
          }) },
          { name: "profitLossYear", label: "Profit/Loss Year", select: true, options: (() => {
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
                      {acc.account_code} - {acc.account_name}
                    </Stack>
                  </MenuItem>
                )),
              ];
            });
          }) },
          { name: "exchangeVariancesAccount", label: "Exchange Variances Account", select: true, options: (() => {
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
                      {acc.account_code} - {acc.account_name}
                    </Stack>
                  </MenuItem>
                )),
              ];
            });
          }) },
          { name: "bankChargesAccount", label: "Bank Charges Account", select: true, options: (() => {
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
          }) },
          { name: "taxAlgorithm", label: "Tax Algorithm", select: true, options: taxAlgorithms.map((alg: any) => ({ value: alg.id.toString(), label: alg.name })) },
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
          { name: "invoiceIdentification", label: "Invoice Identification", select: true, options: invoiceIdentifications.map((id: any) => ({ value: id.id.toString(), label: id.name })) },
          { name: "accumulateBatchShipping", label: "Accumulate Batch Shipping", type: 'checkbox' },
          { name: "printItemImageOnQuote", label: "Print Item Image on Quote", type: 'checkbox' },
          { name: "legalTextOnInvoice", label: "Legal Text on Invoice" },
          { name: "shippingChargedAccount", label: "Shipping Charged Account", select: true, options: (() => {
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
          }) },
          { name: "deferredIncomeAccount", label: "Deferred Income Account", select: true, options: (() => {
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
          }) },
        ],
      },
      right: {
        title: "Customers & Sales Defaults",
        fields: [
          { name: "receivableAccount", label: "Receivable Account", select: true, options: (() => {
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
          }) },
          { name: "salesAccount", label: "Sales Account", select: true, options: (() => {
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
          }) },
          { name: "salesDiscountAccount", label: "Sales Discount Account", select: true, options: (() => {
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
          }) },
          { name: "promptPaymentDiscountAccount", label: "Prompt Payment Discount Account", select: true, options: (() => {
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
          }) },
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
          { name: "payableAccount", label: "Payable Account", select: true, options: (() => {
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
          }) },
          { name: "purchaseDiscountAccount", label: "Purchase Discount Account", select: true, options: (() => {
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
          }) },
          { name: "grnClearingAccount", label: "GRN Clearing Account", select: true, options: (() => {
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
          }) },
          { name: "receivalRequiredBy", label: "Receival Required By" },
          { name: "showPOItemCodes", label: "Show PO Item Codes", type: 'checkbox' },
        ],
      },
    },
    {
      left: {
        title: "Inventory",
        fields: [
          { name: "allowNegativeInventory", label: "Allow Negative Inventory", type: 'checkbox' },
          { name: "noZeroAmountsService", label: "No Zero Amounts (Service)", type: 'checkbox' },
          { name: "locationNotification", label: "Location Notification", type: 'checkbox' },
          { name: "allowNegativePrices", label: "Allow Negative Prices", type: 'checkbox' },
        ],
      },
      right: {
        title: "Item Defaults",
        fields: [
          { name: "itemSalesAccount", label: "Sales Account", select: true, options: (() => {
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
          }) },
          { name: "inventoryAccount", label: "Inventory Account", select: true, options: (() => {
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
          }) },
          { name: "cogsAccount", label: "C.O.G.S. Account", select: true, options: (() => {
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
          }) },
          { name: "inventoryAdjustmentsAccount", label: "Inventory Adjustments Account", select: true, options: (() => {
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
          }) },
          { name: "wipAccount", label: "WIP Account", select: true, options: (() => {
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
          }) },
        ],
      },
    },
    {
      left: {
        title: "Fixed Assets Defaults",
        fields: [
          { name: "lossOnAssetDisposalAccount", label: "Loss on Asset Disposal Account", select: true, options: (() => {
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
          }) },
          { name: "depreciationPeriod", label: "Depreciation Period", select: true, options: depreciationPeriods.map((dp: any) => ({ value: dp.id.toString(), label: dp.name })) },
        ],
      },
      right: {
        title: "Manufacturing Defaults",
        fields: [{ name: "workOrderRequiredByAfter", label: "Work Order Required By After" }],
      },
    },
  ];

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

  const renderSection = (title: string, fields: { name: string; label: string; type?: string; select?: boolean; options?: { value: string; label: string }[] | (() => JSX.Element[]) }[]) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1">{title}</Typography>
      <Divider sx={{ mb: 2 }} />
      <Stack spacing={2}>
        {fields.map((field) => (
          field.type === 'checkbox' ? (
            <FormControlLabel
              key={field.name}
              control={
                <Checkbox
                  checked={formData[field.name] === 'true'}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked ? 'true' : 'false' })}
                  name={field.name}
                />
              }
              label={field.label}
            />
          ) : (
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
              select={field.select}
            >
              {field.select && (
                typeof field.options === 'function' ? (field.options as () => JSX.Element[])() : field.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))
              )}
            </TextField>
          )
        ))}
      </Stack>
    </Box>
  );

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
