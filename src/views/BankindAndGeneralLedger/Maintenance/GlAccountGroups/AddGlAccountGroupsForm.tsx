import React, { useState } from "react";
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

interface GlAccountGroupData {
    id: string;
    name: string;
    subGroup: string;
    class: string;
}

export default function AddGlAccountGroupsForm() {
    const [formData, setFormData] = useState<GlAccountGroupData>({
        id: "",
        name: "",
        subGroup: "",
        class: "",
    });

    const [errors, setErrors] = useState<Partial<GlAccountGroupData>>({});
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

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

    const handleSubmit = () => {
        if (validate()) {
            console.log("Submitted GL Account Group:", formData);
            alert("GL Account Group added successfully!");
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
                    Add GL Account Groups
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
                            <MenuItem value="Sub1">SUb 1</MenuItem>
                        </Select>
                        <FormHelperText>{errors.subGroup || " "}</FormHelperText>
                    </FormControl>

                    <FormControl size="small" fullWidth error={!!errors.class}>
                        <InputLabel>Class</InputLabel>
                        <Select
                            name="class"
                            value={formData.class}
                            onChange={handleSelectChange}
                            label="Sub Group"
                        >
                            <MenuItem value="Assets">Assets</MenuItem>
                            <MenuItem value="Liabilities">Liabilities</MenuItem>
                            <MenuItem value="Income">Income</MenuItem>
                            <MenuItem value="Costs">Costs</MenuItem>
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
                    <Button onClick={() => window.history.back()}>Back</Button>

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
