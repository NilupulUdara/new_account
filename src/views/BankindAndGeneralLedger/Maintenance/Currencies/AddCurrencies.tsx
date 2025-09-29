import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import theme from "../../../../theme";
import { createCurrency } from "../../../../api/Currency/currencyApi";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

interface CurrenciesFormData {
  currencyAbbreviation: string;
  currencySymbol: string;
  currencyName: string;
  hundredthsName: string;
  country: string;
  autoExchangeRateUpdate: boolean;
}

export default function AddCurrencies() {
  const [formData, setFormData] = useState<CurrenciesFormData>({
    currencyAbbreviation: "",
    currencySymbol: "",
    currencyName: "",
    hundredthsName: "",
    country: "",
    autoExchangeRateUpdate: false,
  });

  const [errors, setErrors] = useState<Partial<CurrenciesFormData>>({});
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));


  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validate = (): boolean => {
    const newErrors: Partial<CurrenciesFormData> = {};

    if (!formData.currencyAbbreviation)
      newErrors.currencyAbbreviation = "Currency Abbreviation is required";

    if (!formData.currencySymbol)
      newErrors.currencySymbol = "Currency Symbol is required";

    if (!formData.currencyName)
      newErrors.currencyName = "Currency Name is required";

    if (!formData.hundredthsName)
      newErrors.hundredthsName = "Hundredths Name is required";

    if (!formData.country) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const payload = {
        currency_abbreviation: formData.currencyAbbreviation,
        currency_symbol: formData.currencySymbol,
        currency_name: formData.currencyName,
        hundredths_name: formData.hundredthsName,
        country: formData.country,
        auto_exchange_rate_update: formData.autoExchangeRateUpdate,
      };

      const currency = await createCurrency(payload);

      alert("Currency added successfully!");
      console.log("Created currency:", currency);

      // Refresh query
      queryClient.invalidateQueries({ queryKey: ["currencies"] });

      // Reset form
      setFormData({
        currencyAbbreviation: "",
        currencySymbol: "",
        currencyName: "",
        hundredthsName: "",
        country: "",
        autoExchangeRateUpdate: false,
      });
      setErrors({});

      navigate("/bankingandgeneralledger/maintenance/currencies");
    } catch (err: any) {
      alert("Error creating currency: " + JSON.stringify(err));
    }
  };


  return (
    <Stack alignItems="center" sx={{ mt: 4, px: 2 }}>
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
          Currencies
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Currency Abbreviation"
            name="currencyAbbreviation"
            size="small"
            fullWidth
            value={formData.currencyAbbreviation}
            onChange={handleChange}
            error={!!errors.currencyAbbreviation}
            helperText={errors.currencyAbbreviation}
          />

          <TextField
            label="Currency Symbol"
            name="currencySymbol"
            size="small"
            fullWidth
            value={formData.currencySymbol}
            onChange={handleChange}
            error={!!errors.currencySymbol}
            helperText={errors.currencySymbol}
          />

          <TextField
            label="Currency Name"
            name="currencyName"
            size="small"
            fullWidth
            value={formData.currencyName}
            onChange={handleChange}
            error={!!errors.currencyName}
            helperText={errors.currencyName}
          />

          <TextField
            label="Hundredths Name"
            name="hundredthsName"
            size="small"
            fullWidth
            value={formData.hundredthsName}
            onChange={handleChange}
            error={!!errors.hundredthsName}
            helperText={errors.hundredthsName}
          />

          <TextField
            label="Country"
            name="country"
            size="small"
            fullWidth
            value={formData.country}
            onChange={handleChange}
            error={!!errors.country}
            helperText={errors.country}
          />

          <FormControlLabel
            control={
              <Checkbox
                name="autoExchangeRateUpdate"
                checked={formData.autoExchangeRateUpdate}
                onChange={handleChange}
              />
            }
            label="Automatic Exchange Rate Update"
          />
        </Stack>

        {/* Responsive Button Layout */}
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
            onClick={() => window.history.back()}
            variant={isMobile ? "outlined" : "text"}
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
    </Stack>
  );
}
