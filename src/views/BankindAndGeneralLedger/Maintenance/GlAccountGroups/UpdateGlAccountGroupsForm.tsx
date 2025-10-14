import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import theme from "../../../../theme";
import { getChartClasses } from "../../../../api/GLAccounts/ChartClassApi";
import { getChartTypes, getChartType, updateChartType } from "../../../../api/GLAccounts/ChartTypeApi";

interface GlAccountGroupData {
  id: string;
  name: string;
  subGroup: string;
  class: string;
}

export default function UpdateGlAccountGroupsForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const [formData, setFormData] = useState<GlAccountGroupData>({
    id: "",
    name: "",
    subGroup: "",
    class: "",
  });

  const [errors, setErrors] = useState<Partial<GlAccountGroupData>>({});
  const [chartTypes, setChartTypes] = useState<any[]>([]);
  const [chartClasses, setChartClasses] = useState<any[]>([]);

  // Fetch chart classes
  useEffect(() => {
    const fetchChartClasses = async () => {
      try {
        const data = await getChartClasses();
        setChartClasses(data);
      } catch (error) {
        console.error("Failed to load chart classes:", error);
      }
    };
    fetchChartClasses();
  }, []);

  // Fetch chart types
  useEffect(() => {
    const fetchChartTypes = async () => {
      try {
        const data = await getChartTypes();
        setChartTypes(data);
      } catch (error) {
        console.error("Failed to load chart types:", error);
      }
    };
    fetchChartTypes();
  }, []);

  // Fetch existing GL Account Group data
  useEffect(() => {
    if (!id) return;
    const fetchGlAccountGroup = async () => {
      try {
        const res = await getChartType(id);
        setFormData({
          id: res.id,
          name: res.name,
          subGroup: res.parent || "None",
          class: res.class_id,
        });
      } catch (error) {
        console.error("Failed to fetch GL Account Group:", error);
      }
    };
    fetchGlAccountGroup();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors: Partial<GlAccountGroupData> = {};
    if (!formData.id) newErrors.id = "ID is required";
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.subGroup) newErrors.subGroup = "Sub Group is required";
    if (!formData.class) newErrors.class = "Class is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const payload = {
        id: formData.id,
        name: formData.name,
        sub_group: formData.subGroup === "None" ? null : formData.subGroup,
        class: formData.class,
      };

      await updateChartType(formData.id, payload);
      alert("GL Account Group updated successfully!");
      navigate(-1); // Go back after update
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update GL Account Group");
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
          Update GL Account Group
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
            helperText={errors.id || " "}
            disabled
          />

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

          <FormControl size="small" fullWidth error={!!errors.subGroup}>
            <InputLabel>Sub Group of</InputLabel>
            <Select
              name="subGroup"
              value={formData.subGroup}
              onChange={handleSelectChange}
              label="Sub Group"
            >
              <MenuItem value="None">None</MenuItem>
              {chartTypes
                .slice()
                .sort((a, b) => Number(a.id) - Number(b.id))
                .map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
            </Select>
            <FormHelperText>{errors.subGroup || " "}</FormHelperText>
          </FormControl>

          <FormControl size="small" fullWidth error={!!errors.class}>
            <InputLabel>Class</InputLabel>
            <Select
              name="class"
              value={formData.class}
              onChange={handleSelectChange}
              label="Class"
            >
              {chartClasses.map((chartClass) => (
                <MenuItem key={chartClass.cid} value={chartClass.cid}>
                  {chartClass.class_name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.class || " "}</FormHelperText>
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
          >
            Update
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
