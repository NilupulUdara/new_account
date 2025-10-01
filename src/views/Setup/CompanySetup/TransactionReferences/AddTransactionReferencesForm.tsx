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
  Checkbox,
  FormControlLabel,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import theme from "../../../../theme";

interface TransactionReferenceFormData {
  transactionType: string;
  referencePattern: string;
  setAsDefault: boolean;
  memo: string;
}

export default function AddTransactionReferencesForm() {
  const [formData, setFormData] = useState<TransactionReferenceFormData>({
    transactionType: "",
    referencePattern: "",
    setAsDefault: false,
    memo: "",
  });

  const [errors, setErrors] = useState<Partial<TransactionReferenceFormData>>({});
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const validate = () => {
    const newErrors: Partial<TransactionReferenceFormData> = {};
    if (!formData.transactionType) newErrors.transactionType = "Transaction type is required";
    if (!formData.referencePattern) newErrors.referencePattern = "Reference pattern is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log("Transaction Reference Submitted:", formData);
      alert("Transaction Reference added successfully!");
      setFormData({
        transactionType: "",
        referencePattern: "",
        setAsDefault: false,
        memo: "",
      });
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
          Add Transaction Reference
        </Typography>

        <Stack spacing={2}>
          <FormControl size="small" fullWidth error={!!errors.transactionType}>
            <InputLabel>Transaction Type</InputLabel>
            <Select
              name="transactionType"
              value={formData.transactionType}
              onChange={handleSelectChange}
              label="Transaction Type"
            >
              <MenuItem value="Invoice">Invoice</MenuItem>
              <MenuItem value="Receipt">Receipt</MenuItem>
              <MenuItem value="Payment">Payment</MenuItem>
            </Select>
            <FormHelperText>{errors.transactionType || " "}</FormHelperText>
          </FormControl>

          <TextField
            label="Reference Pattern"
            name="referencePattern"
            size="small"
            fullWidth
            value={formData.referencePattern}
            onChange={handleInputChange}
            error={!!errors.referencePattern}
            helperText={errors.referencePattern || " "}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.setAsDefault}
                onChange={handleCheckboxChange}
                name="setAsDefault"
              />
            }
            label="Set as Default for This Type"
          />

          <TextField
            label="Memo"
            name="memo"
            size="small"
            fullWidth
            multiline
            rows={2}
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
            Add New
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
