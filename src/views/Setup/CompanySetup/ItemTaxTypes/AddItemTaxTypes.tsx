import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import theme from "../../../../theme";
import { createItemTaxType } from "../../../../api/ItemTaxType/ItemTaxTypeApi";
import AddedConfirmationModal from "../../../../components/AddedConfirmationModal";
import ErrorModal from "../../../../components/ErrorModal";

interface ItemTaxTypeFormData {
  description: string;
  isFullyTaxExempt: boolean;
}

export default function AddItemTaxTypes() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const [formData, setFormData] = useState<ItemTaxTypeFormData>({
    description: "",
    isFullyTaxExempt: false,
  });

  const [errors, setErrors] = useState<Partial<ItemTaxTypeFormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validate = (): boolean => {
    const newErrors: Partial<ItemTaxTypeFormData> = {};

    if (!formData.description) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        const payload = {
          name: formData.description,
          exempt: formData.isFullyTaxExempt,
        };

        await createItemTaxType(payload);
        setOpen(true);
      } catch (error) {
        console.error(error);
        setErrorMessage(
          error?.response?.data?.message ||
          "Failed to add Item Tax Type Please try again."
        );
        setErrorOpen(true);
      }
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: 2 }}>
      <Paper
        sx={{
          p: theme.spacing(3),
          width: "100%",
          maxWidth: isMobile ? "100%" : "500px",
          boxShadow: 2,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}
        >
          Item Tax Type Setup
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Description"
            name="description"
            size="small"
            fullWidth
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
          />

          <FormControlLabel
            control={
              <Checkbox
                name="isFullyTaxExempt"
                checked={formData.isFullyTaxExempt}
                onChange={handleChange}
              />
            }
            label="Is Fully Tax-exempt"
          />
        </Stack>

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            gap: 2,
            mt: 3,
          }}
        >
          <Button
            fullWidth={isMobile}
            onClick={() => window.history.back()}
            variant="outlined"
          >
            Back
          </Button>

          <Button
            fullWidth={isMobile}
            variant="contained"
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
        content="Item Tax Type has been added successfully!"
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
