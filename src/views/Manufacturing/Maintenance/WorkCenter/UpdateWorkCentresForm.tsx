import React, { useEffect, useState } from "react";
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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import theme from "../../../../theme";
import { getWorkCentre, updateWorkCentre } from "../../../../api/WorkCentre/WorkCentreApi";
import { useParams, useNavigate } from "react-router-dom";

interface WorkCentresFormData {
  name: string;
  description: string;
}

interface UpdateWorkCentreProps {
  id: string | number; // ID of the item tax type to update
}

export default function UpdateWorkCentresForm() {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<WorkCentresFormData>({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState<Partial<WorkCentresFormData>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const data = await getWorkCentre(id);
        setFormData({
          name: data.name,
          description: data.description,
        });
      } catch (error) {
        console.error("Failed to fetch Work Centre:", error);
      }
    };
    fetchData();
  }, [id]);

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors: Partial<WorkCentresFormData> = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.description) newErrors.description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      const payload = {
        name: formData.name,
        description: formData.description,
      };

      try {
        setLoading(true);
        await updateWorkCentre(id, payload);
        alert("Work Centre updated successfully!");
        window.history.back();
      } catch (error) {
        console.error(error);
        alert("Failed to update Work Centre");
      } finally {
        setLoading(false);
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
          Work Centres Setup
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Name"
            name="name"
            size="small"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            error={!!errors.name}
            helperText={errors.name || " "}
          />

          <TextField
            label="Description"
            name="description"
            size="small"
            fullWidth
            value={formData.description}
            onChange={handleInputChange}
            error={!!errors.description}
            helperText={errors.description || " "}
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
    </Stack>
  );
}
