import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import theme from "../../../../../theme";
import { getItemById, updateItem } from "../../../../../api/Item/ItemApi";
import { getItemTypes } from "../../../../../api/ItemType/ItemType";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ItemStandardCostProps {
  itemId?: string | number;
}

interface StandardCostFormData {
  unitCost: string;
  standardLabourCost: string;
  standardOverheadCost: string;
  referenceLine: string;
  memo: string;
}

export default function AddStandardCostForm({ itemId }: ItemStandardCostProps) {
  const [formData, setFormData] = useState<StandardCostFormData>({
    unitCost: "",
    standardLabourCost: "",
    standardOverheadCost: "",
    referenceLine: "",
    memo: "",
  });

  const [errors, setErrors] = useState<Partial<StandardCostFormData>>({});
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch item data
  const { data: itemData, isLoading: itemLoading } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => getItemById(itemId),
    enabled: !!itemId,
  });

  // Fetch item types
  const { data: itemTypes = [] } = useQuery({
    queryKey: ["itemTypes"],
    queryFn: getItemTypes,
  });

  // Determine if item is manufactured
  const selectedItemType = itemTypes.find((t) => t.id === itemData?.mb_flag);
  const isManufacture = selectedItemType?.name?.toLowerCase() === "manufactured";

  // Populate form with existing costs when item data loads
  useEffect(() => {
    if (itemData) {
      setFormData({
        unitCost: itemData.material_cost?.toString() || "",
        standardLabourCost: itemData.labour_cost?.toString() || "",
        standardOverheadCost: itemData.overhead_cost?.toString() || "",
        referenceLine: "",
        memo: "",
      });
    }
  }, [itemData]);

  // Mutation to update item costs
  const updateCostMutation = useMutation({
    mutationFn: (payload: any) => updateItem(itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item", itemId] });
      alert("Standard Cost updated successfully!");
    },
    onError: (err: any) => {
      console.error("Failed to update standard cost:", err);
      alert("Failed to update standard cost");
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors: Partial<StandardCostFormData> = {};
    if (!formData.unitCost) newErrors.unitCost = "Unit Cost is required";
    if (isManufacture && !formData.standardLabourCost) newErrors.standardLabourCost = "Standard Labour Cost is required";
    if (isManufacture && !formData.standardOverheadCost) newErrors.standardOverheadCost = "Standard Overhead Cost is required";
   

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const payload = {
        ...itemData,
        material_cost: parseFloat(formData.unitCost) || 0,
        labour_cost: isManufacture ? (parseFloat(formData.standardLabourCost) || 0) : 0,
        overhead_cost: isManufacture ? (parseFloat(formData.standardOverheadCost) || 0) : 0,
      };
      updateCostMutation.mutate(payload);
    }
  };

  if (itemLoading) {
    return (
      <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
        <Typography>Loading item details...</Typography>
      </Stack>
    );
  }

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
        <Stack spacing={2}>
          <TextField
            label="Unit Cost"
            name="unitCost"
            size="small"
            fullWidth
            type="number"
            value={formData.unitCost}
            onChange={handleInputChange}
            error={!!errors.unitCost}
            helperText={errors.unitCost}
          />

          {isManufacture && (
            <TextField
              label="Standard Labour Cost Per Unit"
              name="standardLabourCost"
              size="small"
              fullWidth
              type="number"
              value={formData.standardLabourCost}
              onChange={handleInputChange}
              error={!!errors.standardLabourCost}
              helperText={errors.standardLabourCost}
            />
          )}

          {isManufacture && (
            <TextField
              label="Standard Overhead Cost Per Unit"
              name="standardOverheadCost"
              size="small"
              fullWidth
              type="number"
              value={formData.standardOverheadCost}
              onChange={handleInputChange}
              error={!!errors.standardOverheadCost}
              helperText={errors.standardOverheadCost}
            />
          )}

          <TextField
            label="Reference Line"
            name="referenceLine"
            size="small"
            fullWidth
            value={formData.referenceLine}
            onChange={handleInputChange}
            error={!!errors.referenceLine}
            helperText={errors.referenceLine}
          />

          <TextField
            label="Memo"
            name="memo"
            size="small"
            fullWidth
            multiline
            rows={3}
            value={formData.memo}
            onChange={handleInputChange}
            error={!!errors.memo}
            helperText={errors.memo}
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
          <Button onClick={() => navigate("/itemsandinventory/maintenance/items")}>
            Back
          </Button>

          <Button
            variant="contained"
            fullWidth={isMobile}
            sx={{ backgroundColor: "var(--pallet-blue)" }}
            onClick={handleSubmit}
          >
            Add Standard Cost
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
