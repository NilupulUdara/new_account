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

interface AddCompanyData {
  company: string;
  defaultCompany: string;
  host: string;
  port: string;
  dbUser: string;
  dbPassword: string;
  dbName: string;
  dbCollation: string;
  tablePref: string;
  dbScript: string;
  newScriptAdminPassword: string;
}

export default function AddCompanyForm() {
  const [formData, setFormData] = useState<AddCompanyData>({
    company: "",
    defaultCompany: "",
    host: "",
    port: "",
    dbUser: "",
    dbPassword: "",
    dbName: "",
    dbCollation: "",
    tablePref: "",
    dbScript: "",
    newScriptAdminPassword: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AddCompanyData, string>>>({});
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const handleChange = (field: keyof AddCompanyData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof AddCompanyData, string>> = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim()) newErrors[key as keyof AddCompanyData] = "This field is required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log("Company Added:", formData);
      alert("Company added successfully!");
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper sx={{ p: 3, maxWidth: "600px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>
          Add Company
        </Typography>

        <Stack spacing={2}>
          {Object.keys(formData).map((field) => (
            <TextField
              key={field}
              label={field.replace(/([A-Z])/g, " $1")}
              size="small"
              fullWidth
              value={formData[field as keyof AddCompanyData]}
              onChange={(e) => handleChange(field as keyof AddCompanyData, e.target.value)}
              error={!!errors[field as keyof AddCompanyData]}
              helperText={errors[field as keyof AddCompanyData]}
              type={field.toLowerCase().includes("password") ? "password" : "text"}
            />
          ))}
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
            Add Company
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
