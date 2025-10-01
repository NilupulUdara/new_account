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
  kitName: string; // selected sales kit
  kitCode: string;
  componentName: string; // dropdown
  componentCode: string; // shows code automatically
  description: string;
  category: string;
  quantity: string;
}

// Mock existing sales kits for dropdown
const mockSalesKits = [
  { name: "Starter Kit", code: "KIT001" },
  { name: "Pro Kit", code: "KIT002" },
  { name: "Advanced Kit", code: "KIT003" },
];

// Mock items for Component dropdown
const mockItems = [
  { name: "Laptop", code: "ITM001" },
  { name: "Toy Car", code: "ITM002" },
  { name: "Notebook", code: "ITM003" },
  { name: "Shirt", code: "ITM004" },
  { name: "Food Pack", code: "ITM005" },
];

export default function AddSalesKitsForm() {
  const [formData, setFormData] = useState<SalesKitFormData>({
    kitName: "",
    kitCode: "",
    componentName: "",
    componentCode: "",
    description: "",
    category: "",
    quantity: "",
  });

  const [errors, setErrors] = useState<Partial<SalesKitFormData>>({});

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  // Handle selecting existing sales kit
  const handleKitChange = (e: any) => {
    const selectedName = e.target.value;
    const selectedKit = mockSalesKits.find((kit) => kit.name === selectedName);
    setFormData({
      ...formData,
      kitName: selectedName,
      kitCode: selectedKit ? selectedKit.code : "",
    });
    setErrors({ ...errors, kitName: "" });
  };

  const handleComponentChange = (e: any) => {
    const selectedName = e.target.value;
    const selectedItem = mockItems.find((item) => item.name === selectedName);
    setFormData({
      ...formData,
      componentName: selectedName,
      componentCode: selectedItem ? selectedItem.code : "",
    });
    setErrors({ ...errors, componentName: "" });
  };

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
    if (!formData.kitName) newErrors.kitName = "Sales Kit is required";
    if (!formData.kitCode) newErrors.kitCode = "Kit Code is required";
    if (!formData.componentName) newErrors.componentName = "Component is required";
    if (!formData.componentCode) newErrors.componentCode = "Component code is required";
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
        kitName: "",
        kitCode: "",
        componentName: "",
        componentCode: "",
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
          Add / Edit Sales Kit
        </Typography>

        <Stack spacing={2}>
          {/* Sales Kit Dropdown */}
          <FormControl size="small" fullWidth error={!!errors.kitName}>
            <InputLabel>Select Sales Kit</InputLabel>
            <Select
              name="kitName"
              value={formData.kitName}
              onChange={handleKitChange}
              label="Select Sales Kit"
            >
              {mockSalesKits.map((kit) => (
                <MenuItem key={kit.code} value={kit.name}>
                  {kit.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.kitName || " "}</FormHelperText>
          </FormControl>

          <TextField
            label="Kit Code"
            name="kitCode"
            size="small"
            fullWidth
            value={formData.kitCode}
            InputProps={{ readOnly: true }}
            error={!!errors.kitCode}
            helperText={errors.kitCode || " "}
          />

          {/* Component dropdown + code in one row */}
          <Stack direction={isMobile ? "column" : "row"} spacing={2}>
            <FormControl size="small" fullWidth error={!!errors.componentName}>
              <InputLabel>Component Name</InputLabel>
              <Select
                name="componentName"
                value={formData.componentName}
                onChange={handleComponentChange}
                label="Component Name"
              >
                {mockItems.map((item) => (
                  <MenuItem key={item.code} value={item.name}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.componentName || " "}</FormHelperText>
            </FormControl>

            <TextField
              label="Component Code"
              name="componentCode"
              size="small"
              fullWidth
              value={formData.componentCode}
              InputProps={{ readOnly: true }}
              error={!!errors.componentCode}
              helperText={errors.componentCode || " "}
            />
          </Stack>

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
            Add
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
