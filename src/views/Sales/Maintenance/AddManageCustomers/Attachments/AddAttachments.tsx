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
import DatePickerComponent from "../../../../../components/DatePickerComponent";

interface AddAttachmentsData {
  customerId: string;
  docDate: Date | null;
  docTitle: string;
  file: File | null;
}

export default function AddAttachmentsForm() {
  const [formData, setFormData] = useState<AddAttachmentsData>({
    customerId: "",
    docDate: null,
    docTitle: "",
    file: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AddAttachmentsData, string>>>({});
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const handleDateChange = (date: Date | null) => {
    setFormData({ ...formData, docDate: date });
    setErrors({ ...errors, docDate: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
      setErrors({ ...errors, file: "" });
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof AddAttachmentsData, string>> = {};
    if (!formData.customerId.trim()) newErrors.customerId = "Customer ID is required";
    if (!formData.docDate) newErrors.docDate = "Document Date is required";
    if (!formData.docTitle.trim()) newErrors.docTitle = "Document Title is required";
    if (!formData.file) newErrors.file = "File is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log("Submitted Attachment:", formData);
      alert("Attachment added successfully!");

      // const data = new FormData();
      // data.append("customerId", formData.customerId);
      // data.append("docDate", formData.docDate.toISOString());
      // data.append("docTitle", formData.docTitle);
      // data.append("file", formData.file);
      // axios.post("/api/attachments", data)
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
          Add Attachment
        </Typography>

        <Stack spacing={2}>
          {/* Customer ID */}
          <TextField
            label="Customer ID"
            name="customerId"
            size="small"
            fullWidth
            value={formData.customerId}
            onChange={handleInputChange}
            error={!!errors.customerId}
            helperText={errors.customerId || " "}
          />

          {/* Document Date */}
          <DatePickerComponent
            value={formData.docDate}
            onChange={handleDateChange}
            label="Document Date"
            error={errors.docDate}
            disableFuture
          />

          {/* Document Title */}
          <TextField
            label="Document Title"
            name="docTitle"
            size="small"
            fullWidth
            value={formData.docTitle}
            onChange={handleInputChange}
            error={!!errors.docTitle}
            helperText={errors.docTitle || " "}
          />

          {/* File Upload */}
          <Button
            variant="outlined"
            component="label"
          >
            Choose File
            <input
              type="file"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          {errors.file && (
            <Typography variant="caption" color="error">
              {errors.file}
            </Typography>
          )}
          {formData.file && (
            <Typography variant="body2">
              Selected File: {formData.file.name}
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
            Add New
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
