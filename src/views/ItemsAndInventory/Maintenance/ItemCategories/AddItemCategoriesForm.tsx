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
  Checkbox,
  FormControlLabel,
  Button,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import theme from "../../../../theme";

interface ItemCategoriesFormData {
  categoryName: string;
  itemTaxType: string;
  itemType: string;
  unitOfMeasure: string;
  excludeFromSales: boolean;
  excludeFromPurchases: boolean;
  salesAccount: string;
  inventoryAccount: string;
  cogsAccount: string;
  inventoryAdjustmentAccount: string;
  itemAssemblyCostAccount: string;
}

export default function AddItemCategoriesForm() {
  const [formData, setFormData] = useState<ItemCategoriesFormData>({
    categoryName: "",
    itemTaxType: "",
    itemType: "",
    unitOfMeasure: "",
    excludeFromSales: false,
    excludeFromPurchases: false,
    salesAccount: "",
    inventoryAccount: "",
    cogsAccount: "",
    inventoryAdjustmentAccount: "",
    itemAssemblyCostAccount: "",
  });

  const [errors, setErrors] = useState<Partial<ItemCategoriesFormData>>({});
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
    const newErrors: Partial<ItemCategoriesFormData> = {};
    if (!formData.categoryName) newErrors.categoryName = "Category Name is required";
    if (!formData.itemTaxType) newErrors.itemTaxType = "Select Item Tax Type";
    if (!formData.itemType) newErrors.itemType = "Select Item Type";
    if (!formData.unitOfMeasure) newErrors.unitOfMeasure = "Select Unit of Measure";
    if (!formData.salesAccount) newErrors.salesAccount = "Select Sales Account";
    if (!formData.inventoryAccount) newErrors.inventoryAccount = "Select Inventory Account";
    if (!formData.cogsAccount) newErrors.cogsAccount = "Select C.O.G.S. Account";
    if (!formData.inventoryAdjustmentAccount) newErrors.inventoryAdjustmentAccount = "Select Inventory Adjustment Account";
    if (!formData.itemAssemblyCostAccount) newErrors.itemAssemblyCostAccount = "Select Item Assembly Cost Account";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log("Submitted Data:", formData);
      alert("Item Category added successfully!");
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
          Add Item Category
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Category Name"
            name="categoryName"
            size="small"
            fullWidth
            value={formData.categoryName}
            onChange={handleInputChange}
            error={!!errors.categoryName}
            helperText={errors.categoryName || " "}
          />

          <Typography variant="subtitle1" sx={{ mt: 2 }}>Default Values for New Items</Typography>

          <FormControl size="small" fullWidth error={!!errors.itemTaxType}>
            <InputLabel>Item Tax Type</InputLabel>
            <Select name="itemTaxType" value={formData.itemTaxType} onChange={handleSelectChange} label="Item Tax Type">
              <MenuItem value="Taxable">Taxable</MenuItem>
              <MenuItem value="Non-Taxable">Non-Taxable</MenuItem>
            </Select>
            <FormHelperText>{errors.itemTaxType || " "}</FormHelperText>
          </FormControl>

          <FormControl size="small" fullWidth error={!!errors.itemType}>
            <InputLabel>Item Type</InputLabel>
            <Select name="itemType" value={formData.itemType} onChange={handleSelectChange} label="Item Type">
              <MenuItem value="Inventory">Inventory</MenuItem>
              <MenuItem value="Non-Inventory">Non-Inventory</MenuItem>
            </Select>
            <FormHelperText>{errors.itemType || " "}</FormHelperText>
          </FormControl>

          <FormControl size="small" fullWidth error={!!errors.unitOfMeasure}>
            <InputLabel>Unit of Measure</InputLabel>
            <Select name="unitOfMeasure" value={formData.unitOfMeasure} onChange={handleSelectChange} label="Unit of Measure">
              <MenuItem value="kg">kg</MenuItem>
              <MenuItem value="pcs">pcs</MenuItem>
              <MenuItem value="ltr">ltr</MenuItem>
            </Select>
            <FormHelperText>{errors.unitOfMeasure || " "}</FormHelperText>
          </FormControl>

          <FormControlLabel
            control={<Checkbox checked={formData.excludeFromSales} onChange={handleCheckboxChange} name="excludeFromSales" />}
            label="Exclude from Sales"
          />

          <FormControlLabel
            control={<Checkbox checked={formData.excludeFromPurchases} onChange={handleCheckboxChange} name="excludeFromPurchases" />}
            label="Exclude from Purchases"
          />

          <FormControl size="small" fullWidth error={!!errors.salesAccount}>
            <InputLabel>Sales Account</InputLabel>
            <Select name="salesAccount" value={formData.salesAccount} onChange={handleSelectChange} label="Sales Account">
              <MenuItem value="SA001">SA001</MenuItem>
              <MenuItem value="SA002">SA002</MenuItem>
            </Select>
            <FormHelperText>{errors.salesAccount || " "}</FormHelperText>
          </FormControl>

          <FormControl size="small" fullWidth error={!!errors.inventoryAccount}>
            <InputLabel>Inventory Account</InputLabel>
            <Select name="inventoryAccount" value={formData.inventoryAccount} onChange={handleSelectChange} label="Inventory Account">
              <MenuItem value="IA001">IA001</MenuItem>
              <MenuItem value="IA002">IA002</MenuItem>
            </Select>
            <FormHelperText>{errors.inventoryAccount || " "}</FormHelperText>
          </FormControl>

          <FormControl size="small" fullWidth error={!!errors.cogsAccount}>
            <InputLabel>C.O.G.S. Account</InputLabel>
            <Select name="cogsAccount" value={formData.cogsAccount} onChange={handleSelectChange} label="C.O.G.S. Account">
              <MenuItem value="C001">C001</MenuItem>
              <MenuItem value="C002">C002</MenuItem>
            </Select>
            <FormHelperText>{errors.cogsAccount || " "}</FormHelperText>
          </FormControl>

          <FormControl size="small" fullWidth error={!!errors.inventoryAdjustmentAccount}>
            <InputLabel>Inventory Adjustment Account</InputLabel>
            <Select name="inventoryAdjustmentAccount" value={formData.inventoryAdjustmentAccount} onChange={handleSelectChange} label="Inventory Adjustment Account">
              <MenuItem value="IA001">IA001</MenuItem>
              <MenuItem value="IA002">IA002</MenuItem>
            </Select>
            <FormHelperText>{errors.inventoryAdjustmentAccount || " "}</FormHelperText>
          </FormControl>

          <FormControl size="small" fullWidth error={!!errors.itemAssemblyCostAccount}>
            <InputLabel>Item Assembly Cost Account</InputLabel>
            <Select name="itemAssemblyCostAccount" value={formData.itemAssemblyCostAccount} onChange={handleSelectChange} label="Item Assembly Cost Account">
              <MenuItem value="AC001">AC001</MenuItem>
              <MenuItem value="AC002">AC002</MenuItem>
            </Select>
            <FormHelperText>{errors.itemAssemblyCostAccount || " "}</FormHelperText>
          </FormControl>
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
            Add Item Category
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
