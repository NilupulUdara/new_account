import React, { useState } from "react";
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
} from "@mui/material";
import theme from "../../../../theme";
import { createPaymentTerm } from "../../../../api/PaymentTerm/PaymentTermApi";

interface PaymentTermsFormData {
  termsDescription: string;
  paymentType: string;
  days: string;
}

export default function AddPaymentTermsForm() {
  const [formData, setFormData] = useState<PaymentTermsFormData>({
    termsDescription: "",
    paymentType: "",
    days: ""
  });

  const [errors, setErrors] = useState<Partial<PaymentTermsFormData>>({});
  const [additionalDays, setAdditionalDays] = useState<string>("");

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const handleAdditionalDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdditionalDays(e.target.value);
  };

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
    const newErrors: Partial<PaymentTermsFormData> = {};

    if (!formData.termsDescription) newErrors.termsDescription = "Payment Description is required";
    if (!formData.paymentType) newErrors.paymentType = "Payment type is required";


    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        const payload = {
          description: formData.termsDescription,
          days_before_due: formData.paymentType === "After No. of Days" ? parseInt(additionalDays || "0") : 0,
          day_in_following_month: formData.paymentType === "Day in following month" ? parseInt(additionalDays || "0") : 0,
          inactive: false,
        };

        await createPaymentTerm(payload);
        alert("Payment term created successfully!");
        window.history.back();
      } catch (error) {
        console.error(error);
        alert("Failed to create payment term");
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
          Payment Terms
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Description"
            name="termsDescription"
            size="small"
            fullWidth
            value={formData.termsDescription}
            onChange={handleChange}
            error={!!errors.termsDescription}
            helperText={errors.termsDescription}
          />

          <FormControl size="small" fullWidth error={!!errors.paymentType}>
            <InputLabel>Payment types</InputLabel>
            <Select
              name="paymentType"
              value={formData.paymentType}
              onChange={handleSelectChange}
              label="Payment types"
            >
              <MenuItem value="payment">payment</MenuItem>
              <MenuItem value="cash">cash</MenuItem>
              <MenuItem value="After No. of Days">After No. of Days</MenuItem>
              <MenuItem value="Day in following month">Day in following month</MenuItem>
            </Select>
            <FormHelperText>{errors.paymentType}</FormHelperText>
          </FormControl>


          {(formData.paymentType === "After No. of Days" ||
            formData.paymentType === "Day in following month") && (
              <TextField
                label={
                  formData.paymentType === "After No. of Days"
                    ? "Days"
                    : "Day in Following Month"
                }
                name="additionalDays"
                size="small"
                fullWidth
                value={additionalDays}
                onChange={handleAdditionalDaysChange}
                type="number"
              />
            )}
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
    </Stack>
  );
}
