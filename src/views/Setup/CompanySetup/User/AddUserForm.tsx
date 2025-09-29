import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  FormHelperText,
  SelectChangeEvent,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import theme from "../../../../theme";
import { createUser } from "../../../../api/UserManagement/userManagement";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

interface UserFormData {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  epf: string;
  telephone: string;
  address: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  status: string;
}

export default function AddUserForm() {
  const [formData, setFormData] = useState<UserFormData>({
    id: "",
    firstName: "",
    lastName: "",
    department: "",
    epf: "",
    telephone: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    status: "",
  });

  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const queryClient = useQueryClient();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const validate = () => {
    const newErrors: Partial<UserFormData> = {};

    if (!formData.id) newErrors.id = "ID is required";
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.epf) newErrors.epf = "EPF is required";
    if (!formData.telephone) newErrors.telephone = "Telephone is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.role) newErrors.role = "Role is required";
    if (!formData.status) newErrors.status = "Status is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async () => {
    if (validate()) {
      try {
        // Map frontend field names to backend field names
        const payload = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          department: formData.department,
          epf: formData.epf,
          telephone: formData.telephone,
          address: formData.address,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          status: formData.status
        };

        const user = await createUser(payload);
        console.log("User created:", user);
        alert("User created successfully!");
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.refetchQueries({ queryKey: ["users"] });
        navigate("/setup/companysetup/user-account-setup");
        setErrors({});
      } catch (err: any) {
        alert("Error creating user: " + JSON.stringify(err));
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
          User Setup
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="ID"
            name="id"
            size="small"
            fullWidth
            value={formData.id}
            onChange={handleInputChange}
            error={!!errors.id}
            helperText={errors.id}
          />

          <TextField
            label="First Name"
            name="firstName"
            size="small"
            fullWidth
            value={formData.firstName}
            onChange={handleInputChange}
            error={!!errors.firstName}
            helperText={errors.firstName}
          />

          <TextField
            label="Last Name"
            name="lastName"
            size="small"
            fullWidth
            value={formData.lastName}
            onChange={handleInputChange}
            error={!!errors.lastName}
            helperText={errors.lastName}
          />

          <TextField
            label="Department"
            name="department"
            size="small"
            fullWidth
            value={formData.department}
            onChange={handleInputChange}
            error={!!errors.department}
            helperText={errors.department}
          />

          <TextField
            label="EPF"
            name="epf"
            size="small"
            fullWidth
            value={formData.epf}
            onChange={handleInputChange}
            error={!!errors.epf}
            helperText={errors.epf}
          />

          <TextField
            label="Telephone Number"
            name="telephone"
            size="small"
            fullWidth
            value={formData.telephone}
            onChange={handleInputChange}
            error={!!errors.telephone}
            helperText={errors.telephone}
          />

          <TextField
            label="Address"
            name="address"
            size="small"
            fullWidth
            value={formData.address}
            onChange={handleInputChange}
            error={!!errors.address}
            helperText={errors.address}
          />

          <TextField
            label="Email"
            name="email"
            size="small"
            fullWidth
            value={formData.email}
            onChange={handleInputChange}
            error={!!errors.email}
            helperText={errors.email}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            size="small"
            fullWidth
            value={formData.password}
            onChange={handleInputChange}
            error={!!errors.password}
            helperText={errors.password}
          />

          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            size="small"
            fullWidth
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />

          <FormControl size="small" fullWidth error={!!errors.role}>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleSelectChange}
              label="Role"
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </Select>
            <FormHelperText>{errors.role}</FormHelperText>
          </FormControl>

          <FormControl size="small" fullWidth error={!!errors.status}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleSelectChange}
              label="Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
            <FormHelperText>{errors.status}</FormHelperText>
          </FormControl>
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 2 : 0, }}>
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