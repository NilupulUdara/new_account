import React, { useState, useEffect } from "react";
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
import { getItemTaxType, updateItemTaxType } from "../../../../api/ItemTaxType/ItemTaxTypeApi";
import { useParams, useNavigate } from "react-router-dom";
import UpdateConfirmationModal from "../../../../components/UpdateConfirmationModal"
import ErrorModal from "../../../../components/ErrorModal";

interface ItemTaxTypeFormData {
  description: string;
  isFullyTaxExempt: boolean;
}

interface UpdateItemTaxTypesProps {
  id: string | number; // ID of the item tax type to update
}

export default function UpdateItemTaxTypes() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { id } = useParams<{ id: string }>();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const [formData, setFormData] = useState<ItemTaxTypeFormData>({
    description: "",
    isFullyTaxExempt: false,
  });
  const [errors, setErrors] = useState<Partial<ItemTaxTypeFormData>>({});
  const [loading, setLoading] = useState(false);

  // Fetch existing data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const data = await getItemTaxType(id);
        setFormData({
          description: data.name,
          isFullyTaxExempt: data.exempt,
        });
      } catch (error) {
        console.error("Failed to fetch Item Tax Type:", error);
      }
    };
    fetchData();
  }, [id]);

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
      const payload = {
        name: formData.description,
        exempt: formData.isFullyTaxExempt,
      };

      try {
        setLoading(true);
        await updateItemTaxType(id, payload);
        setOpen(true);
      } catch (error) {
        setErrorMessage(
          error?.response?.data?.message ||
          "Failed to update item tax type Please try again."
        );
        setErrorOpen(true);
        console.error(error);
      } finally {
        setLoading(false);
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
          Update Item Tax Type
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
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </Button>
        </Box>
      </Paper>
      <UpdateConfirmationModal
        open={open}
        title="Success"
        content="Item Tax Type has been updated successfully!"
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
