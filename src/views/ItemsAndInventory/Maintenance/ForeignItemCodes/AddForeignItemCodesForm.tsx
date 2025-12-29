import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getItemCategories } from "../../../../api/ItemCategories/ItemCategoriesApi";
import { useLocation, useNavigate } from "react-router-dom";
import { createItemCode } from "../../../../api/ItemCodes/ItemCodesApi";
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
import AddedConfirmationModal from "../../../../components/AddedConfirmationModal";
import ErrorModal from "../../../../components/ErrorModal";
interface ForeignItemFormData {
  upcCode: string;
  quantity: string;
  description: string;
  category: string;
}

export default function AddForeignItemCodesForm() {
  const [formData, setFormData] = useState<ForeignItemFormData>({
    upcCode: "",
    quantity: "",
    description: "",
    category: "",
  });

  const [errors, setErrors] = useState<Partial<ForeignItemFormData>>({});

  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const location = useLocation();
  const navigate = useNavigate();

  // Allow stock_id to be passed via location.state or query param
  const stateStockId = (location.state as any)?.stock_id;
  const queryStockId = new URLSearchParams(location.search).get("stock_id");
  const [assignedStockId, setAssignedStockId] = useState<string | null>(stateStockId ?? queryStockId ?? null);

  useEffect(() => {
    if (!assignedStockId && stateStockId) setAssignedStockId(String(stateStockId));
  }, [stateStockId]);

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
      // Build payload matching item_codes table
      const payload = {
        item_code: formData.upcCode,
        stock_id: assignedStockId,
        description: formData.description,
        category_id: formData.category,
        quantity: formData.quantity,
        is_foreign: 1,
      };

      try {
        const res = await createItemCode(payload);
        console.log("Created item code:", res);
        // Invalidate item-codes so the table refreshes without a manual reload.
        // Use refetchType: 'all' because the table query may be inactive while we're on the Add page.
        await queryClient.invalidateQueries({ queryKey: ["item-codes"], exact: false, refetchType: 'all' });
        //alert("Foreign Item Code added successfully!");
        setOpen(true);
        setFormData({ upcCode: "", quantity: "", description: "", category: "" });
        // go back to table
      } catch (err: any) {
        console.error("Failed to create item code:", err);
       // alert("Failed to add foreign item code");
        setErrorMessage(err?.response?.data?.message || "Failed to add foreign item code");
        setErrorOpen(true);
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
          Add Foreign Item Code
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
              {/* Fetch categories from API and use category_id as primary key */}
              {/** react-query hook **/}
              {/** Render loading / empty states appropriately **/}
              {(() => {
                const { data, isLoading } = useQuery({ queryKey: ["item-categories"], queryFn: () => getItemCategories() });
                const categories = (data && (data.data ?? data)) ?? [];

                if (isLoading) {
                  return <MenuItem disabled value="">Loading...</MenuItem>;
                }

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
            Add Foreign Item
          </Button>
        </Box>
      </Paper>
      <AddedConfirmationModal
        open={open}
        title="Success"
        content="New item code has been added!"
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
