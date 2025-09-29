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
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import theme from "../../../../theme";
import { useNavigate, useParams } from "react-router";
import { getSalesPerson, updateSalesPerson } from "../../../../api/SalesPerson/SalesPersonApi";

interface SalesPersonFormData {
  name: string;
  telephone: string;
  fax: string;
  email: string;
  provision: string;
  turnoverBreakPoint: string;
  provision2: string;
}

export default function UpdateSalesPerson() {
  const [formData, setFormData] = useState<SalesPersonFormData>({
    name: "",
    telephone: "",
    fax: "",
    email: "",
    provision: "",
    turnoverBreakPoint: "",
    provision2: "",
  });

  const [errors, setErrors] = useState<Partial<SalesPersonFormData>>({});

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      getSalesPerson(id).then((salesPerson) => {
        setFormData({
          name: salesPerson.name,
          telephone: salesPerson.telephone,
          fax: salesPerson.fax,
          email: salesPerson.email,
          provision: salesPerson.provision?.toString() || "",
          turnoverBreakPoint: salesPerson.turnover_break_point?.toString() || "",
          provision2: salesPerson.provision2?.toString() || "",
        });
      });
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = () => {
    const newErrors: Partial<SalesPersonFormData> = {};

    if (!formData.name) newErrors.name = "Sales Person Name is required";
    if (!formData.telephone) newErrors.telephone = "Telephone is required";
    if (!formData.fax) newErrors.fax = "Fax number is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.provision) newErrors.provision = "Provision is required";
    if (!formData.turnoverBreakPoint)
      newErrors.turnoverBreakPoint = "Turnover Break Pt Level is required";
    if (!formData.provision2) newErrors.provision2 = "Provision 2 is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate() && id) {
      try {
        const payload = {
          name: formData.name,
          telephone: formData.telephone,
          fax: formData.fax,
          email: formData.email,
          provision: parseFloat(formData.provision),
          turnover_break_point: parseFloat(formData.turnoverBreakPoint),
          provision2: parseFloat(formData.provision2),
        };

        const updated = await updateSalesPerson(id, payload);
        alert("Sales Person updated successfully!");

        queryClient.invalidateQueries({ queryKey: ["sales_people"] });
        navigate("/sales/maintenance/sales-persons");
      } catch (err: any) {
        console.error("Error updating sales person:", err);
        alert("Error updating sales person: " + JSON.stringify(err));
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
        <Typography variant="h6" sx={{ mb: 3 }}>
          Update Sales Person
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Sales Person Name"
            name="name"
            size="small"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            error={!!errors.name}
            helperText={errors.name}
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
            label="Fax Number"
            name="fax"
            size="small"
            fullWidth
            value={formData.fax}
            onChange={handleInputChange}
            error={!!errors.fax}
            helperText={errors.fax}
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
            label="Provision (%)"
            name="provision"
            size="small"
            fullWidth
            value={formData.provision}
            onChange={handleInputChange}
            error={!!errors.provision}
            helperText={errors.provision}
          />

          <TextField
            label="Turnover Break Pt Level"
            name="turnoverBreakPoint"
            size="small"
            fullWidth
            value={formData.turnoverBreakPoint}
            onChange={handleInputChange}
            error={!!errors.turnoverBreakPoint}
            helperText={errors.turnoverBreakPoint}
          />

          <TextField
            label="Provision 2 (%)"
            name="provision2"
            size="small"
            fullWidth
            value={formData.provision2}
            onChange={handleInputChange}
            error={!!errors.provision2}
            helperText={errors.provision2}
          />
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 2 : 0, }}>
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
