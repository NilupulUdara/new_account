import React, { useState, useEffect } from "react";
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
  Divider,
  Checkbox,
  FormControlLabel,
  Grid,
} from "@mui/material";
import theme from "../../../../../theme";

interface ItemGeneralSettingProps {
  itemId: string | number; // ✅ always required now
}

export default function ItemsGeneralSettingsForm({ itemId }: ItemGeneralSettingProps) {
  const [formData, setFormData] = useState({
    itemCode: "",
    itemName: "",
    description: "",
    category: "",
    itemTaxType: "",
    itemType: "",
    unitOfMeasure: "",
    editableDescription: false,
    excludedFromSales: false,
    excludedFromPurchases: false,
    salesAccount: "",
    inventoryAccount: "",
    cogsAccount: "",
    inventoryAdjustmentAccount: "",
    imageFile: null as File | null,
    itemStatus: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 🔹 preload existing item
  useEffect(() => {
    if (itemId) {
      // TODO: replace with API call getItem(itemId)
      console.log("Fetching item data for:", itemId);
      setFormData({
        ...formData,
        itemCode: "ITM-001",
        itemName: "Sample Item",
        description: "Demo item for editing",
        category: "Category 1",
        itemTaxType: "Standard",
        itemType: "Stock",
        unitOfMeasure: "PCS",
        salesAccount: "SA-001",
        inventoryAccount: "INV-001",
        cogsAccount: "COGS-001",
        inventoryAdjustmentAccount: "INVADJ-001",
        itemStatus: "Active",
        editableDescription: true,
        excludedFromSales: false,
        excludedFromPurchases: false,
        imageFile: null,
      });
    }
    // eslint-disable-next-line
  }, [itemId]);

  const handleChange = (field: string, value: string | boolean | File | null) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const validate = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!formData.itemCode) tempErrors.itemCode = "Item Code is required";
    if (!formData.itemName) tempErrors.itemName = "Item Name is required";
    if (!formData.description) tempErrors.description = "Description is required";
    if (!formData.category) tempErrors.category = "Category is required";
    if (!formData.itemTaxType) tempErrors.itemTaxType = "Item Tax Type is required";
    if (!formData.itemType) tempErrors.itemType = "Item Type is required";
    if (!formData.unitOfMeasure) tempErrors.unitOfMeasure = "Unit of Measure is required";
    if (!formData.salesAccount) tempErrors.salesAccount = "Sales Account is required";
    if (!formData.inventoryAccount) tempErrors.inventoryAccount = "Inventory Account is required";
    if (!formData.cogsAccount) tempErrors.cogsAccount = "C.O.G.S. Account is required";
    if (!formData.inventoryAdjustmentAccount)
      tempErrors.inventoryAdjustmentAccount = "Inventory Adjustment Account is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleUpdate = () => {
    if (validate()) {
      console.log("Updated Item:", formData);
      alert("Item updated successfully!");
    }
  };

  const handleClone = () => {
    const cloned = { ...formData, itemCode: formData.itemCode + "-CLONE" };
    console.log("Cloned Item:", cloned);
    alert("Item cloned! Please edit before saving.");
    setFormData(cloned);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      console.log("Deleted Item with ID:", itemId);
      alert("Item deleted successfully!");
      // reset form
      setFormData({
        itemCode: "",
        itemName: "",
        description: "",
        category: "",
        itemTaxType: "",
        itemType: "",
        unitOfMeasure: "",
        editableDescription: false,
        excludedFromSales: false,
        excludedFromPurchases: false,
        salesAccount: "",
        inventoryAccount: "",
        cogsAccount: "",
        inventoryAdjustmentAccount: "",
        imageFile: null,
        itemStatus: "",
      });
    }
  };

  return (
    <Stack alignItems="center" sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px",
          p: theme.spacing(3),
          boxShadow: theme.shadows[2],
          borderRadius: theme.shape.borderRadius,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Typography variant="h5" sx={{ mb: theme.spacing(3), textAlign: "center" }}>
          Update Item
        </Typography>

        <Grid container spacing={4}>
                  {/* General Settings */}
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <Typography variant="subtitle1">General</Typography>
                      <Divider />
                      <TextField
                        label="Item Code"
                        value={formData.itemCode}
                        onChange={(e) => handleChange("itemCode", e.target.value)}
                        size="small"
                        fullWidth
                        error={!!errors.itemCode}
                        helperText={errors.itemCode}
                      />
                      <TextField
                        label="Name"
                        value={formData.itemName}
                        onChange={(e) => handleChange("itemName", e.target.value)}
                        size="small"
                        fullWidth
                        error={!!errors.itemName}
                        helperText={errors.itemName}
                      />
                      <TextField
                        label="Description"
                        value={formData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        size="small"
                        fullWidth
                        error={!!errors.description}
                        helperText={errors.description}
                      />
                      <FormControl size="small" fullWidth error={!!errors.category}>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={formData.category}
                          onChange={(e) => handleChange("category", e.target.value)}
                        >
                          <MenuItem value="Category 1">Category 1</MenuItem>
                          <MenuItem value="Category 2">Category 2</MenuItem>
                        </Select>
                        <FormHelperText>{errors.category}</FormHelperText>
                      </FormControl>
                      <FormControl size="small" fullWidth error={!!errors.itemTaxType}>
                        <InputLabel>Item Tax Type</InputLabel>
                        <Select
                          value={formData.itemTaxType}
                          onChange={(e) => handleChange("itemTaxType", e.target.value)}
                        >
                          <MenuItem value="Standard">Standard</MenuItem>
                          <MenuItem value="Exempt">Exempt</MenuItem>
                        </Select>
                        <FormHelperText>{errors.itemTaxType}</FormHelperText>
                      </FormControl>
                      <FormControl size="small" fullWidth error={!!errors.itemType}>
                        <InputLabel>Item Type</InputLabel>
                        <Select
                          value={formData.itemType}
                          onChange={(e) => handleChange("itemType", e.target.value)}
                        >
                          <MenuItem value="Stock">Stock</MenuItem>
                          <MenuItem value="Non-Stock">Non-Stock</MenuItem>
                        </Select>
                        <FormHelperText>{errors.itemType}</FormHelperText>
                      </FormControl>
                      <FormControl size="small" fullWidth error={!!errors.unitOfMeasure}>
                        <InputLabel>Unit of Measure</InputLabel>
                        <Select
                          value={formData.unitOfMeasure}
                          onChange={(e) => handleChange("unitOfMeasure", e.target.value)}
                        >
                          <MenuItem value="PCS">PCS</MenuItem>
                          <MenuItem value="KG">KG</MenuItem>
                        </Select>
                        <FormHelperText>{errors.unitOfMeasure}</FormHelperText>
                      </FormControl>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.editableDescription}
                            onChange={(e) => handleChange("editableDescription", e.target.checked)}
                          />
                        }
                        label="Editable Description"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.excludedFromSales}
                            onChange={(e) => handleChange("excludedFromSales", e.target.checked)}
                          />
                        }
                        label="Excluded from Sales"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.excludedFromPurchases}
                            onChange={(e) => handleChange("excludedFromPurchases", e.target.checked)}
                          />
                        }
                        label="Excluded from Purchases"
                      />
                    </Stack>
                  </Grid>
        
                  {/* GL Accounts */}
                  <Grid item xs={12} md={6}>
                    <Stack spacing={4}>
                      <Stack spacing={2}>
                        <Typography variant="subtitle1">GL Account</Typography>
                        <Divider />
                        <FormControl size="small" fullWidth error={!!errors.salesAccount}>
                          <InputLabel>Sales Account</InputLabel>
                          <Select
                            value={formData.salesAccount}
                            onChange={(e) => handleChange("salesAccount", e.target.value)}
                          >
                            <MenuItem value="SA-001">SA-001</MenuItem>
                            <MenuItem value="SA-002">SA-002</MenuItem>
                          </Select>
                          <FormHelperText>{errors.salesAccount}</FormHelperText>
                        </FormControl>
                        <FormControl size="small" fullWidth error={!!errors.inventoryAccount}>
                          <InputLabel>Inventory Account</InputLabel>
                          <Select
                            value={formData.inventoryAccount}
                            onChange={(e) => handleChange("inventoryAccount", e.target.value)}
                          >
                            <MenuItem value="INV-001">INV-001</MenuItem>
                            <MenuItem value="INV-002">INV-002</MenuItem>
                          </Select>
                          <FormHelperText>{errors.inventoryAccount}</FormHelperText>
                        </FormControl>
                        <FormControl size="small" fullWidth error={!!errors.cogsAccount}>
                          <InputLabel>C.O.G.S. Account</InputLabel>
                          <Select
                            value={formData.cogsAccount}
                            onChange={(e) => handleChange("cogsAccount", e.target.value)}
                          >
                            <MenuItem value="COGS-001">COGS-001</MenuItem>
                            <MenuItem value="COGS-002">COGS-002</MenuItem>
                          </Select>
                          <FormHelperText>{errors.cogsAccount}</FormHelperText>
                        </FormControl>
                        <FormControl size="small" fullWidth error={!!errors.inventoryAdjustmentAccount}>
                          <InputLabel>Inventory Adjustment Account</InputLabel>
                          <Select
                            value={formData.inventoryAdjustmentAccount}
                            onChange={(e) => handleChange("inventoryAdjustmentAccount", e.target.value)}
                          >
                            <MenuItem value="INVADJ-001">INVADJ-001</MenuItem>
                            <MenuItem value="INVADJ-002">INVADJ-002</MenuItem>
                          </Select>
                          <FormHelperText>{errors.inventoryAdjustmentAccount}</FormHelperText>
                        </FormControl>
                      </Stack>
        
        
                      {/* Other */}
        
                      <Stack spacing={2}>
                        <Typography variant="subtitle1">Other</Typography>
                        <Divider />
                        <Button
                          variant="outlined"
                          component="label"
                        >
                          Upload Image (.jpg)
                          <input
                            type="file"
                            hidden
                            accept=".jpg"
                            onChange={(e) => handleChange("imageFile", e.target.files ? e.target.files[0] : null)}
                          />
                        </Button>
                        <FormControl size="small" fullWidth>
                          <InputLabel>Item Status</InputLabel>
                          <Select
                            value={formData.itemStatus}
                            onChange={(e) => handleChange("itemStatus", e.target.value)}
                          >
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                          </Select>
                        </FormControl>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: theme.spacing(4),
            flexDirection: { xs: "column", sm: "row" },
            gap: theme.spacing(2),
          }}
        >
          <Button variant="outlined" fullWidth onClick={() => window.history.back()}>
            Back
          </Button>
          <Button variant="contained" color="primary" onClick={handleUpdate}>
            Update Item
          </Button>
          <Button variant="contained" color="secondary" onClick={handleClone}>
            Clone Item
          </Button>
          <Button variant="outlined" color="error" onClick={handleDelete}>
            Delete Item
          </Button>
        </Box>
      </Box>
    </Stack>
  );
}
