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
  Button,
  Paper,
  FormHelperText,
  SelectChangeEvent,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import theme from "../../../../../theme";

interface PurchasingPricingFormData {
  supplier: string;
  price: string;
  supplierUOM: string;
  conversionFactor: string;
  supplierCode: string;
}

export default function UpdatePurchasingPricingForm() {
  const [formData, setFormData] = useState<PurchasingPricingFormData>({
    supplier: "",
    price: "",
    supplierUOM: "",
    conversionFactor: "",
    supplierCode: "",
  });

  const [errors, setErrors] = useState<Partial<PurchasingPricingFormData>>({});
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors: Partial<PurchasingPricingFormData> = {};
    if (!formData.supplier) newErrors.supplier = "Supplier is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (!formData.supplierUOM) newErrors.supplierUOM = "Supplier UOM is required";
    if (!formData.conversionFactor) newErrors.conversionFactor = "Conversion factor is required";
    if (!formData.supplierCode) newErrors.supplierCode = "Supplier code/description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log("Purchasing Pricing Submitted:", formData);
      alert("Purchasing Pricing updated successfully!");
      setFormData({
        supplier: "",
        price: "",
        supplierUOM: "",
        conversionFactor: "",
        supplierCode: "",
      });
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper
        sx={{
          p: theme.spacing(3),
          maxWidth: "500px",
          width: "100%",
          boxShadow: 2,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>
          Update Purchasing Pricing
        </Typography>

        <Stack spacing={2}>
          {/* Supplier Dropdown */}
          <FormControl size="small" fullWidth error={!!errors.supplier}>
            <InputLabel>Supplier</InputLabel>
            <Select
              name="supplier"
              value={formData.supplier}
              onChange={handleSelectChange}
              label="Supplier"
            >
              <MenuItem value="ABC Traders">ABC Traders</MenuItem>
              <MenuItem value="XYZ Supplies">XYZ Supplies</MenuItem>
              <MenuItem value="Global Imports">Global Imports</MenuItem>
            </Select>
            <FormHelperText>{errors.supplier}</FormHelperText>
          </FormControl>

          {/* Price */}
          <TextField
            label="Price"
            name="price"
            size="small"
            fullWidth
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            error={!!errors.price}
            helperText={errors.price}
          />

          {/* Supplier UOM */}
          <TextField
            label="Supplier Units of Measure"
            name="supplierUOM"
            size="small"
            fullWidth
            value={formData.supplierUOM}
            onChange={handleInputChange}
            error={!!errors.supplierUOM}
            helperText={errors.supplierUOM}
          />

          {/* Conversion Factor */}
          <TextField
            label="Conversion Factor (to our UOM)"
            name="conversionFactor"
            size="small"
            fullWidth
            type="number"
            value={formData.conversionFactor}
            onChange={handleInputChange}
            error={!!errors.conversionFactor}
            helperText={errors.conversionFactor}
          />

          {/* Supplier Code / Description */}
          <TextField
            label="Supplier's Code or Description"
            name="supplierCode"
            size="small"
            fullWidth
            value={formData.supplierCode}
            onChange={handleInputChange}
            error={!!errors.supplierCode}
            helperText={errors.supplierCode}
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
          <Button onClick={() => navigate("/itemsandinventory/maintenance/items/purchasing-pricing")}>
            Back
          </Button>

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
