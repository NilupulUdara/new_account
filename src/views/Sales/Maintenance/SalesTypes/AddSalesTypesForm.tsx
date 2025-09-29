import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Paper,
  FormControlLabel,
  Checkbox,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import theme from "../../../../theme";
import { createSalesType } from "../../../../api/SalesMaintenance/salesService";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

interface SalesTypeFormData {
  salesTypeName: string;
  calculationFactor: string;
  taxIncluded: boolean;
}

export default function AddSalesTypesForm() {
  const [formData, setFormData] = useState<SalesTypeFormData>({
    salesTypeName: "",
    calculationFactor: "",
    taxIncluded: false,
  });

  const [errors, setErrors] = useState<Partial<SalesTypeFormData>>({});

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validate = () => {
    const newErrors: Partial<SalesTypeFormData> = {};

    if (!formData.salesTypeName) newErrors.salesTypeName = "Sales Type Name is required";
    if (!formData.calculationFactor) {
      newErrors.calculationFactor = "Calculation Factor is required";
    } else if (isNaN(Number(formData.calculationFactor))) {
      newErrors.calculationFactor = "Calculation Factor must be a number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (validate()) {
      try {
        await createSalesType({
          typeName: formData.salesTypeName,
          factor: Number(formData.calculationFactor),
          taxIncl: formData.taxIncluded,
        });

        queryClient.invalidateQueries({ queryKey: ["salesTypes"] });
        
        alert("Sales Type added successfully!");
        navigate("/sales/maintenance/sales-types"); // Navigate directly instead of using history.back
      } catch (error) {
        console.error(error);
        alert("Failed to add Sales Type");
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
          Sales Types Setup
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Sales Type Name"
            name="salesTypeName"
            size="small"
            fullWidth
            value={formData.salesTypeName}
            onChange={handleInputChange}
            error={!!errors.salesTypeName}
            helperText={errors.salesTypeName}
          />

          <TextField
            label="Calculation Factor"
            name="calculationFactor"
            size="small"
            fullWidth
            value={formData.calculationFactor}
            onChange={handleInputChange}
            error={!!errors.calculationFactor}
            helperText={errors.calculationFactor}
          />

          <FormControlLabel
            control={
              <Checkbox
                name="taxIncluded"
                checked={formData.taxIncluded}
                onChange={handleInputChange}
              />
            }
            label="Tax Included"
          />
        </Stack>

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            mt: 3,
            gap: isMobile ? 2 : 0,
          }}>
          <Button onClick={() => window.history.back()}
          >Back
          </Button>

          <Button
            variant="contained"
            fullWidth={isMobile}
            sx={{ backgroundColor: "var(--pallet-blue)" }}
            onClick={handleSubmit}
          >
            Add New
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
