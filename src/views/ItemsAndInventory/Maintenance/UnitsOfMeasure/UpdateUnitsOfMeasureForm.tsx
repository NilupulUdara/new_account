import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import theme from "../../../../theme";
import { getItemUnit, updateItemUnit } from "../../../../api/ItemUnit/ItemUnitApi";
import { useParams, useNavigate } from "react-router-dom";

interface UnitsOfMeasureFormData {
  unitAbbreviation: string;
  descriptionName: string;
  decimalPlaces: string;
}

export default function UpdateUnitsOfMeasureForm() {
  const { id } = useParams<{ id: string }>();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [formData, setFormData] = useState<UnitsOfMeasureFormData>({
    unitAbbreviation: "",
    descriptionName: "",
    decimalPlaces: "",
  });
  const [errors, setErrors] = useState<Partial<UnitsOfMeasureFormData>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch existing data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setFetching(true);
        const response = await getItemUnit(Number(id));

        // Handle both plain and wrapped responses
        const unitData = response?.data ?? response;

        setFormData({
          unitAbbreviation: unitData.abbr ?? "",
          descriptionName: unitData.name ?? "",
          decimalPlaces: String(unitData.decimals ?? "0"),
        });
      } catch (error) {
        console.error("Failed to fetch Item Unit:", error);
        alert("Failed to load unit data. Please check backend.");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: Partial<UnitsOfMeasureFormData> = {};
    if (!formData.unitAbbreviation.trim()) newErrors.unitAbbreviation = "Unit Abbreviation is required";
    if (!formData.descriptionName.trim()) newErrors.descriptionName = "Description Name is required";
    if (formData.decimalPlaces === "") newErrors.decimalPlaces = "Please select decimal places";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !id) return;

    const payload = {
      abbr: formData.unitAbbreviation,
      name: formData.descriptionName,
      decimals: Number(formData.decimalPlaces),
    };

    try {
      setLoading(true);
      await updateItemUnit(Number(id), payload);
      alert("Item Unit updated successfully!");
      navigate(-1);
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes("UniqueConstraintViolation")) {
        alert("Unit abbreviation or name already exists!");
      } else {
        alert("Failed to update Item Unit. Check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Stack alignItems="center" sx={{ mt: 10 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading unit data...
        </Typography>
      </Stack>
    );
  }

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
          Update Units of Measure
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Unit Abbreviation"
            name="unitAbbreviation"
            size="small"
            fullWidth
            value={formData.unitAbbreviation}
            onChange={handleInputChange}
            error={!!errors.unitAbbreviation}
            helperText={errors.unitAbbreviation || " "}
          />

          <TextField
            label="Description Name"
            name="descriptionName"
            size="small"
            fullWidth
            value={formData.descriptionName}
            onChange={handleInputChange}
            error={!!errors.descriptionName}
            helperText={errors.descriptionName || " "}
          />

          <FormControl size="small" fullWidth error={!!errors.decimalPlaces}>
            <InputLabel>Decimal Places</InputLabel>
            <Select
              name="decimalPlaces"
              value={formData.decimalPlaces}
              onChange={handleSelectChange}
              label="Decimal Places"
            >
              {Array.from({ length: 6 }, (_, i) => (
                <MenuItem key={i} value={String(i)}>
                  {i}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.decimalPlaces || " "}</FormHelperText>
          </FormControl>
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
          <Button onClick={() => navigate(-1)}>Back</Button>

          <Button
            variant="contained"
            fullWidth={isMobile}
            sx={{ backgroundColor: "var(--pallet-blue)" }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
