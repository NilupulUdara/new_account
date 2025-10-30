import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getItemCategories } from "../../../../api/ItemCategories/ItemCategoriesApi";
import { useLocation, useNavigate } from "react-router-dom";
import { updateItemCode } from "../../../../api/ItemCodes/ItemCodesApi";
import queryClient from "../../../../state/queryClient";
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

interface ForeignItemFormData {
  upcCode: string;
  quantity: string;
  description: string;
  category: string;
}

export default function UpdateForeignItemCodesForm() {
  const [formData, setFormData] = useState<ForeignItemFormData>({
    upcCode: "",
    quantity: "",
    description: "",
    category: "",
  });

  const [errors, setErrors] = useState<Partial<ForeignItemFormData>>({});

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const location = useLocation();
  const navigate = useNavigate();
  const itemCodeFromState = (location.state as any)?.itemCode ?? null;
  const stateStockId = (location.state as any)?.stock_id ?? null;

  useEffect(() => {
    if (itemCodeFromState) {
      setFormData({
        upcCode: itemCodeFromState.item_code ?? itemCodeFromState.code ?? "",
        quantity: itemCodeFromState.quantity ?? "",
        description: itemCodeFromState.description ?? "",
        category: String(itemCodeFromState.category_id ?? itemCodeFromState.category ?? ""),
      });
    }
  }, [itemCodeFromState]);

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
    const newErrors: Partial<ForeignItemFormData> = {};
    if (!formData.upcCode) newErrors.upcCode = "UPC/EAN Code is required";
    if (!formData.quantity) newErrors.quantity = "Quantity is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      const payload = {
        item_code: formData.upcCode,
        stock_id: stateStockId,
        description: formData.description,
        category_id: formData.category,
        quantity: formData.quantity,
        is_foreign: 1,
      };

      const id = itemCodeFromState?.id ?? itemCodeFromState?.code_id ?? null;
      if (!id) {
        alert("Cannot update: missing item code id.");
        return;
      }

      try {
  const res = await updateItemCode(id, payload);
  console.log("Updated item code:", res);
  // Invalidate so the table refreshes.
  // Use refetchType: 'all' to ensure inactive queries (the table) are refetched.
  await queryClient.invalidateQueries({ queryKey: ["item-codes"], exact: false, refetchType: 'all' });
  alert("Foreign Item Code updated successfully!");
  setFormData({ upcCode: "", quantity: "", description: "", category: "" });
  navigate(-1);
      } catch (err: any) {
        console.error("Failed to update item code:", err);
        alert("Failed to update foreign item code");
      }
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
          Update Foreign Item Code
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="UPC/EAN Code"
            name="upcCode"
            size="small"
            fullWidth
            value={formData.upcCode}
            onChange={handleInputChange}
            error={!!errors.upcCode}
            helperText={errors.upcCode || " "}
          />

          <TextField
            label="Quantity (Each)"
            name="quantity"
            size="small"
            fullWidth
            type="number"
            value={formData.quantity}
            onChange={handleInputChange}
            error={!!errors.quantity}
            helperText={errors.quantity || " "}
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
              {(() => {
                const { data, isLoading } = useQuery({ queryKey: ["item-categories"], queryFn: () => getItemCategories() });
                const categories = (data && (data.data ?? data)) ?? [];

                if (isLoading) return <MenuItem disabled value="">Loading...</MenuItem>;

                return categories.length > 0 ? (
                  categories.map((cat: any) => (
                    <MenuItem key={cat.category_id ?? cat.id} value={String(cat.category_id ?? cat.id)}>
                      {cat.description ?? cat.name ?? cat.category_name ?? cat.title ?? String(cat.category_id ?? cat.id)}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">No categories</MenuItem>
                );
              })()}
            </Select>
            <FormHelperText>{errors.category || " "}</FormHelperText>
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
            Update
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
