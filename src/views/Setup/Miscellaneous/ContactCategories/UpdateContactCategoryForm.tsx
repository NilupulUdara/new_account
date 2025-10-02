import React, { useState } from "react";
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

interface UpdateContactCategoryData {
  categoryType: string;
  categorySubType: string;
  shortName: string;
  description: string;
}

export default function UpdateContactCategory() {
  const [formData, setFormData] = useState<UpdateContactCategoryData>({
    categoryType: "",
    categorySubType: "",
    shortName: "",
    description: "",
  });

  const [errors, setErrors] = useState<Partial<UpdateContactCategoryData>>({});
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors: Partial<UpdateContactCategoryData> = {};
    if (!formData.categoryType.trim())
      newErrors.categoryType = "Contact Category Type is required";
    if (!formData.categorySubType.trim())
      newErrors.categorySubType = "Contact Category Subtype is required";
    if (!formData.shortName.trim())
      newErrors.shortName = "Category Short Name is required";
    if (!formData.description.trim())
      newErrors.description = "Category Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log("Contact Category Updateed:", formData);
      alert("Contact category Updated successfully!");
      // API call can go here
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper
        sx={{
          p: 3,
          maxWidth: "600px",
          width: "100%",
          boxShadow: 2,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}
        >
          Update Contact Category
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Contact Category Type"
            name="categoryType"
            size="small"
            fullWidth
            value={formData.categoryType}
            onChange={handleInputChange}
            error={!!errors.categoryType}
            helperText={errors.categoryType}
          />

          <TextField
            label="Contact Category Subtype"
            name="categorySubType"
            size="small"
            fullWidth
            value={formData.categorySubType}
            onChange={handleInputChange}
            error={!!errors.categorySubType}
            helperText={errors.categorySubType}
          />

          <TextField
            label="Category Short Name"
            name="shortName"
            size="small"
            fullWidth
            value={formData.shortName}
            onChange={handleInputChange}
            error={!!errors.shortName}
            helperText={errors.shortName}
          />

          <TextField
            label="Category Description"
            name="description"
            size="small"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
            error={!!errors.description}
            helperText={errors.description}
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
            Update
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
