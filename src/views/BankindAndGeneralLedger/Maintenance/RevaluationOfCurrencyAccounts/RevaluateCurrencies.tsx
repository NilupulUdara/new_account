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

interface RevaluateCurrenciesData {
  revaluationDate: Date | null;
  memo: string;
}

export default function RevaluateCurrenciesForm() {
  const [formData, setFormData] = useState<RevaluateCurrenciesData>({
    revaluationDate: null,
    memo: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RevaluateCurrenciesData, string>>>({});
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const handleDateChange = (date: Date | null) => {
    setFormData({ ...formData, revaluationDate: date });
    setErrors({ ...errors, revaluationDate: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof RevaluateCurrenciesData, string>> = {};
    if (!formData.revaluationDate) newErrors.revaluationDate = "Revaluation Date is required";
    if (!formData.memo.trim()) newErrors.memo = "Memo is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log("Submitted Revaluation:", formData);
      alert("Revaluation submitted successfully!");
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
          Revaluate Currencies
        </Typography>

        <Stack spacing={2}>
          {/* Date for Revaluation */}
          <DatePickerComponent
            value={formData.revaluationDate}
            onChange={handleDateChange}
            label="Date for Revaluation"
            error={errors.revaluationDate}
            disableFuture 
          />

          {/* Memo */}
          <TextField
            label="Memo"
            name="memo"
            size="small"
            fullWidth
            multiline
            rows={5}
            value={formData.memo}
            onChange={handleInputChange}
            error={!!errors.memo}
            helperText={errors.memo || " "}
            
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
            Revaluate Currencies
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
