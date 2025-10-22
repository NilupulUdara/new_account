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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import theme from "../../../../theme";
import { createTaxGroup, getTaxTypes } from "../../../../api/Tax/taxServices";
import AddedConfirmationModal from "../../../../components/AddedConfirmationModal";
import ErrorModal from "../../../../components/ErrorModal";

interface TaxType {
  id: number;
  description: string;
  default_rate: number;
}


interface TaxGroupFormData {
  description: string;
  selectedTaxTypeIds: number[];
  shippingTaxMap: { [taxTypeId: number]: boolean };
}

export default function AddTaxGroupsForm() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));


  const [formData, setFormData] = useState<TaxGroupFormData>({
    description: "",
    selectedTaxTypeIds: [],
    shippingTaxMap: {},
  });

  const [taxTypes, setTaxTypes] = useState<TaxType[]>([]);

  useEffect(() => {
    const fetchTaxTypes = async () => {
      try {
        const data = await getTaxTypes();
        setTaxTypes(data);
      } catch (error) {
        // Optionally handle error
      }
    };
    fetchTaxTypes();
  }, []);

  const [errors, setErrors] = useState<Partial<TaxGroupFormData>>({});
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleTaxTypeToggle = (id: number) => {
    setFormData((prev) => {
      const selected = prev.selectedTaxTypeIds.includes(id)
        ? prev.selectedTaxTypeIds.filter((tid) => tid !== id)
        : [...prev.selectedTaxTypeIds, id];
      // If unchecking, also remove shipping tax for that tax type
      const newShippingTaxMap = { ...prev.shippingTaxMap };
      if (!selected.includes(id)) {
        delete newShippingTaxMap[id];
      }
      return { ...prev, selectedTaxTypeIds: selected, shippingTaxMap: newShippingTaxMap };
    });
  };

  const handleShippingTaxToggle = (id: number) => {
    setFormData((prev) => {
      // Only allow shipping tax if tax type is selected
      if (!prev.selectedTaxTypeIds.includes(id)) return prev;
      return {
        ...prev,
        shippingTaxMap: {
          ...prev.shippingTaxMap,
          [id]: !prev.shippingTaxMap[id],
        },
      };
    });
  };


  const validate = (): boolean => {
    const newErrors: Partial<TaxGroupFormData> = {};
    if (!formData.description) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async () => {
    if (validate()) {
      try {
        // The backend expects: description, tax (boolean), shipping_tax (number)
        // We'll use the first selected tax type as the main tax, and shipping tax as 1 if any shipping tax is checked
        const payload = {
          description: formData.description,
          tax: formData.selectedTaxTypeIds.length > 0, // true if any tax type selected
          shipping_tax: Object.values(formData.shippingTaxMap).some(Boolean) ? 1 : 0, // 1 if any shipping tax checked
        };
        await createTaxGroup(payload);
        // If you want to send the full custom payload, use:
        // await createTaxGroup({ ...payload, tax_type_ids: formData.selectedTaxTypeIds, shipping_tax_map: formData.shippingTaxMap });
        setOpen(true);
      } catch (error) {
        console.error("Error creating tax group:", error);
        setErrorMessage(
          error?.response?.data?.message ||
            "Failed to create Tax Group. Please try again."
        );
        setErrorOpen(true);
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
          Tax Group Setup
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

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tax Type</TableCell>
                  <TableCell>Rate (%)</TableCell>
                  <TableCell align="center">Select</TableCell>
                  <TableCell align="center">Shipping Tax</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {taxTypes.map((tax) => (
                  <TableRow key={tax.id}>
                    <TableCell>{tax.description}</TableCell>
                    <TableCell>{tax.default_rate}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={formData.selectedTaxTypeIds.includes(tax.id)}
                        onChange={() => handleTaxTypeToggle(tax.id)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={!!formData.shippingTaxMap[tax.id]}
                        disabled={!formData.selectedTaxTypeIds.includes(tax.id)}
                        onChange={() => handleShippingTaxToggle(tax.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
          >
            Add New
          </Button>
        </Box>
      </Paper>

      <AddedConfirmationModal
        open={open}
        title="Success"
        content="Tax Group has been added successfully!"
        addFunc={async () => {}} 
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
