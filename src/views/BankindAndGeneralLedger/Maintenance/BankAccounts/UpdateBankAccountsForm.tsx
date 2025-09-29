import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import theme from "../../../../theme";

interface BankAccountsFormData {
  bankAccountName: string;
  accountType: string;
  accountCurrency: string;
  defaultCurrencyAccount: string;
  bankAccountGLCode: string;
  bankChargesAccount: string;
  bankName: string;
  bankAccountNumber: string;
  bankAddress: string;
}

export default function UpdateBankAccountsForm() {
  const [formData, setFormData] = useState<BankAccountsFormData>({
    bankAccountName: "",
    accountType: "",
    accountCurrency: "",
    defaultCurrencyAccount: "",
    bankAccountGLCode: "",
    bankChargesAccount: "",
    bankName: "",
    bankAccountNumber: "",
    bankAddress: "",
  });

  const [errors, setErrors] = useState<Partial<BankAccountsFormData>>({});
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors: Partial<BankAccountsFormData> = {};
    if (!formData.bankAccountName) newErrors.bankAccountName = "Bank account name is required";
    if (!formData.accountType) newErrors.accountType = "Select account type";
    if (!formData.accountCurrency) newErrors.accountCurrency = "Select account currency";
    if (!formData.defaultCurrencyAccount) newErrors.defaultCurrencyAccount = "Select default currency account";
    if (!formData.bankAccountGLCode) newErrors.bankAccountGLCode = "Select bank account GL code";
    if (!formData.bankChargesAccount) newErrors.bankChargesAccount = "Select bank charges account";
    if (!formData.bankName) newErrors.bankName = "Bank name is required";
    if (!formData.bankAccountNumber) newErrors.bankAccountNumber = "Bank account number is required";
    if (!formData.bankAddress) newErrors.bankAddress = "Bank address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log("Submitted Data:", formData);
      alert("Bank account updated successfully!");
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper
        sx={{
          p: theme.spacing(3),
          maxWidth: "600px",
          width: "100%",
          boxShadow: 2,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>
          Update Bank Account
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Bank Account Name"
            name="bankAccountName"
            size="small"
            fullWidth
            value={formData.bankAccountName}
            onChange={handleInputChange}
            error={!!errors.bankAccountName}
            helperText={errors.bankAccountName || " "}
          />

          <FormControl size="small" fullWidth error={!!errors.accountType}>
            <InputLabel>Account Type</InputLabel>
            <Select name="accountType" value={formData.accountType} onChange={handleSelectChange} label="Account Type">
              <MenuItem value="Savings">Savings</MenuItem>
              <MenuItem value="Current">Current</MenuItem>
              <MenuItem value="Fixed Deposit">Fixed Deposit</MenuItem>
            </Select>
            <FormHelperText>{errors.accountType || " "}</FormHelperText>
          </FormControl>

          <FormControl size="small" fullWidth error={!!errors.accountCurrency}>
            <InputLabel>Bank Account Currency</InputLabel>
            <Select
              name="accountCurrency"
              value={formData.accountCurrency}
              onChange={handleSelectChange}
              label="Bank Account Currency"
            >
              <MenuItem value="LKR">LKR</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
            </Select>
            <FormHelperText>{errors.accountCurrency || " "}</FormHelperText>
          </FormControl>

          <FormControl size="small" fullWidth error={!!errors.defaultCurrencyAccount}>
            <InputLabel>Default Currency Account</InputLabel>
            <Select
              name="defaultCurrencyAccount"
              value={formData.defaultCurrencyAccount}
              onChange={handleSelectChange}
              label="Default Currency Account"
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
            <FormHelperText>{errors.defaultCurrencyAccount || " "}</FormHelperText>
          </FormControl>

          <FormControl size="small" fullWidth error={!!errors.bankAccountGLCode}>
            <InputLabel>Bank Account GL Code</InputLabel>
            <Select
              name="bankAccountGLCode"
              value={formData.bankAccountGLCode}
              onChange={handleSelectChange}
              label="Bank Account GL Code"
            >
              <MenuItem value="GL001">GL001</MenuItem>
              <MenuItem value="GL002">GL002</MenuItem>
            </Select>
            <FormHelperText>{errors.bankAccountGLCode || " "}</FormHelperText>
          </FormControl>

          <FormControl size="small" fullWidth error={!!errors.bankChargesAccount}>
            <InputLabel>Bank Charges Account</InputLabel>
            <Select
              name="bankChargesAccount"
              value={formData.bankChargesAccount}
              onChange={handleSelectChange}
              label="Bank Charges Account"
            >
              <MenuItem value="BC001">BC001</MenuItem>
              <MenuItem value="BC002">BC002</MenuItem>
            </Select>
            <FormHelperText>{errors.bankChargesAccount || " "}</FormHelperText>
          </FormControl>

          <TextField
            label="Bank Name"
            name="bankName"
            size="small"
            fullWidth
            value={formData.bankName}
            onChange={handleInputChange}
            error={!!errors.bankName}
            helperText={errors.bankName || " "}
          />

          <TextField
            label="Bank Account Number"
            name="bankAccountNumber"
            size="small"
            fullWidth
            value={formData.bankAccountNumber}
            onChange={handleInputChange}
            error={!!errors.bankAccountNumber}
            helperText={errors.bankAccountNumber || " "}
          />

          <TextField
            label="Bank Address"
            name="bankAddress"
            size="small"
            fullWidth
            multiline
            rows={2}
            value={formData.bankAddress}
            onChange={handleInputChange}
            error={!!errors.bankAddress}
            helperText={errors.bankAddress || " "}
          />
        </Stack>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 3,
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 2 : 0,
          }}
        >
          <Button onClick={() => window.history.back()}>Back</Button>

          <Button
            variant="contained"
            fullWidth={isMobile}
            sx={{ backgroundColor: "var(--pallet-blue)" }}
            onClick={handleSubmit}
          >
            Update
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
