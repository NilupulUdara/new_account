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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import theme from "../../../../theme";

interface SalesKitFormData {
  kitCode: string;
  component: string;
  description: string;
  category: string;
  quantity: string;
}

export default function AddSalesKitsForm() {
  const [formData, setFormData] = useState<SalesKitFormData>({
    kitCode: "",
    component: "",
    description: "",
    category: "",
    quantity: "",
  });

  const [errors, setErrors] = useState<Partial<SalesKitFormData>>({});

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
    const newErrors: Partial<SalesKitFormData> = {};
    if (!formData.kitCode) newErrors.kitCode = "Kit Code is required";
    if (!formData.component) newErrors.component = "Component is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.quantity) newErrors.quantity = "Quantity is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log("Sales Kit Submitted:", formData);
      alert("Sales Kit added successfully!");
      setFormData({
        kitCode: "",
        component: "",
        description: "",
        category: "",
        quantity: "",
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
          Add Sales Kit
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Alias / Kit Code"
            name="kitCode"
            size="small"
            fullWidth
            value={formData.kitCode}
            onChange={handleInputChange}
            error={!!errors.kitCode}
            helperText={errors.kitCode || " "}
          />

          <TextField
            label="Component"
            name="component"
            size="small"
            fullWidth
            value={formData.component}
            onChange={handleInputChange}
            error={!!errors.component}
            helperText={errors.component || " "}
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

          <FormControl size="small" fullWidth error={!!errors.category}>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleSelectChange}
              label="Category"
            >
              <MenuItem value="Electronics">Electronics</MenuItem>
              <MenuItem value="Clothing">Clothing</MenuItem>
              <MenuItem value="Food">Food</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
            <FormHelperText>{errors.category || " "}</FormHelperText>
          </FormControl>

          <TextField
            label="Quantity (Kits)"
            name="quantity"
            size="small"
            fullWidth
            type="number"
            value={formData.quantity}
            onChange={handleInputChange}
            error={!!errors.quantity}
            helperText={errors.quantity || " "}
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
