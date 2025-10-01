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
import { useNavigate } from "react-router-dom";
import theme from "../../../../../theme";

interface ItemReOderlevelProps {
  itemId?: string | number;
}

interface ReOrderLevelsFormData {
  location: string;
  quantityOnHand: string;
  reorderLevel: string;
}

export default function ReOrderLevelsForm({ itemId }: ItemReOderlevelProps) {
  const [formData, setFormData] = useState<ReOrderLevelsFormData>({
    location: "Main Warehouse", // example pre-filled value
    quantityOnHand: "150", // example pre-filled value
    reorderLevel: "",
  });

  const [errors, setErrors] = useState<Partial<ReOrderLevelsFormData>>({});
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors: Partial<ReOrderLevelsFormData> = {};
    if (!formData.reorderLevel) newErrors.reorderLevel = "Reorder Level is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log("Reorder Level Submitted:", formData);
      alert("Reorder Level updated successfully!");
      setFormData({ ...formData, reorderLevel: "" }); // reset only reorderLevel
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
          Add / Update Reorder Level
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Location"
            name="location"
            size="small"
            fullWidth
            value={formData.location}
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="Quantity on Hand"
            name="quantityOnHand"
            size="small"
            fullWidth
            value={formData.quantityOnHand}
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="Reorder Level"
            name="reorderLevel"
            size="small"
            fullWidth
            type="number"
            value={formData.reorderLevel}
            onChange={handleInputChange}
            error={!!errors.reorderLevel}
            helperText={errors.reorderLevel}
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
          <Button onClick={() => navigate("/itemsandinventory/maintenance/items")}>
            Back
          </Button>

          <Button
            variant="contained"
            fullWidth={isMobile}
            sx={{ backgroundColor: "var(--pallet-blue)" }}
            onClick={handleSubmit}
          >
            Add Reorder Level
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
