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
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

interface UpdatePosData {
  posName: string;
  allowCreditSale: boolean;
  allowCashSale: boolean;
  defaultCashAccount: string;
  posLocation: string;
}

export default function UpdatePosForm() {
  const [formData, setFormData] = useState<UpdatePosData>({
    posName: "",
    allowCreditSale: false,
    allowCashSale: false,
    defaultCashAccount: "",
    posLocation: "",
  });

  const [errors, setErrors] = useState<Partial<UpdatePosData>>({});
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleSelectChange = (
    e: React.ChangeEvent<{ value: unknown; name?: string }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({ ...formData, [name]: value as string });
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors: Partial<UpdatePosData> = {};
    if (!formData.posName.trim()) newErrors.posName = "POS Name is required";
    if (!formData.defaultCashAccount.trim())
      newErrors.defaultCashAccount = "Default Cash Account is required";
    if (!formData.posLocation.trim())
      newErrors.posLocation = "POS Location is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log("POS updated:", formData);
      alert("POS updated successfully!");
      // API call goes here
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
          Update POS
        </Typography>

        <Stack spacing={2}>
          {/* POS Name */}
          <TextField
            label="Point of Sale Name"
            name="posName"
            size="small"
            fullWidth
            value={formData.posName}
            onChange={handleInputChange}
            error={!!errors.posName}
            helperText={errors.posName}
          />

          {/* Allowed Credit Sale */}
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.allowCreditSale}
                onChange={handleCheckboxChange}
                name="allowCreditSale"
              />
            }
            label="Allowed Credit Sale Terms"
          />

          {/* Allowed Cash Sale */}
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.allowCashSale}
                onChange={handleCheckboxChange}
                name="allowCashSale"
              />
            }
            label="Allowed Cash Sale Terms"
          />

          {/* Default Cash Account */}
          <FormControl fullWidth size="small" error={!!errors.defaultCashAccount}>
            <InputLabel>Default Cash Account</InputLabel>
            <Select
              name="defaultCashAccount"
              value={formData.defaultCashAccount}
            //   onChange={handleSelectChange}
              label="Default Cash Account"
            >
              <MenuItem value="Account1">Account 1</MenuItem>
              <MenuItem value="Account2">Account 2</MenuItem>
              <MenuItem value="Account3">Account 3</MenuItem>
            </Select>
            <Typography variant="caption" color="error">
              {errors.defaultCashAccount}
            </Typography>
          </FormControl>

          {/* POS Location */}
          <FormControl fullWidth size="small" error={!!errors.posLocation}>
            <InputLabel>POS Location</InputLabel>
            <Select
              name="posLocation"
              value={formData.posLocation}
            //   onChange={handleSelectChange}
              label="POS Location"
            >
              <MenuItem value="Location1">Location 1</MenuItem>
              <MenuItem value="Location2">Location 2</MenuItem>
              <MenuItem value="Location3">Location 3</MenuItem>
            </Select>
            <Typography variant="caption" color="error">
              {errors.posLocation}
            </Typography>
          </FormControl>
        </Stack>

        {/* Actions */}
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
