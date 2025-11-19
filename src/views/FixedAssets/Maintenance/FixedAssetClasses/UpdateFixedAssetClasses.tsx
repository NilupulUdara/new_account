import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Button,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import theme from "../../../../theme";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

// API imports
// import { getFixedAssetClasses, createFixedAssetClass } from "../../../../api/FixedAssetClasses/FixedAssetClassesApi";

interface FixedAssetClassForm {
  parentClass: string;
  assetClass: string;
  description: string;
  longDescription: string;
  depreciationRate: string;
}

export default function UpdateFixedAssetClasses() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const [formData, setFormData] = useState<FixedAssetClassForm>({
    parentClass: "",
    assetClass: "",
    description: "",
    longDescription: "",
    depreciationRate: "",
  });

  const [errors, setErrors] = useState<Partial<FixedAssetClassForm>>({});
  const [parentClasses, setParentClasses] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const res = await getFixedAssetClasses();
        // setParentClasses(res || []);
      } catch (err) {
        console.error("Failed to load parent classes", err);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors: Partial<FixedAssetClassForm> = {};

    if (!formData.assetClass.trim()) newErrors.assetClass = "Fixed asset class is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.depreciationRate.trim()) newErrors.depreciationRate = "Enter a depreciation rate";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      parent: formData.parentClass ? Number(formData.parentClass) : null,
      asset_class: formData.assetClass,
      description: formData.description,
      long_description: formData.longDescription,
      depreciation_rate: Number(formData.depreciationRate),
      inactive: 0,
    };

    try {
      // const res = await createFixedAssetClass(payload);
      alert("Fixed Asset Class added successfully!");

      queryClient.invalidateQueries({ queryKey: ["fixedAssetClasses"], exact: false });
      navigate("/fixedassets/maintenance/fixed-asset-classes");
    } catch (err) {
      console.error("Creation failed", err);
      alert("Failed to create Fixed Asset Class.");
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
          Add Fixed Asset Class
        </Typography>

        <Stack spacing={2}>
          {/* Parent Class */}
          <FormControl size="small" fullWidth>
            <InputLabel>Parent Class</InputLabel>
            <Select
              name="parentClass"
              value={formData.parentClass}
              label="Parent Class"
              onChange={handleInputChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {parentClasses.map((cls: any) => (
                <MenuItem key={cls.id} value={String(cls.id)}>
                  {cls.asset_class}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Fixed Asset Class */}
          <TextField
            label="Fixed Asset Class"
            name="assetClass"
            size="small"
            fullWidth
            value={formData.assetClass}
            onChange={handleInputChange}
            error={!!errors.assetClass}
            helperText={errors.assetClass || " "}
          />

          {/* Description */}
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

          {/* Long Description */}
          <TextField
            label="Long Description"
            name="longDescription"
            size="small"
            fullWidth
            multiline
            minRows={3}
            value={formData.longDescription}
            onChange={handleInputChange}
          />

          {/* Depreciation Rate */}
          <TextField
            label="Basic Depreciation Rate (%)"
            name="depreciationRate"
            type="number"
            size="small"
            fullWidth
            value={formData.depreciationRate}
            onChange={handleInputChange}
            error={!!errors.depreciationRate}
            helperText={errors.depreciationRate || " "}
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
            Add Fixed Asset Class
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
