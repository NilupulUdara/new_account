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
  Button,
  Paper,
  FormHelperText,
  SelectChangeEvent,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import theme from "../../../../../theme";
import { getCurrencies } from "../../../../../api/Currency/currencyApi";
import { getSalesTypes } from "../../../../../api/SalesMaintenance/salesService";
import { createSalesPricing } from "../../../../../api/SalesPricing/SalesPricingApi";

interface SalesPricingFormData {
  currency_id: number | "";
  sales_type_id: number | "";
  price: string;
}

// Separate type for errors
interface SalesPricingFormErrors {
  currency_id?: string;
  sales_type_id?: string;
  price?: string;
}

// Type returned from APIs
interface Currency {
  id: number;
  currency_abbreviation: string;
}

interface SalesType {
  id?: number;
  typeName?: string;
}

export default function AddSalesPricingForm() {
  const [formData, setFormData] = useState<SalesPricingFormData>({
    currency_id: "",
    sales_type_id: "",
    price: "",
  });
  const [errors, setErrors] = useState<SalesPricingFormErrors>({});
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [salesTypes, setSalesTypes] = useState<SalesType[]>([]);

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // Fetch currencies and sales types
  useEffect(() => {
    const fetchData = async () => {
      try {
        const currenciesRes: Currency[] = await getCurrencies();
        const salesTypesRes: SalesType[] = await getSalesTypes();

        // Ensure id and typeName are not optional
        setCurrencies(currenciesRes.map(c => ({ id: c.id, currency_abbreviation: c.currency_abbreviation })));
        setSalesTypes(salesTypesRes.map(s => ({ id: s.id!, typeName: s.typeName! })));
      } catch (error) {
        console.error("Failed to fetch currencies or sales types", error);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSelectChange = (e: SelectChangeEvent<number>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: Number(value) });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors: SalesPricingFormErrors = {};
    if (!formData.currency_id) newErrors.currency_id = "Currency is required";
    if (!formData.sales_type_id) newErrors.sales_type_id = "Sales Type is required";
    if (!formData.price) newErrors.price = "Price is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await createSalesPricing({
        currency_id: formData.currency_id,
        sales_type_id: formData.sales_type_id,
        price: Number(formData.price),
      });
      alert("Sales Pricing added successfully!");
      navigate("/itemsandinventory/maintenance/items/sales-pricing");
    } catch (error) {
      console.error("API Error:", error);
      alert("Failed to add Sales Pricing");
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper sx={{ p: theme.spacing(3), maxWidth: "500px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>
          Add Sales Pricing
        </Typography>

        <Stack spacing={2}>
          <FormControl size="small" fullWidth error={!!errors.currency_id}>
            <InputLabel>Currency</InputLabel>
            <Select
              name="currency_id"
              value={formData.currency_id}
              onChange={handleSelectChange}
              label="Currency"
            >
              {currencies.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.currency_abbreviation}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.currency_id}</FormHelperText>
          </FormControl>

          <FormControl size="small" fullWidth error={!!errors.sales_type_id}>
            <InputLabel>Sales Type</InputLabel>
            <Select
              name="sales_type_id"
              value={formData.sales_type_id}
              onChange={handleSelectChange}
              label="Sales Type"
            >
              {salesTypes.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.typeName}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.sales_type_id}</FormHelperText>
          </FormControl>

          <TextField
            label="Price (per each)"
            name="price"
            size="small"
            fullWidth
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            error={!!errors.price}
            helperText={errors.price}
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
          <Button onClick={() => navigate("/itemsandinventory/maintenance/items/sales-pricing")}>
            Back
          </Button>

          <Button
            variant="contained"
            fullWidth={isMobile}
            sx={{ backgroundColor: "var(--pallet-blue)" }}
            onClick={handleSubmit}
          >
            Add Pricing
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
