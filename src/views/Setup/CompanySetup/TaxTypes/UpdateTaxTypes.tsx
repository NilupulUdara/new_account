import React, { useEffect, useState } from "react";
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
  SelectChangeEvent,
  FormHelperText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import theme from "../../../../theme";
import { updateTaxType, getTaxType } from "../../../../api/Tax/taxServices";
import { useParams } from "react-router";

interface TaxFormData {
  description: string;
  defaultRate: string;
  salesGlAccount: string;
  purchasingGlAccount: string;
}

export default function UpdateTaxTypes() {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<TaxFormData>({
    description: "",
    defaultRate: "",
    salesGlAccount: "",
    purchasingGlAccount: "",
  });

  const [errors, setErrors] = useState<Partial<TaxFormData>>({});

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = (): boolean => {
    const newErrors: Partial<TaxFormData> = {};

    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.defaultRate) {
      newErrors.defaultRate = "Default rate is required";
    } else if (isNaN(Number(formData.defaultRate)) || Number(formData.defaultRate) < 0) {
      newErrors.defaultRate = "Default rate must be a positive number";
    }
    if (!formData.salesGlAccount) newErrors.salesGlAccount = "Sales GL Account is required";
    if (!formData.purchasingGlAccount) newErrors.purchasingGlAccount = "Purchasing GL Account is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (id) {
      getTaxType(id).then((data) => {
        setFormData({
          description: data.description || "",
          defaultRate: data.default_rate?.toString() || "",
          salesGlAccount: data.sales_gl_account || "",
          purchasingGlAccount: data.purchasing_gl_account || "",
        });
      });
    }
  }, [id]);


  const handleSubmit = async () => {
    if (validate() && id) {
      try {
        const payload = {
          description: formData.description,
          default_rate: formData.defaultRate,
          sales_gl_account: formData.salesGlAccount,
          purchasing_gl_account: formData.purchasingGlAccount,
        };

        await updateTaxType(id, payload);
        alert("Tax type updated successfully!");
        window.history.back();
      } catch (error) {
        console.error(error);
        alert("Failed to update tax type");
      }
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper
        sx={{
          p: theme.spacing(3),
          maxWidth: isMobile ? "100%" : "500px",
          width: "100%",
          boxShadow: 2,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>
          Tax Types
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

          <TextField
            label="Default Rate (%)"
            name="defaultRate"
            size="small"
            type="number"
            fullWidth
            value={formData.defaultRate}
            onChange={handleChange}
            error={!!errors.defaultRate}
            helperText={errors.defaultRate}
          />

          <FormControl size="small" fullWidth error={!!errors.salesGlAccount}>
            <InputLabel>Sales GL Account</InputLabel>
            <Select
              name="salesGlAccount"
              value={formData.salesGlAccount}
              onChange={handleSelectChange}
              label="Sales GL Account"
            >
              <MenuItem value="4000 - Sales Revenue">4000 - Sales Revenue</MenuItem>
              <MenuItem value="4010 - Services Revenue">4010 - Services Revenue</MenuItem>
              <MenuItem value="4020 - Other Income">4020 - Other Income</MenuItem>
            </Select>
            <FormHelperText>{errors.salesGlAccount}</FormHelperText>
          </FormControl>

          <FormControl size="small" fullWidth error={!!errors.purchasingGlAccount}>
            <InputLabel>Purchasing GL Account</InputLabel>
            <Select
              name="purchasingGlAccount"
              value={formData.purchasingGlAccount}
              onChange={handleSelectChange}
              label="Purchasing GL Account"
            >
              <MenuItem value="5000 - Purchase Expenses">5000 - Purchase Expenses</MenuItem>
              <MenuItem value="5010 - Freight Expenses">5010 - Freight Expenses</MenuItem>
              <MenuItem value="5020 - Other Costs">5020 - Other Costs</MenuItem>
            </Select>
            <FormHelperText>{errors.purchasingGlAccount}</FormHelperText>
          </FormControl>
        </Stack>

        <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", mt: 3, gap: isMobile ? 2 : 0, }}>
          <Button
            fullWidth={isMobile}
            variant="outlined"
            onClick={() => window.history.back()}>Back</Button>

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
