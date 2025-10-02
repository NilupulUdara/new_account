import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import theme from "../../../../theme";
import { getShippingCompany, updateShippingCompany } from "../../../../api/ShippingCompany/ShippingCompanyApi";
import { useParams, useNavigate } from "react-router-dom";

interface ShippingCompanyFormData {
  name: string;
  contactPerson: string;
  phoneNumber: string;
  secondaryNumber: string;
  address: string;
}

export default function UpdateShippingCompanyForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ShippingCompanyFormData>({
    name: "",
    contactPerson: "",
    phoneNumber: "",
    secondaryNumber: "",
    address: "",
  });

  const [errors, setErrors] = useState<Partial<ShippingCompanyFormData>>({});

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  useEffect(() => {
    if (!id) return;

    const fetchCompany = async () => {
      try {
        const res = await getShippingCompany(Number(id));
        if (res) {
          setFormData({
            name: res.name || "",
            contactPerson: res.contact_person || "",
            phoneNumber: res.phone_number || "",
            secondaryNumber: res.secondary_number || "",
            address: res.address || "",
          });
        }
      } catch (error) {
        console.error("Error fetching shipping company:", error);
        alert("Failed to load company data.");
      }
    };

    fetchCompany();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = (): boolean => {
    const newErrors: Partial<ShippingCompanyFormData> = {};

    if (!formData.name) newErrors.name = "Company name is required";
    if (!formData.contactPerson) newErrors.contactPerson = "Contact person is required";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
    else if (!/^\d{10,15}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = "Phone number must be 10–15 digits";

    if (formData.secondaryNumber && !/^\d{10,15}$/.test(formData.secondaryNumber))
      newErrors.secondaryNumber = "Secondary number must be 10–15 digits";

    if (!formData.address) newErrors.address = "Address is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

//   const handleUpdate = async () => {
//     if (!validate()) return;

//     try {
//       const payload = {
//         name: formData.name,
//         contact_person: formData.contactPerson,
//         phone_number: formData.phoneNumber,
//         secondary_number: formData.secondaryNumber,
//         address: formData.address,
//       };

//       await updateShippingCompany(Number(id), payload);
//       alert("Shipping company updated successfully!");
//       navigate("/setup/miscellaneous/shipping-company");
//     } catch (error) {
//       console.error(error);
//       alert("Failed to update shipping company");
//     }
//   };

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
          Edit Shipping Company
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Company Name"
            name="name"
            size="small"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />

          <TextField
            label="Contact Person"
            name="contactPerson"
            size="small"
            fullWidth
            value={formData.contactPerson}
            onChange={handleChange}
            error={!!errors.contactPerson}
            helperText={errors.contactPerson}
          />

          <TextField
            label="Phone Number"
            name="phoneNumber"
            size="small"
            fullWidth
            value={formData.phoneNumber}
            onChange={handleChange}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
          />

          <TextField
            label="Secondary Number"
            name="secondaryNumber"
            size="small"
            fullWidth
            value={formData.secondaryNumber}
            onChange={handleChange}
            error={!!errors.secondaryNumber}
            helperText={errors.secondaryNumber}
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
            helperText={errors.address}
          />
        </Stack>

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            mt: 3,
            gap: isMobile ? 2 : 0,
          }}
        >
          <Button fullWidth={isMobile} variant="outlined" onClick={() => navigate(-1)}>
            Back
          </Button>

          <Button
            variant="contained"
            fullWidth={isMobile}
            sx={{ backgroundColor: "var(--pallet-blue)" }}
            // onClick={handleUpdate}
          >
            Update Company
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
