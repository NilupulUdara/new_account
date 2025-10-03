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
  FormHelperText,
  SelectChangeEvent,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import theme from "../../../../theme";
import { createCreditStatusSetup } from "../../../../api/CreditStatusSetup/CreditStatusSetupApi";

interface CreditStatusFormData {
  description: string;
  disallowInvoicing: string;
}

export default function AddCreditStatusForm() {
  const [formData, setFormData] = useState<CreditStatusFormData>({
    description: "",
    disallowInvoicing: "",
  });

  const [errors, setErrors] = useState<Partial<CreditStatusFormData>>({});

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const validate = () => {
    const newErrors: Partial<CreditStatusFormData> = {};

    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.disallowInvoicing) newErrors.disallowInvoicing = "Please select an option";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
        if (validate()) {
          try {
            const payload = {
              reason_description: formData.description,
              disallow_invoices: formData.disallowInvoicing === "yes" ? true : false,
            };
    
            await createCreditStatusSetup(payload);
            alert("Credit Status Setup created successfully!");
            window.history.back();
          } catch (error) {
            console.error(error);
            alert("Failed to create Credit Status Setup");
          }
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
          Credit Status Setup
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Description"
            name="description"
            size="small"
            fullWidth
            value={formData.description}
            onChange={handleInputChange}
            error={!!errors.description}
            helperText={errors.description}
          />

          <FormControl size="small" fullWidth error={!!errors.disallowInvoicing}>
            <InputLabel>Disallow Invoicing?</InputLabel>
            <Select
              name="disallowInvoicing"
              value={formData.disallowInvoicing}
              onChange={handleSelectChange}
              label="Disallow Invoicing?"
            >
              <MenuItem value="yes">Yes</MenuItem>
              <MenuItem value="no">No</MenuItem>
            </Select>
            <FormHelperText>{errors.disallowInvoicing}</FormHelperText>
          </FormControl>
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 2 : 0, }}>
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
