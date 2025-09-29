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
  FormControlLabel,
  Checkbox,
} from "@mui/material";

interface AddLanguagesData {
  languageCode: string;
  languageName: string;
  encoding: string;
  rtl: boolean;
  defaultLanguage: boolean;
  poFile: File | null;
  moFile: File | null;
}

export default function AddLanguagesForm() {
  const [formData, setFormData] = useState<AddLanguagesData>({
    languageCode: "",
    languageName: "",
    encoding: "",
    rtl: false,
    defaultLanguage: false,
    poFile: null,
    moFile: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AddLanguagesData, string>>>({});

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const handleChange = (field: keyof AddLanguagesData, value: any) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const handleFileChange = (field: "poFile" | "moFile", e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleChange(field, e.target.files[0]);
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof AddLanguagesData, string>> = {};
    if (!formData.languageCode.trim()) newErrors.languageCode = "Language code is required";
    if (!formData.languageName.trim()) newErrors.languageName = "Language name is required";
    if (!formData.encoding.trim()) newErrors.encoding = "Encoding is required";
    if (!formData.poFile) newErrors.poFile = "Language PO file is required";
    if (!formData.moFile) newErrors.moFile = "Language MO file is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log("Language Added:", formData);
      alert("Language added successfully!");

      // Example API call:
      // const data = new FormData();
      // Object.entries(formData).forEach(([key, value]) => {
      //   data.append(key, value as any);
      // });
      // axios.post("/api/languages", data);
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper sx={{ p: 3, maxWidth: "600px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>
          Add Language
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Language Code"
            size="small"
            fullWidth
            value={formData.languageCode}
            onChange={(e) => handleChange("languageCode", e.target.value)}
            error={!!errors.languageCode}
            helperText={errors.languageCode || " "}
          />

          <TextField
            label="Language Name"
            size="small"
            fullWidth
            value={formData.languageName}
            onChange={(e) => handleChange("languageName", e.target.value)}
            error={!!errors.languageName}
            helperText={errors.languageName || " "}
          />

          <TextField
            label="Encoding"
            size="small"
            fullWidth
            value={formData.encoding}
            onChange={(e) => handleChange("encoding", e.target.value)}
            error={!!errors.encoding}
            helperText={errors.encoding || " "}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.rtl}
                onChange={(e) => handleChange("rtl", e.target.checked)}
              />
            }
            label="Right to Left"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.defaultLanguage}
                onChange={(e) => handleChange("defaultLanguage", e.target.checked)}
              />
            }
            label="Default Language"
          />

          {/* PO File */}
          <Button variant="outlined" component="label">
            Choose Language File (PO)
            <input
              type="file"
              hidden
              onChange={(e) => handleFileChange("poFile", e)}
              accept=".po"
            />
          </Button>
          {formData.poFile && (
            <Typography variant="body2" color="text.secondary">
              Selected: {formData.poFile.name}
            </Typography>
          )}
          {errors.poFile && (
            <Typography variant="body2" color="error">
              {errors.poFile}
            </Typography>
          )}

          {/* MO File */}
          <Button variant="outlined" component="label">
            Choose Language File (MO)
            <input
              type="file"
              hidden
              onChange={(e) => handleFileChange("moFile", e)}
              accept=".mo"
            />
          </Button>
          {formData.moFile && (
            <Typography variant="body2" color="text.secondary">
              Selected: {formData.moFile.name}
            </Typography>
          )}
          {errors.moFile && (
            <Typography variant="body2" color="error">
              {errors.moFile}
            </Typography>
          )}
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
            Add Language
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
