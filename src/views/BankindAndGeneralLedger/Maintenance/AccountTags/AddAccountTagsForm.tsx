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
import { createAccountTag } from "../../../../api/AccountTag/AccountTagsApi"; 
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

interface AccountTagsFormData {
  tagName: string;
  tagDescription: string;
}

export default function AddAccountTagsForm() {
  const [formData, setFormData] = useState<AccountTagsFormData>({
    tagName: "",
    tagDescription: "",
  });

  const [errors, setErrors] = useState<Partial<AccountTagsFormData>>({});
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = (): boolean => {
    const newErrors: Partial<AccountTagsFormData> = {};

    if (!formData.tagName) newErrors.tagName = "Tag Name is required";
    if (!formData.tagDescription)
      newErrors.tagDescription = "Tag Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const payload = {
        name: formData.tagName,
        description: formData.tagDescription,
        type: 1,
        inactive: false, 
      };

      const tag = await createAccountTag(payload);

      alert("Account Tag added successfully!");
      console.log("Created tag:", tag);

      queryClient.invalidateQueries({ queryKey: ["accountTags"] });

      setFormData({
        tagName: "",
        tagDescription: "",
      });
      setErrors({});

      navigate("/bankingandgeneralledger/maintenance/account-tags");
    } catch (err: any) {
      alert("Error creating account tag: " + JSON.stringify(err));
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt: 4, px: 2 }}>
      <Paper
        sx={{
          p: theme.spacing(3),
          maxWidth: "600px",
          width: "100%",
          boxShadow: 2,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}
        >
          Add Account Tag
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Tag Name"
            name="tagName"
            size="small"
            fullWidth
            value={formData.tagName}
            onChange={handleChange}
            error={!!errors.tagName}
            helperText={errors.tagName}
          />

          <TextField
            label="Tag Description"
            name="tagDescription"
            size="small"
            fullWidth
            multiline
            rows={3}
            value={formData.tagDescription}
            onChange={handleChange}
            error={!!errors.tagDescription}
            helperText={errors.tagDescription}
          />
        </Stack>

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            mt: 3,
            gap: isMobile ? 2 : 0,
          }}
        >
          <Button
            fullWidth={isMobile}
            onClick={() => navigate("/bankingandgeneralledger/maintenance/account-tags")}
            variant={isMobile ? "outlined" : "text"}
          >
            Back
          </Button>

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
    </Stack>
  );
}
