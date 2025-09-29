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

interface QuickEntryFormData {
  name: string;
  description: string;
  usage: string;
  entryType: string;
  baseAmountDescription: string;
  defaultBaseAmount: string;
}

export default function UpdateQuickEntriesForm() {
  const [formData, setFormData] = useState<QuickEntryFormData>({
    name: "",
    description: "",
    usage: "",
    entryType: "",
    baseAmountDescription: "",
    defaultBaseAmount: "",
  });

  const [errors, setErrors] = useState<Partial<QuickEntryFormData>>({});
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
    const newErrors: Partial<QuickEntryFormData> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.usage) newErrors.usage = "Usage is required";
    if (!formData.entryType) newErrors.entryType = "Select entry type";
    if (!formData.baseAmountDescription) newErrors.baseAmountDescription = "Base amount description required";
    if (!formData.defaultBaseAmount) newErrors.defaultBaseAmount = "Default base amount required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log("Submitted Quick Entry:", formData);
      alert("Quick Entry updated successfully!");
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
          Update Quick Entry
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Name"
            name="name"
            size="small"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            error={!!errors.name}
            helperText={errors.name || " "}
          />

          <TextField
            label="Description"
            name="description"
            size="small"
            fullWidth
            value={formData.description}
            onChange={handleInputChange}
            error={!!errors.description}
            helperText={errors.description || " "}
          />

          <TextField
            label="Usage"
            name="usage"
            size="small"
            fullWidth
            value={formData.usage}
            onChange={handleInputChange}
            error={!!errors.usage}
            helperText={errors.usage || " "}
          />

          <FormControl size="small" fullWidth error={!!errors.entryType}>
            <InputLabel>Entry Type</InputLabel>
            <Select
              name="entryType"
              value={formData.entryType}
              onChange={handleSelectChange}
              label="Entry Type"
            >
              <MenuItem value="BankDeposit">Bank Deposit</MenuItem>
              <MenuItem value="Credit">Credit</MenuItem>
            </Select>
            <FormHelperText>{errors.entryType || " "}</FormHelperText>
          </FormControl>

          <TextField
            label="Base Amount Description"
            name="baseAmountDescription"
            size="small"
            fullWidth
            value={formData.baseAmountDescription}
            onChange={handleInputChange}
            error={!!errors.baseAmountDescription}
            helperText={errors.baseAmountDescription || " "}
          />

          <TextField
            label="Default Base Amount"
            name="defaultBaseAmount"
            size="small"
            type="number"
            fullWidth
            value={formData.defaultBaseAmount}
            onChange={handleInputChange}
            error={!!errors.defaultBaseAmount}
            helperText={errors.defaultBaseAmount || " "}
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
