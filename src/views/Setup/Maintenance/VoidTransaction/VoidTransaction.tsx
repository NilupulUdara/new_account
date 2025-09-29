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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import DatePickerComponent from "../../../../components/DatePickerComponent";

interface VoidTransactionData {
  transaction: string;
  voidingDate: Date | null;
  memo: string;
}

export default function VoidTransaction() {
  const [formData, setFormData] = useState<VoidTransactionData>({
    transaction: "",
    voidingDate: null,
    memo: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof VoidTransactionData, string>>
  >({});

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const handleDateChange = (date: Date | null) => {
    setFormData({ ...formData, voidingDate: date });
    setErrors({ ...errors, voidingDate: "" });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
    const newErrors: Partial<Record<keyof VoidTransactionData, string>> = {};
    if (!formData.transaction.trim())
      newErrors.transaction = "Transaction is required";
    if (!formData.voidingDate)
      newErrors.voidingDate = "Voiding Date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log("Voided Transaction:", formData);
      alert("Transaction voided successfully!");

      // Example API call
      // axios.post("/api/void-transaction", {
      //   transaction: formData.transaction,
      //   voidingDate: formData.voidingDate?.toISOString(),
      //   memo: formData.memo,
      // });
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper
        sx={{
          p: 3,
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
          Void Transaction
        </Typography>

        <Stack spacing={2}>
          {/* Transaction Dropdown */}
          <FormControl
            size="small"
            fullWidth
            error={!!errors.transaction}
          >
            <InputLabel>Transaction</InputLabel>
            <Select
              name="transaction"
              value={formData.transaction}
              onChange={handleSelectChange}
              label="Transaction"
            >
              <MenuItem value="">-- Select Transaction --</MenuItem>
              <MenuItem value="invoice001">Invoice #001</MenuItem>
              <MenuItem value="invoice002">Invoice #002</MenuItem>
              <MenuItem value="payment101">Payment #101</MenuItem>
            </Select>
            {errors.transaction && (
              <FormHelperText>{errors.transaction}</FormHelperText>
            )}
          </FormControl>

          {/* Voiding Date */}
          <DatePickerComponent
            value={formData.voidingDate}
            onChange={handleDateChange}
            label="Voiding Date"
            error={errors.voidingDate}
            disableFuture
          />

          {/* Memo */}
          <TextField
            label="Memo"
            name="memo"
            size="small"
            fullWidth
            multiline
            rows={3}
            value={formData.memo}
            onChange={handleInputChange}
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
            Void Transaction
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
