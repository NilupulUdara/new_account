import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
  MenuItem,
} from "@mui/material";
import { updateCustomerContact, getCustomerContacts } from "../../../../../api/Customer/CustomerContactApi";
import { useParams } from "react-router";
import UpdateConfirmationModal from "../../../../../components/UpdateConfirmationModal";
import ErrorModal from "../../../../../components/ErrorModal";
interface UpdateContactsData {
  firstName: string;
  lastName: string;
  reference: string;
  contactActiveFor: string;
  phone: string;
  secondaryPhone: string;
  fax: string;
  email: string;
  address: string;
  documentLanguage: string;
  notes: string;
}

export default function UpdateContactsForm() {
  const [formData, setFormData] = useState<UpdateContactsData>({
    firstName: "",
    lastName: "",
    reference: "",
    contactActiveFor: "",
    phone: "",
    secondaryPhone: "",
    fax: "",
    email: "",
    address: "",
    documentLanguage: "",
    notes: "",
  });

  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateContactsData, string>>>({});
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const { id } = useParams();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof UpdateContactsData, string>> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First Name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const allContacts = await getCustomerContacts("");
        const contact = allContacts.find((c: any) => c.id === Number(id));
        if (contact) {
          setFormData({
            firstName: contact.name || "",
            lastName: contact.name2 || "",
            reference: contact.ref || "",
            contactActiveFor: contact.assignment || "",
            phone: contact.phone || "",
            secondaryPhone: contact.phone2 || "",
            fax: contact.fax || "",
            email: contact.email || "",
            address: contact.address || "",
            documentLanguage: contact.lang || "",
            notes: contact.notes || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch contact:", err);
      }
    };
    if (id) fetchContact();
  }, [id]);

  const handleSubmit = async () => {
    if (validate()) {
      try {
        await updateCustomerContact(id!, {
          name: formData.firstName,
          name2: formData.lastName,
          ref: formData.reference,
          assignment: formData.contactActiveFor,
          phone: formData.phone,
          phone2: formData.secondaryPhone,
          fax: formData.fax,
          email: formData.email,
          address: formData.address,
          lang: formData.documentLanguage,
          notes: formData.notes,
        });
        setOpen(true);
      }
      catch (error) {
        console.error("Update failed:", error);
        setErrorMessage(
          error?.response?.data?.message ||
          "Failed to update contact Please try again."
        );
        setErrorOpen(true);
      }
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
          Update
        </Typography>

        <Stack spacing={2}>
          {/* First Name */}
          <TextField
            label="First Name"
            name="firstName"
            size="small"
            fullWidth
            value={formData.firstName}
            onChange={handleInputChange}
            error={!!errors.firstName}
            helperText={errors.firstName || " "}
          />

          {/* Last Name */}
          <TextField
            label="Last Name"
            name="lastName"
            size="small"
            fullWidth
            value={formData.lastName}
            onChange={handleInputChange}
            error={!!errors.lastName}
            helperText={errors.lastName || " "}
          />

          {/* Reference */}
          <TextField
            label="Reference"
            name="reference"
            size="small"
            fullWidth
            value={formData.reference}
            onChange={handleInputChange}
            helperText=" "
          />

          {/* Contact Active For */}
          <TextField
            label="Contact Active For"
            name="contactActiveFor"
            size="small"
            fullWidth
            value={formData.contactActiveFor}
            onChange={handleInputChange}
            helperText=" "
          />

          {/* Phone */}
          <TextField
            label="Phone"
            name="phone"
            size="small"
            fullWidth
            value={formData.phone}
            onChange={handleInputChange}
            error={!!errors.phone}
            helperText={errors.phone || " "}
          />

          {/* Secondary Phone */}
          <TextField
            label="Secondary Phone Number"
            name="secondaryPhone"
            size="small"
            fullWidth
            value={formData.secondaryPhone}
            onChange={handleInputChange}
            helperText=" "
          />

          {/* Fax */}
          <TextField
            label="Fax Number"
            name="fax"
            size="small"
            fullWidth
            value={formData.fax}
            onChange={handleInputChange}
            helperText=" "
          />

          {/* Email */}
          <TextField
            label="Email"
            name="email"
            size="small"
            fullWidth
            value={formData.email}
            onChange={handleInputChange}
            error={!!errors.email}
            helperText={errors.email || " "}
          />

          {/* Address */}
          <TextField
            label="Address"
            name="address"
            size="small"
            fullWidth
            multiline
            minRows={2}
            value={formData.address}
            onChange={handleInputChange}
            helperText=" "
          />

          {/* Document Language */}
          <TextField
            select
            label="Document Language"
            name="documentLanguage"
            size="small"
            fullWidth
            value={formData.documentLanguage}
            onChange={handleInputChange}
            helperText=" "
          >
            <MenuItem value="EN">English</MenuItem>
            <MenuItem value="SI">Sinhala</MenuItem>
            <MenuItem value="TA">Tamil</MenuItem>
          </TextField>

          {/* Notes */}
          <TextField
            label="Notes"
            name="notes"
            size="small"
            fullWidth
            multiline
            minRows={3}
            value={formData.notes}
            onChange={handleInputChange}
            helperText=" "
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
      <UpdateConfirmationModal
        open={open}
        title="Success"
        content="Customer Contact has been updated successfully!"
        handleClose={() => setOpen(false)}
        onSuccess={() => window.history.back()}
      />

      <ErrorModal
        open={errorOpen}
        onClose={() => setErrorOpen(false)}
        message={errorMessage}
      />
    </Stack>
  );
}
