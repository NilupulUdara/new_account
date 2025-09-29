import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import theme from "../../../../theme";
import DatePickerComponent from "../../../../components/DatePickerComponent";

interface ExchangeRateData {
  dateToUse: Date | null;
  exchangeRate: string;
}

export default function UpdateExchangeRateForm() {
  const [formData, setFormData] = useState<ExchangeRateData>({
    dateToUse: null,
    exchangeRate: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ExchangeRateData, string>>>({});
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const handleDateChange = (date: Date | null) => {
    setFormData({ ...formData, dateToUse: date });
    setErrors({ ...errors, dateToUse: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof ExchangeRateData, string>> = {};
    if (!formData.dateToUse) newErrors.dateToUse = "Date is required";
    if (!formData.exchangeRate.trim()) newErrors.exchangeRate = "Exchange Rate is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGet = () => {
    if (!formData.exchangeRate.trim()) {
      setErrors({ ...errors, exchangeRate: "Exchange Rate is required" });
      return;
    }
    alert(`Get clicked with Exchange Rate: ${formData.exchangeRate}`);
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log("Submitted Exchange Rate:", formData);
      alert("Exchange Rate submitted successfully!");
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
        <Typography
          variant="h6"
          sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}
        >
          Update Exchange Rate
        </Typography>

        <Stack spacing={2}>
          {/* Date to use for */}
          <DatePickerComponent
            value={formData.dateToUse}
            onChange={handleDateChange}
            label="Date to Use For"
            error={errors.dateToUse}
          />

          {/* Exchange Rate with Go button */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              label="Exchange Rate"
              name="exchangeRate"
              size="small"
              fullWidth
              value={formData.exchangeRate}
              onChange={handleInputChange}
              error={!!errors.exchangeRate}
              helperText={errors.exchangeRate || " "}
            />
            <Button
              variant="outlined"
              color="primary"
              onClick={handleGet}
              sx={{ height: "40px", minWidth: "70px" }}
            >
              Get
            </Button>
          </Box>
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
