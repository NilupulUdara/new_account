import React, { useState, useEffect } from "react";
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
import { getSalesGroup, updateSalesGroup } from "../../../../api/SalesMaintenance/salesService";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import UpdateConfirmationModal from "../../../../components/UpdateConfirmationModal"
import ErrorModal from "../../../../components/ErrorModal";
import useFormPersist from "../../../../hooks/useFormPersist";
interface SalesGroupFormData {
  groupName: string;
}

export default function UpdateSalesGroupsForm() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { id } = useParams<{ id: string }>();
  // Use a unique storage key for each sales group being edited
  const [formData, setFormData, clearFormData] = useFormPersist<SalesGroupFormData>(
    `update-sales-group-${id}`,
    { groupName: "" }
  );

  const [error, setError] = useState<string>("");
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    // Only load from API if the form doesn't already have user-edited data
    if (!formData.groupName) {
      getSalesGroup(Number(id))
        .then((res) => setFormData({ groupName: res.name }))
        .catch((err) => {
          console.error(err);
          setErrorMessage(
            err?.response?.data?.message ||
            "Failed to load sales group Please try again."
          );
          setErrorOpen(true);
        });
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({ groupName: value });
  };

  const validate = () => {
    if (!formData.groupName.trim()) {
      setError("Group Name is required");
      return false;
    }
    setError("");
    return true;
  };

  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!id) return;
    if (validate()) {
      try {
        await updateSalesGroup(Number(id), { name: formData.groupName });
        queryClient.invalidateQueries({ queryKey: ["salesGroups"] });
        // Clear persisted form data on successful update
        clearFormData();
        setOpen(true);
      } catch (error) {
        console.error(error);
        setErrorMessage(
          error?.response?.data?.message ||
          "Failed to update Sales Group Please try again."
        );
        setErrorOpen(true);
      }
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
        <Typography
          variant="h6"
          sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}
        >
          Sales Group Setup
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Group Name"
            name="groupName"
            size="small"
            fullWidth
            value={formData.groupName}
            onChange={handleInputChange}
            error={!!error}
            helperText={error}
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
          <Button onClick={() => {
            // Ask user if they want to save the data for later or discard it
            if (formData.groupName && !confirm("Do you want to save your progress for later?")) {
              clearFormData();
            }
            window.history.back();
          }}>Back</Button>

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
      <UpdateConfirmationModal
        open={open}
        title="Success"
        content="Sales Group has been updated successfully!"
        handleClose={() => setOpen(false)}
        onSuccess={() => {
          // Form was already cleared on successful update
          window.history.back();
        }}
      />

      <ErrorModal
        open={errorOpen}
        onClose={() => setErrorOpen(false)}
        message={errorMessage}
      />
    </Stack>
  );
}
