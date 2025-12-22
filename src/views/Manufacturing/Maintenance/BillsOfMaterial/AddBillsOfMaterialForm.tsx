import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getItems } from "../../../../api/Item/ItemApi";
import { getInventoryLocations } from "../../../../api/InventoryLocation/InventoryLocationApi";
import { getItemCategories } from "../../../../api/ItemCategories/ItemCategoriesApi";
import { getWorkCentres } from "../../../../api/WorkCentre/WorkCentreApi";
import { createBom, getBoms } from "../../../../api/Bom/BomApi";
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
import AddedConfirmationModal from "../../../../components/AddedConfirmationModal";
import ErrorModal from "../../../../components/ErrorModal";
interface BillsOfMaterialFormData {
  componentCode: string;
  componentName: string;
  location: string;
  workCentre: string;
  quantity: string;
}

export default function AddBillsOfMaterialForm() {
  const [formData, setFormData] = useState<BillsOfMaterialFormData>({
    componentCode: "",
    componentName: "",
    location: "",
    workCentre: "",
    quantity: "1",
  });

  const [errors, setErrors] = useState<Partial<BillsOfMaterialFormData>>({});
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    if (!formData.quantity) {
      newErrors.quantity = "Quantity is required";
    } else if (isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      newErrors.quantity = "Quantity must be a number greater than zero";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      // Check for duplicate BOM
      const selectedLoc = (inventoryLocations || []).find(
        (l: any) => String(l.location_id ?? l.id) === String(formData.location)
      );
      const locCode =
        selectedLoc?.loc_code ?? selectedLoc?.location_name ?? String(selectedLoc?.id ?? selectedLoc?.id ?? "");

      const duplicate = boms.find((bom: any) =>
        String(bom.parent ?? bom.parent_stock_id ?? bom.parent_id) === String(assignedStockId) &&
        String(bom.component ?? bom.component_stock_id ?? bom.component_id) === String(formData.componentCode) &&
        String(bom.loc_code) === String(locCode) &&
        String(bom.work_centre ?? bom.work_centre_id) === String(formData.workCentre)
      );

      if (duplicate) {
        setErrorMessage("The selected component is already on this bom. You can modify it's quantity but it cannot appear more than once on the same bom.");
        setErrorOpen(true);
        return;
      }

      // Build payload for bills of material

      const bomPayload = {
        parent: assignedStockId ?? "",
        component: formData.componentCode,
        work_centre: Number(formData.workCentre) || 0,
        loc_code: String(locCode),
        quantity: Number(formData.quantity) || 0,
      };

      try {
        console.log("Creating BOM with payload:", bomPayload);
        await createBom(bomPayload);
        queryClient.invalidateQueries({ queryKey: ["boms"] });
        //  alert("Bills of Material added successfully!");
        setOpen(true);
        setFormData({ componentCode: "", componentName: "", location: "", workCentre: "", quantity: "1" });
        // go back to table
      } catch (err: any) {
        console.error("Failed to create bills of material:", err);
        const msg = err?.message || err?.errors || JSON.stringify(err) || "Failed to add bills of material";
        setErrorMessage(msg);
        setErrorOpen(true);
      }
    }
  };

  // Fetch work centres from backend
  const { data: workCentres = [] } = useQuery({
    queryKey: ["workCentres"],
    queryFn: getWorkCentres,
  });

  // Fetch existing BOMs to check for duplicates
  const { data: boms = [] } = useQuery({
    queryKey: ["boms"],
    queryFn: getBoms,
  });

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
          Add Bills of Material
        </Typography>

        <Stack spacing={2}>
          {/* Parent item (preselected from BOM table) */}
          <TextField
            label="Parent Item"
            size="small"
            fullWidth
            value={(() => {
              if (!assignedStockId) return "";
              const parentItem = (items || []).find((it: any) => String(it.stock_id ?? it.id) === String(assignedStockId));
              return parentItem ? (parentItem.item_name ?? parentItem.description ?? parentItem.name ?? String(assignedStockId)) : String(assignedStockId);
            })()}
            InputProps={{ readOnly: true }}
          />
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
                    const filteredItems = items.filter((item: any) => item.mb_flag == 2 || item.mb_flag == 3);
                    return Object.entries(
                      filteredItems.reduce((groups: Record<string, any[]>, item) => {
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
            Add Bills of Material
          </Button>
        </Box>
      </Paper>
      <AddedConfirmationModal
        open={open}
        title="Success"
        content="A new component part has been added to the bill of material for this item!"
        addFunc={async () => { }}
        handleClose={() => setOpen(false)}
        onSuccess={() => window.history.back()}
      />
      <ErrorModal
        open={errorOpen}
        onClose={() => setErrorOpen(false)}
        message={errorMessage}
      />
    </Stack>
  );
}