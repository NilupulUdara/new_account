import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";

interface TrialBalanceFormData {
  startDate: string;
  endDate: string;
  zeroValues: string;
  onlyBalances: string;
  dimension: string;
  comments: string;
  orientation: string;
  destination: string;
}

export default function TrialBalanceForm() {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const [formData, setFormData] = useState<TrialBalanceFormData>({
    startDate: "",
    endDate: "",
    zeroValues: "no",
    onlyBalances: "no",
    dimension: "",
    comments: "",
    orientation: "Portrait",
    destination: "Print",
  });

  const [errors, setErrors] = useState<Partial<TrialBalanceFormData>>({});
  const [dimensions] = useState<any[]>([
    { id: '1', name: 'Dimension 1' },
    { id: '2', name: 'Dimension 2' },
  ]);

  // Set default values when data loads
  useEffect(() => {
    if (dimensions.length > 0 && !formData.dimension) {
      setFormData(prev => ({
        ...prev,
        dimension: String(dimensions[0]?.id || ""),
      }));
    }
  }, [dimensions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Simple validation
  const validate = () => {
    let newErrors: Partial<TrialBalanceFormData> = {};

    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = () => {
    if (!validate()) return;

    console.log("GENERATING REPORT WITH DATA:", formData);
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper
        sx={{
          p: 3,
          maxWidth: "650px",
          width: "100%",
          boxShadow: 2,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}
        >
          Trial Balance Report
        </Typography>

        <Stack spacing={2}>
          {/* Start Date */}
          <TextField
            label="Start Date"
            name="startDate"
            type="date"
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            error={!!errors.startDate}
            helperText={errors.startDate}
          />

          {/* End Date */}
          <TextField
            label="End Date"
            name="endDate"
            type="date"
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            error={!!errors.endDate}
            helperText={errors.endDate}
          />

          {/* Zero Values */}
          <TextField
            label="Zero Values"
            name="zeroValues"
            size="small"
            fullWidth
            select
            value={formData.zeroValues}
            onChange={(e) => setFormData({ ...formData, zeroValues: e.target.value })}
          >
            <MenuItem value="no">No</MenuItem>
            <MenuItem value="yes">Yes</MenuItem>
          </TextField>

          {/* Only Balances */}
          <TextField
            label="Only Balances"
            name="onlyBalances"
            size="small"
            fullWidth
            select
            value={formData.onlyBalances}
            onChange={(e) => setFormData({ ...formData, onlyBalances: e.target.value })}
          >
            <MenuItem value="no">No</MenuItem>
            <MenuItem value="yes">Yes</MenuItem>
          </TextField>

          {/* Dimension dropdown */}
          <TextField
            label="Dimension"
            name="dimension"
            size="small"
            fullWidth
            select
            value={formData.dimension}
            onChange={(e) => setFormData({ ...formData, dimension: e.target.value })}
          >
            <MenuItem value="no">No Dimension Filter</MenuItem>
            {dimensions.map((dimension) => (
              <MenuItem key={dimension.id} value={dimension.id}>
                {dimension.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Comments */}
          <TextField
            label="Comments"
            name="comments"
            size="small"
            fullWidth
            multiline
            minRows={3}
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
          />

          {/* Orientation */}
          <TextField
            label="Orientation"
            name="orientation"
            size="small"
            fullWidth
            select
            value={formData.orientation}
            onChange={(e) => setFormData({ ...formData, orientation: e.target.value })}
          >
            <MenuItem value="Portrait">Portrait</MenuItem>
            <MenuItem value="Landscape">Landscape</MenuItem>
          </TextField>

          {/* Destination */}
          <TextField
            label="Destination"
            name="destination"
            size="small"
            fullWidth
            select
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
          >
            <MenuItem value="Print">PDF/Printer</MenuItem>
            <MenuItem value="Excel">Excel</MenuItem>
          </TextField>
        </Stack>

        {/* Buttons */}
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
            onClick={handleGenerate}
          >
            Generate
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
