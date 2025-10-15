import React, { useState, useEffect } from "react";
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
import theme from "../../../../theme";
import { getClassTypes } from "../../../../api/GLAccounts/ClassTypeApi";
import { createChartClass } from "../../../../api/GLAccounts/ChartClassApi";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ErrorModal from "../../../../components/ErrorModal";
import AddedConfirmationModal from "../../../../components/AddedConfirmationModal";

interface GlAccountClassData {
  cid?: string;
  class_name?: string;
  ctype?: string;
  inactive?: boolean;
}

export default function AddGlAccountClassesForm() {
  const [formData, setFormData] = useState<GlAccountClassData>({
    cid: "",
    class_name: "",
    ctype: "",
    inactive: false,
  });
const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<Partial<GlAccountClassData>>({});
  const [classTypes, setClassTypes] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    getClassTypes().then((res) => setClassTypes(res));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSelectChange = (e: any) => {
    const { value } = e.target;
    setFormData({ ...formData, ctype: value });
    setErrors({ ...errors, ctype: "" });
  };

  const validate = () => {
    const newErrors: Partial<GlAccountClassData> = {};
    if (!formData.cid) newErrors.cid = "Class ID is required";
    if (!formData.class_name) newErrors.class_name = "Class name is required";
    if (formData.ctype === "") newErrors.ctype = "Select class type";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await createChartClass(formData);
      await queryClient.refetchQueries({ queryKey: ["glAccountClasses"] });
     setOpen(true);
    } catch (error) {
      setErrorMessage(
          error?.response?.data?.message ||
          "Failed to add GL Account Class Please try again."
        );
        setErrorOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
      <Paper sx={{ p: theme.spacing(3), maxWidth: "600px", width: "100%", boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}>
          Add GL Account Classes
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="ID"
            name="cid"
            size="small"
            fullWidth
            value={formData.cid}
            onChange={handleInputChange}
            error={!!errors.cid}
            helperText={errors.cid || " "}
          />

          <TextField
            label="Class Name"
            name="class_name"
            size="small"
            fullWidth
            value={formData.class_name}
            onChange={handleInputChange}
            error={!!errors.class_name}
            helperText={errors.class_name || " "}
          />

          <FormControl size="small" fullWidth error={!!errors.ctype}>
            <InputLabel>Class Type</InputLabel>
            <Select name="ctype" value={formData.ctype} onChange={handleSelectChange} label="Class Type">
              {classTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.type_name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.ctype || " "}</FormHelperText>
          </FormControl>
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 2 : 0 }}>
          <Button onClick={() => window.history.back()}>Back</Button>
          <Button 
            variant="contained" 
            fullWidth={isMobile} 
            sx={{ backgroundColor: "var(--pallet-blue)" }} 
            onClick={handleSubmit}
            disabled={isSubmitting} // Disable while submitting
          >
            {isSubmitting ? "Adding..." : "Add New"}
          </Button>
        </Box>
      </Paper>
      <AddedConfirmationModal
              open={open}
              title="Success"
              content="GL Account Class has been added successfully!"
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