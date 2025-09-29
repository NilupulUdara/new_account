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

interface StandardCostFormData {
  unitCost: string;
  referenceLine: string;
  memo: string;
}

export default function AddStandardCostForm() {
  const [formData, setFormData] = useState<StandardCostFormData>({
    unitCost: "",
    referenceLine: "",
    memo: "",
  });

  const [errors, setErrors] = useState<Partial<StandardCostFormData>>({});
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors: Partial<StandardCostFormData> = {};
    if (!formData.unitCost) newErrors.unitCost = "Unit Cost is required";
    if (!formData.referenceLine) newErrors.referenceLine = "Reference Line is required";
    if (!formData.memo) newErrors.memo = "Memo is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log("Standard Cost Submitted:", formData);
      alert("Standard Cost added successfully!");
      setFormData({
        unitCost: "",
        referenceLine: "",
        memo: "",
      });
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
          Add Standard Cost
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Unit Cost"
            name="unitCost"
            size="small"
            fullWidth
            type="number"
            value={formData.unitCost}
            onChange={handleInputChange}
            error={!!errors.unitCost}
            helperText={errors.unitCost}
          />

          <TextField
            label="Reference Line"
            name="referenceLine"
            size="small"
            fullWidth
            value={formData.referenceLine}
            onChange={handleInputChange}
            error={!!errors.referenceLine}
            helperText={errors.referenceLine}
          />

          <TextField
            label="Memo"
            name="memo"
            size="small"
            fullWidth
            multiline
            rows={3}
            value={formData.memo}
            onChange={handleInputChange}
            error={!!errors.memo}
            helperText={errors.memo}
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
            Add Standard Cost
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
