import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getItems } from "../../../../api/Item/ItemApi";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getItemCategories } from "../../../../api/ItemCategories/ItemCategoriesApi";
import { useLocation, useNavigate } from "react-router-dom";
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
  ListSubheader,
} from "@mui/material";
import theme from "../../../../theme";

interface BillsOfMaterialFormData {
  componentCode: string;
  componentName: string;
  location: string;
  workCentre: string;
  quantity: string;
}

export default function UpdateBillsOfMaterialForm() {
  const [formData, setFormData] = useState<BillsOfMaterialFormData>({
    componentCode: "",
    componentName: "",
    location: "",
    workCentre: "",
    quantity: "",
  });

  const [errors, setErrors] = useState<Partial<BillsOfMaterialFormData>>({});

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const location = useLocation();
  const navigate = useNavigate();

  // Get the itemCode from location.state
  const itemCode = (location.state as any)?.itemCode;

  // Fetch items for component selection
  const { data: items = [] } = useQuery({
    queryKey: ["items"],
    queryFn: getItems,
  });

  // Fetch inventory locations
  const { data: inventoryLocations = [] } = useQuery({
    queryKey: ["inventoryLocations"],
    queryFn: getInventoryLocations,
  });

  // Fetch categories using React Query
  const { data: categories = [] } = useQuery<{ category_id: number; description: string }[]>({
    queryKey: ["itemCategories"],
    queryFn: () => getItemCategories() as Promise<{ category_id: number; description: string }[]>,
  });

  // Allow stock_id to be passed via location.state or query param
  const stateStockId = (location.state as any)?.stock_id;
  const queryStockId = new URLSearchParams(location.search).get("stock_id");
  const [assignedStockId, setAssignedStockId] = useState<string | null>(stateStockId ?? queryStockId ?? null);

  // Pre-populate form with existing data
  useEffect(() => {
    if (itemCode) {
      setFormData({
        componentCode: itemCode.stock_id ?? itemCode.item_id ?? "",
        componentName: itemCode.description ?? "",
        location: itemCode.location ?? "",
        workCentre: itemCode.work_centre ?? "",
        quantity: itemCode.quantity ?? "",
      });
    }
  }, [itemCode]);

  // Update component code and name when component is selected
  useEffect(() => {
    if (formData.componentCode && items && items.length > 0) {
      const selectedComponent = items.find((item: any) => String(item.stock_id ?? item.id) === String(formData.componentCode));
      if (selectedComponent) {
        setFormData(prev => ({
          ...prev,
          componentCode: String(selectedComponent.stock_id ?? selectedComponent.id ?? formData.componentCode),
          componentName: selectedComponent.item_name ?? selectedComponent.name ?? selectedComponent.description ?? ""
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        componentCode: "",
        componentName: ""
      }));
    }
  }, [formData.componentCode, items]);

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
    const newErrors: Partial<BillsOfMaterialFormData> = {};
    if (!formData.componentCode) newErrors.componentCode = "Component is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.workCentre) newErrors.workCentre = "Work Centre is required";
    if (!formData.quantity) newErrors.quantity = "Quantity is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      // Build payload for updating bills of material
      const payload = {
        id: itemCode?.id, // Assuming itemCode has an id for update
        component_code: formData.componentCode,
        component_name: formData.componentName,
        stock_id: assignedStockId,
        location: formData.location,
        work_centre: formData.workCentre,
        quantity: formData.quantity,
      };

      try {
        // TODO: Implement API call for updating bills of material
        console.log("Update Bills of Material payload:", payload);
        alert("Bills of Material updated successfully!");
        // go back to table
        navigate(-1);
      } catch (err: any) {
        console.error("Failed to update bills of material:", err);
        alert("Failed to update bills of material");
      }
    }
  };

  // Dummy data for work centres (can be replaced with API later)
  const workCentres = [
    { id: 1, name: "Assembly Line 1" },
    { id: 2, name: "Assembly Line 2" },
    { id: 3, name: "Packaging Station" },
    { id: 4, name: "Quality Check" },
  ];

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
          Update Bills of Material
        </Typography>

        <Stack spacing={2}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <FormControl size="small" sx={{ flex: 1 }} error={!!errors.componentCode}>
              <InputLabel>Component Name</InputLabel>
              <Select
                name="componentCode"
                value={formData.componentCode}
                onChange={handleSelectChange}
                label="Component Name"
              >
                <MenuItem value="">
                  <em>Select Component</em>
                </MenuItem>
                {items && items.length > 0 ? (
                  (() => {
                    return Object.entries(
                      items.reduce((groups: Record<string, any[]>, item) => {
                        const catId = item.category_id || "Uncategorized";
                        if (!groups[catId]) groups[catId] = [];
                        groups[catId].push(item);
                        return groups;
                      }, {} as Record<string, any[]>)
                    ).map(([categoryId, groupedItems]: [string, any[]]) => {
                      const category = categories.find(cat => cat.category_id === Number(categoryId));
                      const categoryLabel = category ? category.description : `Category ${categoryId}`;
                      return [
                        <ListSubheader key={`cat-${categoryId}`}>
                          {categoryLabel}
                        </ListSubheader>,
                        groupedItems.map((item) => {
                          const stockId = item.stock_id ?? item.id ?? item.stock_master_id ?? item.item_id ?? 0;
                          const key = stockId;
                          const label = item.item_name ?? item.name ?? item.description ?? String(stockId);
                          const value = String(stockId);
                          return (
                            <MenuItem key={String(key)} value={value}>
                              {label}
                            </MenuItem>
                          );
                        })
                      ];
                    });
                  })()
                ) : (
                  <MenuItem disabled value="">
                    No components available
                  </MenuItem>
                )}
              </Select>
              <FormHelperText>{errors.componentCode || " "}</FormHelperText>
            </FormControl>

            <TextField
              label="Component Code"
              value={formData.componentCode}
              size="small"
              sx={{ flex: 1 }}
              InputProps={{
                readOnly: true,
              }}
            />
          </Box>

          <FormControl size="small" fullWidth error={!!errors.location}>
            <InputLabel>Location to Draw From</InputLabel>
            <Select
              name="location"
              value={formData.location}
              onChange={handleSelectChange}
              label="Location to Draw From"
            >
              <MenuItem value="">
                <em>Select Location</em>
              </MenuItem>
              {inventoryLocations && inventoryLocations.length > 0 ? (
                inventoryLocations.map((loc: any) => (
                  <MenuItem key={loc.location_id ?? loc.id} value={String(loc.location_id ?? loc.id)}>
                    {loc.location_name ?? loc.name ?? loc.description ?? String(loc.location_id ?? loc.id)}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  No locations available
                </MenuItem>
              )}
            </Select>
            <FormHelperText>{errors.location || " "}</FormHelperText>
          </FormControl>

          <FormControl size="small" fullWidth error={!!errors.workCentre}>
            <InputLabel>Work Centre Added</InputLabel>
            <Select
              name="workCentre"
              value={formData.workCentre}
              onChange={handleSelectChange}
              label="Work Centre Added"
            >
              {workCentres.map((wc) => (
                <MenuItem key={wc.id} value={String(wc.id)}>
                  {wc.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.workCentre || " "}</FormHelperText>
          </FormControl>

          <TextField
            label="Quantity"
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
            Update Bills of Material
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
