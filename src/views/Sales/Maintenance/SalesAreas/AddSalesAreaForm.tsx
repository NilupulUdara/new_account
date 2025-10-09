import React, { useState } from "react";
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
import { createSalesArea } from "../../../../api/SalesMaintenance/salesService";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { setSourceMapsEnabled } from "process";
import AddedConfirmationModal from "../../../../components/AddedConfirmationModal";
import ErrorModal from "../../../../components/ErrorModal";

interface SalesAreaFormData {
  name: string;
}

export default function AddSalesAreaForm() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState<SalesAreaFormData>({
    name: "",
  });
  const [error, setError] = useState<string>("");
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({ name: value });
  };

  const validate = () => {
    if (!formData.name.trim()) {
      setError("Area Name is required");
      return false;
    }
    setError("");
    return true;
  };

  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (validate()) {
      try {
        await createSalesArea(formData);
        queryClient.invalidateQueries({ queryKey: ["salesAreas"] });
        setOpen(true);
      } catch (error) {
        console.error(error);
        setErrorMessage(
          error?.response?.data?.message ||
          "Failed to add Sales Area Please try again."
        );
        setErrorOpen(true);
      }
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper
        sx={{
          p: theme.spacing(3),
          maxWidth: "500px",
          width: "100%",
          boxShadow: 2,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>
          Sales Area Setup
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Area Name"
            name="name"
            size="small"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            error={!!error}
            helperText={error}
          />
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 2 : 0, }}>
          <Button onClick={() => navigate(-1)}>Back</Button>

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
      <AddedConfirmationModal
        open={open}
        title="Success"
        content="Sales area has been added successfully!"
        addFunc={async () => { }}
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
