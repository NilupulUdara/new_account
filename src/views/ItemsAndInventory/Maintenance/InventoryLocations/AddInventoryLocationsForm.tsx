import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Paper,
  FormHelperText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import theme from "../../../../theme";
import { createInventoryLocation } from "../../../../api/InventoryLocation/InventoryLocationApi";

interface InventoryLocationFormData {
  locationCode: string;
  locationName: string;
  contact: string;
  address: string;
  telephone: string;
  secondaryTelephone: string;
  facsimile: string;
  email: string;
}

export default function AddInventoryLocationForm() {
  const [formData, setFormData] = useState<InventoryLocationFormData>({
    locationCode: "",
    locationName: "",
    contact: "",
    address: "",
    telephone: "",
    secondaryTelephone: "",
    facsimile: "",
    email: "",
  });

  const [errors, setErrors] = useState<Partial<InventoryLocationFormData>>({});
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // clear error on change
  };

  const validate = () => {
    const newErrors: Partial<InventoryLocationFormData> = {};

    if (!formData.locationCode) newErrors.locationCode = "Location Code is required";
    if (!formData.locationName) newErrors.locationName = "Location Name is required";
    if (!formData.contact) newErrors.contact = "Contact is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.telephone) newErrors.telephone = "Telephone number is required";
    else if (!/^\d{10,15}$/.test(formData.telephone)) newErrors.telephone = "Enter a valid telephone number";
    if (formData.secondaryTelephone && !/^\d{10,15}$/.test(formData.secondaryTelephone))
      newErrors.secondaryTelephone = "Enter a valid secondary telephone number";
    if (formData.facsimile && !/^\d+$/.test(formData.facsimile)) newErrors.facsimile = "Enter a valid facsimile number";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Enter a valid email";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        const payload = {
          loc_code: formData.locationCode,
          location_name: formData.locationName,
          delivery_address: formData.address,
          contact: formData.contact,
          phone: formData.telephone,
          phone2: formData.secondaryTelephone,
          fax: formData.facsimile,
          email: formData.email,
        };

        await createInventoryLocation(payload);
        alert("Inventory location created successfully!");
        window.history.back();
      } catch (error) {
        console.error(error);
        alert("Failed to create Inventory location");
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
          Add Inventory Location
        </Typography>

        <Stack spacing={0.5}>
          <TextField
            label="Location Code"
            name="locationCode"
            size="small"
            fullWidth
            value={formData.locationCode}
            onChange={handleChange}
            error={!!errors.locationCode}
            helperText={errors.locationCode || " "}
          />

          <TextField
            label="Location Name"
            name="locationName"
            size="small"
            fullWidth
            value={formData.locationName}
            onChange={handleChange}
            error={!!errors.locationName}
            helperText={errors.locationName || " "}
          />

          <TextField
            label="Contact of Deliveries"
            name="contact"
            size="small"
            fullWidth
            value={formData.contact}
            onChange={handleChange}
            error={!!errors.contact}
            helperText={errors.contact || " "}
          />

          <TextField
            label="Address"
            name="address"
            size="small"
            fullWidth
            multiline
            rows={2}
            value={formData.address}
            onChange={handleChange}
            error={!!errors.address}
            helperText={errors.address || " "}
          />

          <TextField
            label="Telephone No"
            name="telephone"
            size="small"
            fullWidth
            value={formData.telephone}
            onChange={handleChange}
            error={!!errors.telephone}
            helperText={errors.telephone || " "}
          />

          <TextField
            label="Secondary Telephone No"
            name="secondaryTelephone"
            size="small"
            fullWidth
            value={formData.secondaryTelephone}
            onChange={handleChange}
            error={!!errors.secondaryTelephone}
            helperText={errors.secondaryTelephone || " "}
          />

          <TextField
            label="Facsimile No"
            name="facsimile"
            size="small"
            fullWidth
            value={formData.facsimile}
            onChange={handleChange}
            error={!!errors.facsimile}
            helperText={errors.facsimile || " "}
          />

          <TextField
            label="Email"
            name="email"
            size="small"
            fullWidth
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email || " "}
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
            Add Location
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
