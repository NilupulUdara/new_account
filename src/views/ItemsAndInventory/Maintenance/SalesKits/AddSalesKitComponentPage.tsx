import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getItems } from "../../../../api/Item/ItemApi";
import { createItemCode, updateItemCode } from "../../../../api/ItemCodes/ItemCodesApi";
import queryClient from "../../../../state/queryClient";
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
} from "@mui/material";
import theme from "../../../../theme";

export default function AddSalesKitComponentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  // state passed from table: { item_code, componentRow? }
  const state = (location.state as any) ?? {};
  const item_code = state.item_code ?? "";
  const componentRow = state.componentRow ?? null;

  const { data: itemsData = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["items"],
    queryFn: getItems,
  });
  const items = (itemsData && (itemsData.data ?? itemsData)) ?? [];

  const [form, setForm] = useState({ stock_id: "", quantity: "" });
  const [errors, setErrors] = useState<{ stock_id?: string; quantity?: string }>({});

  useEffect(() => {
    if (componentRow) {
      setForm({ stock_id: String(componentRow.stock_id ?? componentRow.id ?? ""), quantity: String(componentRow.quantity ?? "") });
    }
  }, [componentRow]);

  const validate = () => {
    const e: typeof errors = {};
    if (!form.stock_id) e.stock_id = "Component is required";
    if (!form.quantity) e.quantity = "Quantity is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      const selectedItem = items.find((it: any) => String(it.stock_id ?? it.id) === String(form.stock_id));
      const payload: any = {
        item_code: item_code,
        description: componentRow?.description ?? (state.kitDescription ?? selectedItem?.description ?? selectedItem?.item_name ?? selectedItem?.name ?? ""),
        category_id: state.kitCategoryId ?? componentRow?.category_id ?? selectedItem?.category_id ?? null,
        quantity: form.quantity,
        is_foreign: 0,
        stock_id: selectedItem ? (selectedItem.stock_id ?? selectedItem.id) : form.stock_id,
      };

      if (componentRow && componentRow.id) {
        await updateItemCode(componentRow.id, payload);
      } else {
        await createItemCode(payload);
      }

      // Ensure all item-codes queries (active & inactive) are refetched so the table updates immediately
      await queryClient.invalidateQueries({ queryKey: ["item-codes"], refetchType: 'all' });

      // Navigate back to the sales kits page and pass the selected kit so the kit page remains selected
      navigate('/itemsandinventory/maintenance/sales-kits', {
        state: {
          selectedKit: item_code,
          kitDescription: state.kitDescription,
          kitCategoryId: state.kitCategoryId,
          refreshKey: Date.now(),
        },
      });
    } catch (err) {
      console.error(err);
      alert("Failed to save component");
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper sx={{ p: theme.spacing(3), maxWidth: "800px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>{componentRow ? "Update Component" : "Add Component"}</Typography>

        <Stack spacing={2}>
          <TextField label="Kit Code" size="small" fullWidth value={item_code} InputProps={{ readOnly: true }} />

          <FormControl size="small" fullWidth error={!!errors.stock_id}>
            <InputLabel>Component</InputLabel>
            <Select name="stock_id" value={form.stock_id} label="Component" onChange={(e) => setForm({ ...form, stock_id: e.target.value as string })}>
              {itemsLoading ? (
                <MenuItem disabled value="">Loading...</MenuItem>
              ) : items.length > 0 ? (
                items.map((item: any) => (
                  <MenuItem key={item.stock_id || item.id} value={String(item.stock_id ?? item.id)}>
                    {item.description ?? item.item_name ?? item.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">No items available</MenuItem>
              )}
            </Select>
            <FormHelperText>{errors.stock_id || " "}</FormHelperText>
          </FormControl>

          <TextField label="Quantity" name="quantity" size="small" fullWidth type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} error={!!errors.quantity} helperText={errors.quantity || " "} />

          <Box sx={{ display: 'flex', mt: 2, flexDirection: isMobile ? 'column' : 'row', alignItems: 'center' }}>
            {/* Cancel on the left - keep selected kit on return */}
            <Button
              variant="outlined"
              onClick={() => navigate('/itemsandinventory/maintenance/sales-kits', {
                state: {
                  selectedKit: item_code,
                  kitDescription: state.kitDescription,
                  kitCategoryId: state.kitCategoryId,
                },
              })}
            >
              Cancel
            </Button>

            {/* Action on the right */}
            <Box sx={{ ml: isMobile ? 0 : 'auto', display: 'flex', width: isMobile ? '100%' : 'auto' }}>
              <Button
                variant="contained"
                fullWidth={isMobile}
                sx={{ backgroundColor: 'var(--pallet-blue)', color: '#fff', height: 36 }}
                onClick={handleSave}
              >
                {componentRow ? 'Update' : 'Add'}
              </Button>
            </Box>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}
