import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormHelperText,
  useMediaQuery,
  useTheme,
  ListSubheader
} from "@mui/material";
import theme from "../../../../theme";
import { createTaxType } from "../../../../api/Tax/taxServices";
import AddedConfirmationModal from "../../../../components/AddedConfirmationModal";
import ErrorModal from "../../../../components/ErrorModal";
import { getChartMasters } from "../../../../api/GLAccounts/ChartMasterApi";

interface TaxFormData {
  description: string;
  defaultRate: string;
  salesGlAccount: string;
  purchasingGlAccount: string;
}

export default function AddTaxTypes() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState<TaxFormData>({
    description: "",
    defaultRate: "",
    salesGlAccount: "",
    purchasingGlAccount: "",
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

  const [chartMasters, setChartMasters] = useState<any[]>([]);
  useEffect(() => {
    getChartMasters().then(setChartMasters);
  }, []);

  const [errors, setErrors] = useState<Partial<TaxFormData>>({});

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = (): boolean => {
    const newErrors: Partial<TaxFormData> = {};

    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.defaultRate) {
      newErrors.defaultRate = "Default rate is required";
    } else if (isNaN(Number(formData.defaultRate)) || Number(formData.defaultRate) < 0) {
      newErrors.defaultRate = "Default rate must be a positive number";
    }
    if (!formData.salesGlAccount) newErrors.salesGlAccount = "Sales GL Account is required";
    if (!formData.purchasingGlAccount) newErrors.purchasingGlAccount = "Purchasing GL Account is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        const payload = {
          description: formData.description,
          default_rate: formData.defaultRate,
          sales_gl_account: formData.salesGlAccount,
          purchasing_gl_account: formData.purchasingGlAccount,
        };

        await createTaxType(payload);
        setOpen(true);
      } catch (error) {
        console.error(error);
        setErrorMessage(
          error?.response?.data?.message ||
          "Failed to add tax type Please try again."
        );
        setErrorOpen(true);
      }
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper
        sx={{
          p: theme.spacing(3),
          maxWidth: isMobile ? "100%" : "500px",
          width: "100%",
          boxShadow: 2,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>
          Tax Types
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Description"
            name="description"
            size="small"
            fullWidth
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
          />

          <TextField
            label="Default Rate (%)"
            name="defaultRate"
            size="small"
            type="number"
            fullWidth
            value={formData.defaultRate}
            onChange={handleChange}
            error={!!errors.defaultRate}
            helperText={errors.defaultRate}
          />

          <FormControl size="small" fullWidth error={!!errors.salesGlAccount}>
            <InputLabel>Sales GL Account</InputLabel>
            <Select
              name="salesGlAccount"
              value={formData.salesGlAccount}
              onChange={handleSelectChange}
              label="Sales GL Account"
            >
              {Object.entries(
                chartMasters.reduce((acc: any, account) => {
                  const type = account.account_type || "Unknown";
                  if (!acc[type]) acc[type] = [];
                  acc[type].push(account);
                  return acc;
                }, {})
              ).flatMap(([type, accounts]: any) => [
                <ListSubheader key={`header-${type}`}>
                  {accountTypeMap[Number(type)] || "Unknown"}
                </ListSubheader>,
                ...accounts.map((acc: any) => (
                  <MenuItem key={acc.account_code} value={acc.account_code}>
                    <Stack direction="row" justifyContent="space-between" sx={{ width: "100%" }}>
                      {acc.account_code} - {acc.account_name}
                    </Stack>
                  </MenuItem>
                )),
              ])}
            </Select>
            <FormHelperText>{errors.salesGlAccount}</FormHelperText>
          </FormControl>

          <FormControl size="small" fullWidth error={!!errors.purchasingGlAccount}>
            <InputLabel>Purchasing GL Account</InputLabel>
            <Select
              name="purchasingGlAccount"
              value={formData.purchasingGlAccount}
              onChange={handleSelectChange}
              label="Purchasing GL Account"
            >
              {Object.entries(
                chartMasters.reduce((acc: any, account) => {
                  const type = account.account_type || "Unknown";
                  if (!acc[type]) acc[type] = [];
                  acc[type].push(account);
                  return acc;
                }, {})
              ).flatMap(([type, accounts]: any) => [
                <ListSubheader key={`header-${type}`}>
                  {accountTypeMap[Number(type)] || "Unknown"}
                </ListSubheader>,
                ...accounts.map((acc: any) => (
                  <MenuItem key={acc.account_code} value={acc.account_code}>
                    <Stack direction="row" justifyContent="space-between" sx={{ width: "100%" }}>
                      {acc.account_code} - {acc.account_name}
                    </Stack>
                  </MenuItem>
                )),
              ])}
            </Select>
            <FormHelperText>{errors.purchasingGlAccount}</FormHelperText>
          </FormControl>
        </Stack>

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            mt: 3,
            gap: isMobile ? 2 : 0,
          }}
        >
          <Button
            fullWidth={isMobile}
            variant="outlined"
            onClick={() => window.history.back()}
          >
            Back
          </Button>

          <Button
            variant="contained"
            fullWidth={isMobile}
            sx={{ backgroundColor: "var(--pallet-blue)" }}
            onClick={handleSubmit}
          >
            Add New
          </Button>
        </Box>
      </Paper>
      <AddedConfirmationModal
        open={open}
        title="Success"
        content="Tax Types has been added successfully!"
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
