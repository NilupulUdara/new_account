import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import theme from "../../../../theme";
import { getTaxGroup, updateTaxGroup } from "../../../../api/Tax/taxServices";
import { useParams } from "react-router";

interface TaxGroupFormData {
  description: string;
  tax: boolean;
  shippingTax: string;
}

export default function UpdateTaxGroupsForm() {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState<TaxGroupFormData>({
    description: "",
    tax: false,
    shippingTax: "",
  });

  const [errors, setErrors] = useState<Partial<TaxGroupFormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validate = (): boolean => {
    const newErrors: Partial<TaxGroupFormData> = {};

    if (!formData.description) newErrors.description = "Description is required";

    if (formData.tax) {
      if (!formData.shippingTax) {
        newErrors.shippingTax = "Shipping Tax is required when Tax is checked";
      } else if (isNaN(Number(formData.shippingTax)) || Number(formData.shippingTax) < 0) {
        newErrors.shippingTax = "Shipping Tax must be a positive number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (id) {
      getTaxGroup(Number(id)).then((data) => {
        setFormData({
          description: data.description,
          tax: data.tax,
          shippingTax: String(data.shipping_tax),
        });
      });
    }
  }, [id]);

  const handleSubmit = async () => {
    if (validate() && id) {
      try {
        const payload = {
          description: formData.description,
          tax: formData.tax,
          shipping_tax: Number(formData.shippingTax),
        };
        await updateTaxGroup(Number(id), payload);
        alert("Tax Group updated successfully!");
        window.history.back();
      } catch (error) {
        console.error("Error updating tax group:", error);
        alert("Failed to update Tax Group. Please try again.");
      }
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: 2 }}>
      <Paper
        sx={{
          p: theme.spacing(3),
          width: "100%",
          maxWidth: isMobile ? "100%" : "500px",
          boxShadow: 2,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}
        >
          Tax Group Setup
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Description"
            name="description"
            size="small"
            fullWidth
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
          />

          <FormControlLabel
            control={
              <Checkbox
                name="tax"
                checked={formData.tax}
                onChange={handleChange}
              />
            }
            label="Tax (5%)"
          />

          <TextField
            label="Shipping Tax"
            name="shippingTax"
            size="small"
            fullWidth
            value={formData.shippingTax}
            onChange={handleChange}
            error={!!errors.shippingTax}
            helperText={errors.shippingTax}
          />
        </Stack>

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            gap: 2,
            mt: 3,
          }}
        >
          <Button
            fullWidth={isMobile}
            onClick={() => window.history.back()}
            variant="outlined"
          >
            Back
          </Button>

          <Button
            fullWidth={isMobile}
            variant="contained"
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
